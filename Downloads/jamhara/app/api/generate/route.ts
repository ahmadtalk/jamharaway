import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Category, Source } from "@/lib/supabase/types";
import { createHash } from "crypto";
import { buildArticlePrompt } from "@/lib/prompts";
import { ARTICLE_MODEL, EVAL_MODEL } from "@/lib/ai-config";
import { checkTopicDuplicate, registerTopic, getRecentTopics } from "@/lib/dedup";
import { normalizeTags } from "@/lib/tags";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Simple token guard — set GENERATE_SECRET in env
function isAuthorized(req: NextRequest) {
  const secret = process.env.GENERATE_SECRET?.trim();
  if (!secret) return true; // no secret set = open (dev only)
  const auth = (req.headers.get("authorization") ?? req.nextUrl.searchParams.get("secret") ?? "").trim();
  return auth === secret || auth === `Bearer ${secret}`;
}

export const maxDuration = 60; // Vercel: allow up to 60s for image generation

// ============================================================
// UPLOAD IMAGE TO SUPABASE STORAGE (permanent, not expiring)
// ============================================================
async function uploadImageToStorage(replicateUrl: string, postId: string): Promise<string | null> {
  try {
    const adminSupabase = createAdminClient();
    const imgRes = await fetch(replicateUrl);
    if (!imgRes.ok) return null;
    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileName = `${postId}.jpg`;
    const { error } = await adminSupabase.storage
      .from("post-images")
      .upload(fileName, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("[Storage] upload error:", error.message);
      return null;
    }

    const { data } = adminSupabase.storage
      .from("post-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (e) {
    console.error("[Storage] exception:", e instanceof Error ? e.message : String(e));
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { category_slug, subcategory_slug, topic, context, generate_image, use_web_search = true } = body as {
    category_slug: string;
    subcategory_slug?: string;
    topic?: string;
    context?: string;
    generate_image?: boolean;
    use_web_search?: boolean;
  };

  // generate_image defaults to true for backward compatibility
  const shouldGenerateImage = generate_image !== false;

  if (!category_slug) {
    return NextResponse.json({ error: "category_slug required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 1. Fetch category info
  const { data: categoryData } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", category_slug)
    .single();

  const category = categoryData as Category | null;
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const { data: subcategoryData } = subcategory_slug
    ? await supabase.from("categories").select("*").eq("slug", subcategory_slug).single()
    : { data: null };
  const subcategory = subcategoryData as Category | null;

  // 2. Pick a random subcategory if none provided
  const { data: subsData } = await supabase
    .from("categories")
    .select("*")
    .eq("parent_id", category.id);

  const subs = (subsData ?? []) as Category[];
  const activeSub: Category | null = subcategory ?? (subs.length > 0
    ? subs[Math.floor(Math.random() * subs.length)]
    : null);

  // 3. Create generation job
  const { data: job } = await supabase
    .from("generation_jobs")
    .insert({ category_id: category.id, status: "running" })
    .select()
    .single();

  const jobId = job?.id;

  // ── Layer 2: Duplicate Check (إذا وُفّر topic صريح) ───────────
  if (topic) {
    const dupCheck = await checkTopicDuplicate(topic, "article", category_slug);
    if (dupCheck.isDuplicate) {
      return NextResponse.json({
        error: "duplicate_topic",
        message: `هذا الموضوع قريب جداً من: "${dupCheck.similarTopic}" (منذ ${dupCheck.daysAgo} يوم)`,
        similarTopic:  dupCheck.similarTopic,
        similarPostId: dupCheck.similarPostId,
        score:         dupCheck.score,
      }, { status: 409 });
    }
  }

  // ── Layer 3: Context Injection — جلب المواضيع الأخيرة ─────────
  const recentTopics = await getRecentTopics(category_slug, "article");

  try {
    // 4. Generate post with Claude
    const generatedPost = await generatePost(category, activeSub, topic, context, use_web_search, recentTopics);

    // 5. Quality check
    const qualityResult = await checkQuality(generatedPost.body_ar);

    // Track tokens & cost (Haiku: $0.80/M input, $4.00/M output)
    const totalInput = (generatedPost.usage?.input_tokens ?? 0) + (qualityResult.usage?.input_tokens ?? 0);
    const totalOutput = (generatedPost.usage?.output_tokens ?? 0) + (qualityResult.usage?.output_tokens ?? 0);
    const costUsd = (totalInput * 0.80 + totalOutput * 4.00) / 1_000_000;

    if (!qualityResult.pass) {
      await supabase
        .from("generation_jobs")
        .update({ status: "failed", error_message: `Quality failed: ${qualityResult.reason}`, quality_failed: 1, cost_usd: costUsd })
        .eq("id", jobId);

      return NextResponse.json({ error: "Quality check failed", reason: qualityResult.reason }, { status: 422 });
    }

    // 6. Deduplication check
    const fingerprint = createHash("sha256")
      .update(generatedPost.body_ar.slice(0, 200))
      .digest("hex");

    const { data: existing } = await supabase
      .from("posts")
      .select("id")
      .eq("hash_fingerprint", fingerprint)
      .single();

    if (existing) {
      await supabase
        .from("generation_jobs")
        .update({ status: "failed", error_message: "Duplicate content" })
        .eq("id", jobId);
      return NextResponse.json({ error: "Duplicate content detected" }, { status: 409 });
    }

    // 7. Generate image with Replicate (optional — skip if token missing or generate_image=false)
    let imageUrl: string | null = null;
    let imageError: string | null = null;
    if (shouldGenerateImage && process.env.REPLICATE_API_TOKEN) {
      const imgResult = await generateImage(category.name_en, activeSub?.name_en, generatedPost.title_en);
      imageUrl = imgResult.url;
      imageError = imgResult.error;
    }

    // 8. Pick a random active source
    const { data: sourcesData } = await supabase.from("sources").select("id").eq("is_active", true);
    const sources = (sourcesData ?? []) as Pick<Source, "id">[];
    const sourceId = sources.length > 0
      ? sources[Math.floor(Math.random() * sources.length)].id
      : null;

    // 9. Save post to Supabase
    const { data: savedPost, error: saveError } = await supabase
      .from("posts")
      .insert({
        title_ar: generatedPost.title_ar,
        title_en: generatedPost.title_en,
        body_ar: generatedPost.body_ar,
        body_en: generatedPost.body_en,
        category_id: category.id,
        subcategory_id: activeSub?.id ?? null,
        source_id: sourceId,
        image_url: imageUrl,
        status: "published",
        quality_score: qualityResult.score,
        hash_fingerprint: fingerprint,
        reading_time: Math.max(1, Math.ceil(generatedPost.body_ar.split(" ").length / 200)),
        published_at: new Date().toISOString(),
        tags: generatedPost.tags,
        tags_en: generatedPost.tags_en,
        // Store real sources from web search in content_config
        content_config: generatedPost.sources.length > 0
          ? { sources: generatedPost.sources } as unknown as null
          : null,
      })
      .select()
      .single();

    if (saveError) throw new Error(saveError.message);

    // ── Layer 2: Register topic in registry ───────────────────────
    await registerTopic(
      generatedPost.title_ar,
      "article",
      category_slug,
      savedPost!.id,
    );

    // 9b. Upload image to Supabase Storage for permanent hosting
    if (imageUrl && savedPost?.id) {
      const storageUrl = await uploadImageToStorage(imageUrl, savedPost.id);
      if (storageUrl) {
        imageUrl = storageUrl;
        // Update post with the permanent storage URL
        await supabase
          .from("posts")
          .update({ image_url: storageUrl })
          .eq("id", savedPost.id);
      }
    }

    // 10. Update job as done
    await supabase
      .from("generation_jobs")
      .update({
        status: "done",
        posts_generated: 1,
        quality_passed: 1,
        cost_usd: costUsd,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    return NextResponse.json({
      success: true,
      post: savedPost,
      image_generated: !!imageUrl,
      image_error: imageError,
    }, { status: 201 });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (jobId) {
      await supabase
        .from("generation_jobs")
        .update({ status: "failed", error_message: msg })
        .eq("id", jobId);
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ============================================================
// GENERATE POST — Claude Haiku
// ============================================================
/** إزالة trailing commas من نص JSON قبل الـ parse — لا نحذف // لأنها موجودة في URLs */
function sanitizeJSON(str: string): string {
  return str
    .replace(/\/\*[\s\S]*?\*\//g, "")    // remove /* */ block comments only
    .replace(/,\s*([\]}])/g, "$1");      // remove trailing commas
}

async function generatePost(
  category: { name_ar: string; name_en: string },
  subcategory: { name_ar: string; name_en: string } | null,
  topic?: string,
  context?: string,
  useWebSearch = true,
  recentTopics: string[] = [],
) {
  const prompt = buildArticlePrompt({
    topic,
    categoryName: category.name_ar,
    subcategoryName: subcategory?.name_ar,
    context,
    recentTopics,
  });

  let raw = "";
  let firstUsage: { input_tokens: number; output_tokens: number } | undefined;
  if (useWebSearch) {
    const response = await anthropic.messages.create({
      model: ARTICLE_MODEL,
      max_tokens: 2500,
      tools: [{ type: "web_search_20250305" as "web_search_20250305", name: "web_search", max_uses: 3 }],
      messages: [{ role: "user", content: prompt }],
    });
    firstUsage = response.usage;

    raw = response.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("");

    // إذا كانت النتيجة بحثاً فقط (tool_use) أو لا تحتوي JSON — نطلب الـ JSON صراحةً
    const hasToolUse = response.content.some((b: { type: string }) => b.type === "tool_use");
    if (hasToolUse || !raw.trim() || !raw.includes("{")) {
      raw = "";
      const followup = await anthropic.messages.create({
        model: ARTICLE_MODEL,
        max_tokens: 2500,
        messages: [
          { role: "user", content: prompt },
          { role: "assistant", content: response.content },
          { role: "user", content: "الآن أرجع JSON المطلوب فقط بناءً على ما وجدته في بحثك." },
        ],
      });
      raw = followup.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
    }
  } else {
    const response = await anthropic.messages.create({
      model: ARTICLE_MODEL,
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    });
    firstUsage = response.usage;
    raw = response.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
  }

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Claude returned invalid JSON");

  let parsed: any;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    // محاولة ثانية بعد تنظيف الـ JSON
    parsed = JSON.parse(sanitizeJSON(jsonMatch[0]));
  }

  if (!parsed.title_ar || !parsed.body_ar) {
    throw new Error("Missing required fields in generated post");
  }

  // إزالة <cite index="...">...</cite> التي يُدرجها Sonnet مع web_search
  const stripCites = (text: string) =>
    text.replace(/<cite[^>]*>([\s\S]*?)<\/cite>/g, "$1").replace(/<\/?cite[^>]*>/g, "").trim();

  parsed.body_ar = stripCites(parsed.body_ar);
  if (parsed.body_en) parsed.body_en = stripCites(parsed.body_en);
  if (parsed.title_ar) parsed.title_ar = stripCites(parsed.title_ar);
  if (parsed.title_en) parsed.title_en = stripCites(parsed.title_en);

  // Validate & clean sources — discard any made-up or Wikipedia URLs
  const rawSources: { name?: string; url?: string }[] = Array.isArray(parsed.sources) ? parsed.sources : [];
  const cleanSources = rawSources
    .filter((s) => s.url && s.url.startsWith("http") && !s.url.includes("wikipedia"))
    .map((s) => ({ name: s.name?.trim() || "مصدر", url: s.url!.trim() }))
    .slice(0, 3);

  return {
    title_ar: parsed.title_ar as string,
    body_ar: parsed.body_ar as string,
    title_en: (parsed.title_en ?? "") as string,
    body_en: (parsed.body_en ?? "") as string,
    sources: cleanSources,
    tags: normalizeTags(Array.isArray(parsed.tags) ? parsed.tags : []),
    tags_en: Array.isArray(parsed.tags_en) ? parsed.tags_en.map(String) : [],
    usage: firstUsage,
  };
}

// ============================================================
// QUALITY CHECK — Claude Haiku
// ============================================================
async function checkQuality(bodyAr: string): Promise<{
  pass: boolean;
  reason: string;
  score: number;
  usage: { input_tokens: number; output_tokens: number };
}> {
  const wordCount = bodyAr.split(/\s+/).length;
  const noUsage = { input_tokens: 0, output_tokens: 0 };

  // Quick structural checks first
  if (wordCount < 60 || wordCount > 160) {
    return { pass: false, reason: `Word count out of range: ${wordCount}`, score: 0, usage: noUsage };
  }

  const response = await anthropic.messages.create({
    model: EVAL_MODEL,
    max_tokens: 100,
    messages: [
      {
        role: "user",
        content: `راجع هذا المنشور المعرفي وأجب بـ JSON فقط:

"${bodyAr}"

أجب بـ JSON فقط:
{
  "pass": true أو false,
  "reason": "سبب قصير إن كان FAIL",
  "score": رقم من 0 إلى 1
}

معايير القبول:
- يحتوي معلومة موثوقة (رقم أو حقيقة أو مصدر)
- خالٍ من الآراء الشخصية
- لا أخطاء لغوية واضحة
- ليس إعلاناً أو ترويجاً`,
      },
    ],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { pass: true, reason: "", score: 0.7, usage: response.usage };

  const result = JSON.parse(jsonMatch[0]);
  return {
    pass: result.pass ?? true,
    reason: result.reason ?? "",
    score: result.score ?? 0.7,
    usage: response.usage,
  };
}

// ============================================================
// SMART PROMPT BUILDER — category-aware Flux prompts
// ============================================================
const CATEGORY_STYLES: Record<string, { style: string; mood: string; lighting: string }> = {
  philosophy:   { style: "surrealist fine art painting, symbolic abstract shapes", mood: "contemplative, mysterious", lighting: "dramatic chiaroscuro, soft diffused light" },
  religions:    { style: "sacred art, luminous spiritual illustration", mood: "serene, transcendent", lighting: "golden divine light rays, warm glowing" },
  history:      { style: "cinematic historical scene, aged photograph aesthetic", mood: "epic, dramatic", lighting: "golden hour, warm antique tones" },
  geography:    { style: "aerial satellite photography, topographic art", mood: "vast, breathtaking", lighting: "natural sunlight, high contrast" },
  politics:     { style: "editorial photography, documentary style", mood: "serious, powerful", lighting: "harsh dramatic lighting, deep shadows" },
  economics:    { style: "abstract data visualization, modern infographic art", mood: "sharp, analytical", lighting: "clean studio lighting, cool tones" },
  business:     { style: "modern corporate photography, clean minimal design", mood: "professional, dynamic", lighting: "bright studio light, white background" },
  law:          { style: "dramatic legal photography, classical architecture", mood: "authoritative, solemn", lighting: "shaft of light, neoclassical shadows" },
  ai:           { style: "futuristic digital art, neural network visualization, glowing circuits", mood: "technological, ethereal", lighting: "neon blue-purple glow, dark background" },
  computing:    { style: "macro technology photography, circuit board abstraction", mood: "technical, precise", lighting: "cool blue LED lighting, dark studio" },
  mathematics:  { style: "sacred geometry, abstract mathematical visualization, fractal art", mood: "precise, infinite", lighting: "clean white background, sharp shadows" },
  physics:      { style: "scientific visualization, particle physics art, quantum waves", mood: "sublime, cosmic", lighting: "electric blue glow, void background" },
  space:        { style: "NASA-quality astrophotography, cosmic nebula photography", mood: "awe-inspiring, infinite", lighting: "starlight, galaxy glow, deep space darkness" },
  chemistry:    { style: "macro molecular photography, laboratory aesthetic", mood: "precise, vivid", lighting: "colorful chemical glow, dark lab background" },
  biology:      { style: "macro nature photography, scientific illustration", mood: "organic, detailed", lighting: "soft natural light, green tones" },
  medicine:     { style: "medical photography, anatomical illustration, clinical aesthetic", mood: "clean, precise", lighting: "bright clinical light, white sterile background" },
  environment:  { style: "National Geographic photography, dramatic nature landscape", mood: "powerful, urgent", lighting: "golden hour, natural light" },
  sociology:    { style: "documentary street photography, candid human moments", mood: "humanistic, empathetic", lighting: "natural ambient light, warm tones" },
  psychology:   { style: "conceptual fine art photography, mind visualization", mood: "introspective, layered", lighting: "soft dreamlike light, fog" },
  linguistics:  { style: "abstract typography art turned visual, language visualization", mood: "flowing, expressive", lighting: "warm neutral light, clean background" },
  literature:   { style: "painterly book illustration, poetic visual metaphor", mood: "evocative, lyrical", lighting: "candlelight warmth, dramatic shadows" },
  arts:         { style: "contemporary fine art photography, gallery aesthetic", mood: "expressive, bold", lighting: "gallery spotlighting, dramatic" },
  design:       { style: "award-winning product photography, Bauhaus minimalism", mood: "elegant, precise", lighting: "perfect studio lighting, pure white" },
  media:        { style: "broadcast journalism photography, editorial magazine style", mood: "dynamic, urgent", lighting: "studio strobe, high contrast" },
};

function buildImagePrompt(categoryEn: string, subcategoryEn: string | undefined, titleEn: string): string {
  const key = categoryEn.toLowerCase();
  const style = CATEGORY_STYLES[key] ?? {
    style: "editorial photography, professional illustration",
    mood: "informative, clear",
    lighting: "clean natural light",
  };

  const subject = subcategoryEn ? `${subcategoryEn} (${categoryEn})` : categoryEn;

  return [
    `A stunning, award-winning editorial visual for a knowledge article about "${titleEn}".`,
    `Subject domain: ${subject}.`,
    `Visual style: ${style.style}.`,
    `Mood and atmosphere: ${style.mood}.`,
    `Lighting: ${style.lighting}.`,
    `Composition: rule of thirds, strong focal point, no human faces.`,
    `Technical quality: ultra-detailed, 8K resolution, photorealistic or painterly depending on style.`,
    `IMPORTANT: absolutely no text, no letters, no words, no numbers, no typography anywhere in the image.`,
  ].join(" ");
}

// ============================================================
// IMAGE GENERATION — Replicate (Flux Schnell)
// ============================================================
async function generateImage(
  categoryEn: string,
  subcategoryEn: string | undefined,
  titleEn: string
): Promise<{ url: string | null; error: string | null }> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return { url: null, error: "REPLICATE_API_TOKEN not set" };

  const prompt = buildImagePrompt(categoryEn, subcategoryEn, titleEn);

  type ReplicateResponse = {
    id: string;
    status: string;
    output?: string[];
    urls?: { get: string };
    error?: string;
  };

  try {
    // Start prediction — Prefer: wait tells Replicate to respond synchronously (up to 60s)
    const startRes = await fetch(
      "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify({
          input: {
            prompt,
            num_outputs: 1,
            aspect_ratio: "16:9",
            output_format: "jpg",
            output_quality: 85,
            go_fast: true,
          },
        }),
      }
    );

    const rawText = await startRes.text();

    if (!startRes.ok) {
      const msg = `HTTP ${startRes.status}: ${rawText.slice(0, 200)}`;
      console.error("[Replicate] start failed:", msg);
      return { url: null, error: msg };
    }

    const data = JSON.parse(rawText) as ReplicateResponse;

    // Synchronous wait succeeded
    if (data.status === "succeeded" && data.output?.[0]) {
      return { url: data.output[0], error: null };
    }

    if (data.error) {
      return { url: null, error: `Replicate error: ${data.error}` };
    }

    // Still processing — poll (max 6 × 5s = 30s)
    const pollUrl = data.urls?.get;
    if (!pollUrl) {
      return { url: null, error: `No poll URL. Status: ${data.status}. Response: ${rawText.slice(0, 300)}` };
    }

    for (let i = 0; i < 6; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const pollRes = await fetch(pollUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pollData = (await pollRes.json()) as ReplicateResponse;

      if (pollData.status === "succeeded" && pollData.output?.[0]) {
        return { url: pollData.output[0], error: null };
      }
      if (pollData.status === "failed") {
        return { url: null, error: `Prediction failed: ${pollData.error ?? "unknown"}` };
      }
    }

    return { url: null, error: "Timed out waiting for image" };

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[Replicate] exception:", msg);
    return { url: null, error: msg };
  }
}
