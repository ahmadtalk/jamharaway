import { NextRequest, NextResponse } from "next/server";
import { CONTENT_MODEL } from "@/lib/ai-config";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildExplainerPrompt } from "@/lib/prompts";
import { extractJSON } from "@/lib/json-utils";
import { checkTopicDuplicate, registerTopic, getRecentTopics } from "@/lib/dedup";
import { normalizeTags } from "@/lib/tags";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
export const maxDuration = 60;
function isAuthorized(req: NextRequest) {
  const secret = process.env.GENERATE_SECRET?.trim();
  if (!secret) return true;
  const auth = (req.headers.get("authorization") ?? req.nextUrl.searchParams.get("secret") ?? "").trim();
  return auth === secret || auth === `Bearer ${secret}`;
}
function strip(s: unknown) { return typeof s === "string" ? s.replace(/<[^>]*>/g,"").trim() : ""; }
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const { topic, category_slug, use_web_search = false } = await req.json() as { topic?:string; category_slug:string; use_web_search?:boolean };
  if (!category_slug) return NextResponse.json({ error:"category_slug is required" }, { status:400 });
  const effectiveTopic = topic?.trim() || `اختر موضوعاً مناسباً من قسم ${category_slug}`;
  const supabase = createAdminClient();
  const { data: cat } = await supabase.from("categories").select("id,name_ar").eq("slug", category_slug).single();
  if (!cat) return NextResponse.json({ error:`Category not found: ${category_slug}` }, { status:400 });
  // Layer 2a — فحص التكرار عندما يُوفَّر topic صريح
  if (topic?.trim()) {
    const dupCheck = await checkTopicDuplicate(topic.trim(), "explainer", category_slug);
    if (dupCheck.isDuplicate) {
      return NextResponse.json({
        error: "duplicate_topic",
        message: `محتوى مشابه موجود بالفعل: "${dupCheck.similarTopic}" (منذ ${dupCheck.daysAgo} يوم)`,
        similarPostId: dupCheck.similarPostId,
      }, { status: 409 });
    }
  }
  // Layer 3 — جلب المواضيع الأخيرة لمنع التكرار في البرومبت
  const recentTopics = await getRecentTopics(category_slug, "explainer", 15, 30);
  const recentTopicsBlock = recentTopics.length > 0
    ? `\n\n⚠️ لا تكرر هذه المواضيع (كُتبت مؤخراً في نفس التصنيف):\n${recentTopics.map((t: string) => `- ${t}`).join("\n")}`
    : "";
  const promptText = buildExplainerPrompt({
    topic: effectiveTopic,
    categorySlug: category_slug,
  }) + recentTopicsBlock;
  try {
    let resultText = "";
    if (use_web_search) {
      const response = await anthropic.messages.create({
        model:CONTENT_MODEL, max_tokens:4096,
        tools:[{ type:"web_search_20250305" as "web_search_20250305", name:"web_search", max_uses:4 }],
        messages:[{ role:"user", content:promptText }],
      });
      for (const b of response.content) if (b.type==="text") resultText += (b as any).text;
      const hasToolUse = response.content.some((b: {type:string}) => b.type === "tool_use");
      if (hasToolUse || !resultText.trim() || !resultText.includes("{")) {
        resultText = "";
        const followup = await anthropic.messages.create({
          model:CONTENT_MODEL, max_tokens:4096,
          messages:[
            { role:"user", content:promptText },
            { role:"assistant", content:response.content },
            { role:"user", content:"الآن أرجع JSON فقط." },
          ],
        });
        for (const b of followup.content) if (b.type==="text") resultText += (b as any).text;
      }
    } else {
      const response = await anthropic.messages.create({
        model:CONTENT_MODEL, max_tokens:4096,
        messages:[{ role:"user", content:promptText }],
      });
      for (const b of response.content) if (b.type==="text") resultText += (b as any).text;
    }
    const parsed = extractJSON(resultText);
    if (!parsed) return NextResponse.json({ error:"JSON parse failed" }, { status:500 });
    const cfg = parsed.content_config;
    if (!cfg?.questions?.length) return NextResponse.json({ error:"Invalid explainer config" }, { status:500 });
    const tags = normalizeTags(Array.isArray(parsed.tags) ? parsed.tags : []);
    const { data:post, error:err } = await supabase.from("posts").insert({
      title_ar:strip(parsed.title_ar)||topic, title_en:strip(parsed.title_en)||topic,
      body_ar:strip(parsed.body_ar), body_en:strip(parsed.body_en),
      type:"explainer" as "explainer", status:"published", category_id:cat.id,
      content_config:cfg, tags, quality_score:90, reading_time:4,
      published_at:new Date().toISOString(),
    }).select().single();
    if (err) return NextResponse.json({ error:err.message }, { status:500 });
    // Register topic for deduplication
    await registerTopic(post?.title_ar ?? effectiveTopic, "explainer", category_slug, post?.id);
    return NextResponse.json({ success:true, post });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status:500 });
  }
}
