import { NextRequest, NextResponse } from "next/server";
import { CONTENT_MODEL } from "@/lib/ai-config";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildNewsPrompt } from "@/lib/prompts/types/news";
import { extractJSON } from "@/lib/json-utils";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
export const maxDuration = 60;

function isAuthorized(req: NextRequest) {
  const secret = process.env.GENERATE_SECRET?.trim();
  if (!secret) return true;
  const auth = (req.headers.get("authorization") ?? req.nextUrl.searchParams.get("secret") ?? "").trim();
  return auth === secret || auth === `Bearer ${secret}`;
}

// ── جلب مقالات من GNews ────────────────────────────────────────────────────
async function fetchFromGNews(query?: string): Promise<GNewsArticle[]> {
  const key = process.env.GNEWS_API_KEY;
  if (!key) throw new Error("GNEWS_API_KEY not set");

  // أولاً نحاول بالعربية، ثم بالإنجليزية مع تركيز على منطقة الشرق الأوسط
  const arParams = new URLSearchParams({
    token: key,
    lang: "ar",
    max: "5",
    ...(query ? { q: query } : { topic: "politics" }),
  });

  const enParams = new URLSearchParams({
    token: key,
    lang: "en",
    max: "5",
    q: query
      ? `${query} Middle East OR Arab`
      : "Middle East OR Arab world politics OR economy",
  });

  const arEndpoint = query ? "search" : "top-headlines";
  const enEndpoint = "search";

  const [arRes, enRes] = await Promise.allSettled([
    fetch(`https://gnews.io/api/v4/${arEndpoint}?${arParams}`),
    fetch(`https://gnews.io/api/v4/${enEndpoint}?${enParams}`),
  ]);

  const articles: GNewsArticle[] = [];

  if (arRes.status === "fulfilled" && arRes.value.ok) {
    const data = await arRes.value.json() as { articles?: GNewsArticle[] };
    articles.push(...(data.articles ?? []));
  }
  if (enRes.status === "fulfilled" && enRes.value.ok) {
    const data = await enRes.value.json() as { articles?: GNewsArticle[] };
    articles.push(...(data.articles ?? []));
  }

  return articles;
}

// ── إعادة صياغة مقال واحد بالعربية ──────────────────────────────────────────
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
    const text = response.content.filter(b => b.type === "text").map(b => (b as { type: "text"; text: string }).text).join("");
    const parsed = extractJSON(text);
    if (!parsed?.title_ar || !parsed?.body_ar) return null;
    return { title_ar: String(parsed.title_ar), body_ar: String(parsed.body_ar) };
  } catch {
    return null;
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { topic } = await req.json() as { topic?: string };
  const supabase = createAdminClient();

  // جلب تصنيف الأخبار
  const { data: cat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "news")
    .single();
  if (!cat) return NextResponse.json({ error: "News category not found" }, { status: 400 });

  // جلب المقالات من GNews
  let articles: GNewsArticle[];
  try {
    articles = await fetchFromGNews(topic);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }

  if (!articles.length) {
    return NextResponse.json({ error: "No articles found from GNews" }, { status: 404 });
  }

  // الحصول على source_urls الموجودة لتجنب التكرار
  const urls = articles.map(a => a.url).filter(Boolean);
  const { data: existing } = await supabase
    .from("posts")
    .select("source_url")
    .in("source_url", urls);
  const existingUrls = new Set((existing ?? []).map(p => p.source_url));

  // أخذ أول مقال غير مكرر
  const article = articles.find(a => !existingUrls.has(a.url));
  if (!article) {
    return NextResponse.json({ error: "All fetched articles already exist" }, { status: 409 });
  }

  // إعادة الصياغة بالعربية
  const rewritten = await rewriteArticle(article);
  if (!rewritten) {
    return NextResponse.json({ error: "Failed to rewrite article" }, { status: 500 });
  }

  // حفظ في قاعدة البيانات
  const { data: post, error: err } = await supabase
    .from("posts")
    .insert({
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
    })
    .select()
    .single();

  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ success: true, post });
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface GNewsArticle {
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  image: string | null;
  publishedAt: string;
  source: { name: string; url: string };
}
