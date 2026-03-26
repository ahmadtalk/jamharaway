import { NextRequest, NextResponse } from "next/server";
import { CONTENT_MODEL } from "@/lib/ai-config";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ComparisonType } from "@/lib/supabase/types";
import { buildComparisonPrompt } from "@/lib/prompts";
import { extractJSON } from "@/lib/json-utils";
import { checkTopicDuplicate, registerTopic, getRecentTopics } from "@/lib/dedup";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
export const maxDuration = 60;
function isAuthorized(req: NextRequest) {
  const secret = process.env.GENERATE_SECRET?.trim();
  if (!secret) return true;
  const auth = (req.headers.get("authorization") ?? req.nextUrl.searchParams.get("secret") ?? "").trim();
  return auth === secret || auth === `Bearer ${secret}`;
}
function strip(s: unknown): string {
  if (typeof s !== "string") return "";
  return s.replace(/<[^>]*>/g, "").trim();
}
// ── Validation per type ───────────────────────────────────────────────────────
function validate(cfg: unknown, type: ComparisonType): boolean {
  if (!cfg || typeof cfg !== "object") return false;
  const c = cfg as Record<string, unknown>;
  if (!c.entity_a || !c.entity_b) return false;
  switch (type) {
    case "bars":          return Array.isArray(c.dimensions)   && (c.dimensions as unknown[]).length >= 3;
    case "matrix":        return Array.isArray(c.features)     && (c.features as unknown[]).length >= 4;
    case "profile":       return !!(c.entity_a as Record<string,unknown>)?.stats;
    case "timeline_duel": return Array.isArray(c.data_points)  && (c.data_points as unknown[]).length >= 4;
    case "stance":        return Array.isArray(c.topics)       && (c.topics as unknown[]).length >= 3;
    case "spectrum":      return Array.isArray(c.axes)         && (c.axes as unknown[]).length >= 3;
    default:              return false;
  }
}
// ── Route ─────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { topic, category_slug, comparison_type = "bars", use_web_search = false } = await req.json() as {
    topic?: string; category_slug: string; comparison_type?: ComparisonType; use_web_search?: boolean;
  };
  if (!category_slug)
    return NextResponse.json({ error: "category_slug is required" }, { status: 400 });
  const supabase = createAdminClient();
  const { data: category } = await supabase
    .from("categories").select("id,name_ar").eq("slug", category_slug).single();
  if (!category)
    return NextResponse.json({ error: `Category not found: ${category_slug}` }, { status: 400 });
  const effectiveTopic = topic?.trim() || `اختر موضوعاً مناسباً من قسم ${category.name_ar}`;
  // Layer 2a — فحص التكرار عندما يُوفَّر topic صريح
  if (topic?.trim()) {
    const dupCheck = await checkTopicDuplicate(topic.trim(), "comparison", category_slug);
    if (dupCheck.isDuplicate) {
      return NextResponse.json({
        error: "duplicate_topic",
        message: `محتوى مشابه موجود بالفعل: "${dupCheck.similarTopic}" (منذ ${dupCheck.daysAgo} يوم)`,
        similarPostId: dupCheck.similarPostId,
      }, { status: 409 });
    }
  }
  // Layer 3 — جلب المواضيع الأخيرة لمنع التكرار في البرومبت
  const recentTopics = await getRecentTopics(category_slug, "comparison", 15, 30);
  const recentTopicsBlock = recentTopics.length > 0
    ? `\n\n⚠️ لا تكرر هذه المواضيع (كُتبت مؤخراً في نفس التصنيف):\n${recentTopics.map((t: string) => `- ${t}`).join("\n")}`
    : "";
  const promptText = buildComparisonPrompt({
    topic: effectiveTopic,
    categorySlug: category_slug,
    comparisonType: comparison_type,
  }) + recentTopicsBlock;
  try {
    let resultText = "";
    if (use_web_search) {
      const response = await anthropic.messages.create({
        model: CONTENT_MODEL,
        max_tokens: 4096,
        tools: [{ type:"web_search_20250305" as "web_search_20250305", name:"web_search", max_uses:3 }],
        messages: [{ role:"user", content: promptText }],
      });
      for (const b of response.content) if (b.type === "text") resultText += (b as any).text;
      const hasToolUse = response.content.some((b: {type:string}) => b.type === "tool_use");
      if (hasToolUse || !resultText.trim() || !resultText.includes("{")) {
        resultText = "";
        const followup = await anthropic.messages.create({
          model: CONTENT_MODEL,
          max_tokens: 4096,
          messages: [
            { role:"user", content: promptText },
            { role:"assistant", content: response.content },
            { role:"user", content: "الآن أرجع JSON فقط." },
          ],
        });
        for (const b of followup.content) if (b.type === "text") resultText += (b as any).text;
      }
    } else {
      const response = await anthropic.messages.create({
        model: CONTENT_MODEL,
        max_tokens: 4096,
        messages: [{ role:"user", content: promptText }],
      });
      for (const b of response.content) if (b.type === "text") resultText += (b as any).text;
    }
    const parsed = extractJSON(resultText);
    if (!parsed) {
      console.error("[generate-comparison] JSON parse failed:", resultText.slice(0,400));
      return NextResponse.json({ error:"Failed to parse JSON from Claude" }, { status:500 });
    }
    const cfg = parsed.comparison_config as unknown;
    if (!validate(cfg, comparison_type)) {
      console.error("[generate-comparison] Validation failed:", JSON.stringify(cfg).slice(0,300));
      return NextResponse.json({ error:`Invalid ${comparison_type} config structure` }, { status:500 });
    }
    const { data: post, error: insertError } = await supabase
      .from("posts")
      .insert({
        title_ar:           strip(parsed.title_ar as string) || topic,
        title_en:           strip(parsed.title_en as string) || topic,
        body_ar:            strip(parsed.body_ar  as string),
        body_en:            strip(parsed.body_en  as string),
        type:               "comparison" as "comparison",
        status:             "published",
        category_id:        category.id,
        comparison_config:  cfg as unknown as null,
        quality_score:      85,
        reading_time:       2,
        published_at:       new Date().toISOString(),
      })
      .select().single();
    if (insertError) {
      console.error("[generate-comparison] Insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status:500 });
    }
    // Register topic for deduplication
    await registerTopic(post?.title_ar ?? topic ?? "", "comparison", category_slug, post?.id);
    return NextResponse.json({ success:true, post });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[generate-comparison] Error:", msg);
    return NextResponse.json({ error: msg }, { status:500 });
  }
}
