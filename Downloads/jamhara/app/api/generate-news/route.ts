import { NextRequest, NextResponse } from "next/server";
import { CONTENT_MODEL } from "@/lib/ai-config";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildNewsPrompt } from "@/lib/prompts/types/news";
import { extractJSON } from "@/lib/json-utils";
import { normalizeTags } from "@/lib/tags";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
export const maxDuration = 60;

// ── استخراج og:image من صفحة ويب ──────────────────────────────────────────
async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    // og:image أولاً، ثم twitter:image
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
      ?? html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    const imgUrl = ogMatch?.[1]?.trim();
    if (!imgUrl) return null;
    // قبول https فقط
    return imgUrl.startsWith("https://") ? imgUrl : null;
  } catch {
    return null;
  }
}

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
    q: query ?? "سياسة OR اقتصاد OR عرب",
  });

  const enParams = new URLSearchParams({
    token: key,
    lang: "en",
    max: "5",
    q: query
      ? `${query} Middle East OR Arab`
      : "Middle East OR Arab world politics OR economy",
  });

  const arEndpoint = "search";
  const enEndpoint = "search";

  const [arRes, enRes] = await Promise.allSettled([
    fetch(`https://gnews.io/api/v4/${arEndpoint}?${arParams}`),
    fetch(`https://gnews.io/api/v4/${enEndpoint}?${enParams}`),
  ]);

  const articles: GNewsArticle[] = [];
  const debug: Record<string, unknown> = {};

  if (arRes.status === "fulfilled") {
    debug.arStatus = arRes.value.status;
    if (arRes.value.ok) {
      const data = await arRes.value.json() as { articles?: GNewsArticle[]; errors?: unknown };
      debug.arCount = data.articles?.length ?? 0;
      debug.arErrors = data.errors;
      articles.push(...(data.articles ?? []));
    } else {
      debug.arBody = await arRes.value.text();
    }
  } else {
    debug.arError = arRes.reason?.message ?? String(arRes.reason);
  }

  if (enRes.status === "fulfilled") {
    debug.enStatus = enRes.value.status;
    if (enRes.value.ok) {
      const data = await enRes.value.json() as { articles?: GNewsArticle[]; errors?: unknown };
      debug.enCount = data.articles?.length ?? 0;
      debug.enErrors = data.errors;
      articles.push(...(data.articles ?? []));
    } else {
      debug.enBody = await enRes.value.text();
    }
  } else {
    debug.enError = enRes.reason?.message ?? String(enRes.reason);
  }

  if (!articles.length) throw Object.assign(new Error("No articles from GNews"), { debug });
  return articles;
}

interface RewrittenArticle {
  title_ar: string;
  lede_ar: string;
  why_it_matters_ar?: string;
  key_points_ar?: string[];
  quote?: { text_ar: string; author_ar: string; role_ar?: string } | null;
  whats_next_ar?: string | null;
  tags?: string[];
}

