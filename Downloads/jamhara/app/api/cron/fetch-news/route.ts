/**
 * /api/cron/fetch-news
 * ─────────────────────────────────
 * يُنفَّذ كل 15 دقيقة عبر cron-job.org
 * يجلب أحدث الأخبار من GNews (سياسة + اقتصاد — العالم العربي والشرق الأوسط)
 * يُعيد صياغتها بالعربية ويحفظها — مع منع التكرار بـ source_url
 */

import { NextRequest, NextResponse } from "next/server";
import { CONTENT_MODEL } from "@/lib/ai-config";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildNewsPrompt } from "@/lib/prompts/types/news";
import { extractJSON } from "@/lib/json-utils";

export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return true;
  const auth = (req.headers.get("authorization") ?? "").trim();
  return auth === `Bearer ${secret}`;
}

// ── قائمة استعلامات GNews ──────────────────────────────────────────────────
// يتناوب بين العربية (lang=ar) والإنجليزية (MENA focus) في كل دورة
const GNEWS_QUERIES = [
  // أخبار عربية — سياسة
  { lang: "ar", endpoint: "top-headlines", params: { topic: "politics", max: "6" } },
  // أخبار عربية — اقتصاد
  { lang: "ar", endpoint: "top-headlines", params: { topic: "business", max: "6" } },
  // أخبار إنجليزية — شرق أوسط سياسة
  { lang: "en", endpoint: "search", params: { q: "Middle East OR Arab political news", max: "5" } },
  // أخبار إنجليزية — شرق أوسط اقتصاد
  { lang: "en", endpoint: "search", params: { q: "Arab economy OR Gulf economy OR MENA economy", max: "5" } },
];

interface GNewsArticle {
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  image: string | null;
  publishedAt: string;
  source: { name: string; url: string };
}

async function fetchQuery(key: string, q: typeof GNEWS_QUERIES[0]): Promise<GNewsArticle[]> {
  try {
    const paramObj: Record<string, string> = { token: key, lang: q.lang };
    for (const [k, v] of Object.entries(q.params)) {
      if (v !== undefined) paramObj[k] = v;
    }
    const params = new URLSearchParams(paramObj);
    const res = await fetch(`https://gnews.io/api/v4/${q.endpoint}?${params}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { articles?: GNewsArticle[] };
    return data.articles ?? [];
  } catch {
    return [];
  }
}

async function rewriteArticle(article: GNewsArticle): Promise<{ title_ar: string; body_ar: string } | null> {
  const prompt = buildNewsPrompt({
    title: article.title,
    description: article.description ?? "",
    content: article.content ?? article.description ?? "",
    sourceName: article.source.name,
  });
  try {
    const response = await anthropic.messages.create({
      model: CONTENT_MODEL,
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.content
      .filter(b => b.type === "text")
      .map(b => (b as { type: "text"; text: string }).text)
      .join("");
    const parsed = extractJSON(text);
    if (!parsed?.title_ar || !parsed?.body_ar) return null;
    return { title_ar: String(parsed.title_ar), body_ar: String(parsed.body_ar) };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = process.env.GNEWS_API_KEY;
  if (!key) return NextResponse.json({ error: "GNEWS_API_KEY not set" }, { status: 500 });

  const supabase = createAdminClient();

  // جلب تصنيف الأخبار
  const { data: cat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "news")
    .single();
  if (!cat) return NextResponse.json({ error: "News category not found" }, { status: 500 });

  // جلب كل المقالات من جميع الاستعلامات بالتوازي
  const allResults = await Promise.all(GNEWS_QUERIES.map(q => fetchQuery(key, q)));
  const rawArticles: GNewsArticle[] = allResults.flat();

  // إزالة المكررات بالـ URL داخل الدفعة
  const seen = new Set<string>();
  const uniqueArticles = rawArticles.filter(a => {
    if (!a.url || seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });

  if (!uniqueArticles.length) {
    return NextResponse.json({ success: true, saved: 0, message: "No articles fetched" });
  }

  // فحص التكرار في DB
  const urls = uniqueArticles.map(a => a.url);
  const { data: existing } = await supabase
    .from("posts")
    .select("source_url")
    .in("source_url", urls);
  const existingUrls = new Set((existing ?? []).map(p => p.source_url));

  const newArticles = uniqueArticles.filter(a => !existingUrls.has(a.url));

  if (!newArticles.length) {
    return NextResponse.json({ success: true, saved: 0, message: "All articles already exist" });
  }

  // معالجة أقصى 6 مقالات لتجنب timeout
  const toProcess = newArticles.slice(0, 6);
  const results = { saved: 0, failed: 0, errors: [] as string[] };

  for (const article of toProcess) {
    const rewritten = await rewriteArticle(article);
    if (!rewritten) { results.failed++; continue; }

    const { error } = await supabase.from("posts").insert({
      title_ar: rewritten.title_ar,
      title_en: article.title,
      body_ar: rewritten.body_ar,
      type: "news" as const,
      status: "published",
      category_id: cat.id,
      image_url: article.image ?? null,
      source_url: article.url,
      content_config: {
        source_name: article.source.name,
        source_url: article.source.url,
        gnews_url: article.url,
        gnews_published_at: article.publishedAt,
      },
      quality_score: 80,
      reading_time: 1,
      published_at: new Date().toISOString(),
    });

    if (error) { results.failed++; results.errors.push(error.message); }
    else results.saved++;
  }

  return NextResponse.json({
    success: true,
    fetched: uniqueArticles.length,
    new: newArticles.length,
    processed: toProcess.length,
    ...results,
  });
}