// ── إعادة صياغة مقال واحد بأسلوب Axios Smart Brevity ───────────────────────
async function rewriteArticle(article: GNewsArticle): Promise<RewrittenArticle | null> {
  const prompt = buildNewsPrompt({
    title: article.title,
    description: article.description ?? "",
    content: article.content ?? article.description ?? "",
    sourceName: article.source.name,
    publishedAt: article.publishedAt,
  });

  try {
    const response = await anthropic.messages.create({
      model: CONTENT_MODEL,
      max_tokens: 1600,
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.content.filter(b => b.type === "text").map(b => (b as { type: "text"; text: string }).text).join("");
    const parsed = extractJSON(text);
    if (!parsed?.title_ar || !parsed?.lede_ar) return null;
    return {
      title_ar: String(parsed.title_ar),
      lede_ar: String(parsed.lede_ar),
      why_it_matters_ar: parsed.why_it_matters_ar ? String(parsed.why_it_matters_ar) : undefined,
      key_points_ar: Array.isArray(parsed.key_points_ar) ? parsed.key_points_ar.map(String) : undefined,
      quote: parsed.quote && parsed.quote !== null ? parsed.quote : null,
      whats_next_ar: parsed.whats_next_ar ? String(parsed.whats_next_ar) : null,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    };
  } catch {
    return null;
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    topic?: string;
    context?: string;       // نص المقال الأصلي — الوضع اليدوي
    source_url?: string;    // رابط المصدر اليدوي
  };
  const { topic, context, source_url: manualSourceUrl } = body;

  const supabase = createAdminClient();

  // جلب تصنيف الأخبار
  const { data: cat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "news")
    .single();
  if (!cat) return NextResponse.json({ error: "News category not found" }, { status: 400 });

  let article: GNewsArticle;

  if (context && context.trim().length > 30) {
    // ── الوضع اليدوي: المستخدم أدخل النص مباشرة ──────────────────────────────
    // استخراج اسم المصدر من الرابط إن وُجد
    let sourceName = "مصدر خارجي";
    let sourceUrl  = manualSourceUrl ?? "";
    if (sourceUrl) {
      try {
        const host = new URL(sourceUrl).hostname.replace(/^www\./, "");
        sourceName = host;
      } catch { /* تجاهل خطأ URL غير صالح */ }
    }

    // جلب og:image من رابط المصدر بالتوازي مع بقية التهيئة
    const ogImage = sourceUrl ? await fetchOgImage(sourceUrl) : null;

    article = {
      title:       topic?.trim() ?? context.slice(0, 80),
      description: context.slice(0, 300),
      content:     context,
      url:         sourceUrl,
      image:       ogImage,
      publishedAt: new Date().toISOString(),
      source:      { name: sourceName, url: sourceUrl },
    };
  } else {
    // ── وضع GNews: الجلب التلقائي ─────────────────────────────────────────────
    let gnewsArticles: GNewsArticle[];
    try {
      gnewsArticles = await fetchFromGNews(topic);
    } catch (e) {
      const err = e as Error & { debug?: unknown };
      return NextResponse.json({ error: err.message, debug: err.debug ?? null }, { status: 500 });
    }

    // فحص التكرار — بالـ URL + بعناوين آخر 48 ساعة
    const urls = gnewsArticles.map(a => a.url).filter(Boolean);
    const since48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const [{ data: existingByUrl }, { data: recentTitles }] = await Promise.all([
      supabase.from("posts").select("source_url").in("source_url", urls),
      supabase.from("posts").select("title_en").eq("type", "news").gte("published_at", since48h),
    ]);

    const existingUrls = new Set((existingByUrl ?? []).map(p => p.source_url));

    function normalizeTitle(t: string): string[] {
      return t.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter(w => w.length > 4);
    }
    const recentTitleWords = (recentTitles ?? []).map(p => normalizeTitle(p.title_en ?? ""));

    function isTitleDuplicate(title: string): boolean {
      const words = normalizeTitle(title);
      if (words.length < 3) return false;
      return recentTitleWords.some(existing => words.filter(w => existing.includes(w)).length >= 3);
    }

    const found = gnewsArticles.find(a => !existingUrls.has(a.url) && !isTitleDuplicate(a.title));
    if (!found) {
      return NextResponse.json({ error: "All fetched articles already exist" }, { status: 409 });
    }
    article = found;
  }

  // إعادة الصياغة بالعربية (أسلوب Axios)
  const rewritten = await rewriteArticle(article);
  if (!rewritten) {
    return NextResponse.json({ error: "Failed to rewrite article" }, { status: 500 });
  }

  // حفظ في قاعدة البيانات
  const tags = normalizeTags(rewritten.tags ?? []);
  const { data: post, error: err } = await supabase
    .from("posts")
    .insert({
      title_ar: rewritten.title_ar,
      title_en: article.title,
      body_ar: rewritten.lede_ar,
      type: "news" as const,
      status: "published",
      category_id: cat.id,
      image_url: article.image ?? null,
      source_url: article.url || null,
      content_config: {
        source_name: article.source.name,
        source_url: article.source.url,
        gnews_url: article.url,
        gnews_published_at: article.publishedAt,
        why_it_matters_ar: rewritten.why_it_matters_ar ?? null,
        key_points_ar: rewritten.key_points_ar ?? [],
        quote: rewritten.quote ?? null,
        whats_next_ar: rewritten.whats_next_ar ?? null,
      },
      tags,
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
