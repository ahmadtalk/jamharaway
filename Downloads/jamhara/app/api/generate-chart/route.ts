import { NextRequest, NextResponse } from "next/server";
import { CONTENT_MODEL } from "@/lib/ai-config";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildChartPrompt, buildChartTypeInstruction } from "@/lib/prompts";
import { registerTopic } from "@/lib/dedup";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
function isAuthorized(req: NextRequest) {
  const secret = process.env.GENERATE_SECRET?.trim();
  if (!secret) return true;
  const auth = (req.headers.get("authorization") ?? req.nextUrl.searchParams.get("secret") ?? "").trim();
  return auth === secret || auth === `Bearer ${secret}`;
}
export const maxDuration = 60;
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { topic, category_slug, chart_type, use_web_search = false } = await req.json() as {
    topic?: string;
    category_slug: string;
    chart_type?: string;
    use_web_search?: boolean;
  };
  if (!category_slug) return NextResponse.json({ error: "category_slug is required" }, { status: 400 });
  const supabase = createAdminClient();
  const { data: cat } = await supabase.from("categories").select("*").eq("slug", category_slug).single();
  if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 404 });
  const effectiveTopic = topic?.trim() || `اختر موضوعاً مناسباً من قسم ${cat.name_ar}`;
  // Chart type instruction: forced or AI-chosen
  const chartTypeInstruction = buildChartTypeInstruction(chart_type);
  const prompt = buildChartPrompt({
    topic: effectiveTopic,
    categoryName: cat.name_ar,
    chartTypeInstruction,
  });
  let raw = "";
  try {
    if (use_web_search) {
      const response = await anthropic.messages.create({
        model: CONTENT_MODEL,
        max_tokens: 8000,
        tools: [{ type: "web_search_20250305" as "web_search_20250305", name: "web_search", max_uses: 3 }],
        messages: [{ role: "user", content: prompt }],
      });
      for (const b of response.content) if ((b as any).type === "text") raw += (b as any).text;
      const hasToolUse = response.content.some((b: any) => b.type === "tool_use");
      if (hasToolUse || !raw.trim() || !raw.includes("{")) {
        raw = "";
        const followup = await anthropic.messages.create({
          model: CONTENT_MODEL,
          max_tokens: 8000,
          messages: [
            { role: "user", content: prompt },
            { role: "assistant", content: response.content },
            { role: "user", content: "الآن أرجع JSON فقط." },
          ],
        });
        for (const b of followup.content) if ((b as any).type === "text") raw += (b as any).text;
      }
    } else {
      const response = await anthropic.messages.create({
        model: CONTENT_MODEL,
        max_tokens: 8000,
        messages: [{ role: "user", content: prompt }],
      });
      for (const b of response.content) if ((b as any).type === "text") raw += (b as any).text;
    }
  } catch (err: any) {
    console.error("[generate-chart] Anthropic error:", err?.message ?? err);
    return NextResponse.json(
      { error: "AI generation failed", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("[generate-chart] No JSON in response. Raw:", raw.slice(0, 300));
    return NextResponse.json({ error: "Failed to parse AI response", raw: raw.slice(0, 300) }, { status: 500 });
  }
  let parsed: any;
  try { parsed = JSON.parse(jsonMatch[0]); }
  catch (e: any) {
    console.error("[generate-chart] JSON parse error:", e?.message);
    return NextResponse.json({ error: "Invalid JSON from AI", raw: jsonMatch[0].slice(0, 300) }, { status: 500 });
  }
  const { data: post, error } = await supabase.from("posts").insert({
    title_ar: parsed.title_ar,
    title_en: parsed.title_en,
    body_ar: parsed.body_ar,
    body_en: parsed.body_en,
    type: "chart",
    chart_config: parsed.chart_config,
    category_id: cat.id,
    status: "published",
    quality_score: 85,
    like_count: 0,
    share_count: 0,
    view_count: 0,
    reading_time: 2,
    is_featured: false,
    published_at: new Date().toISOString(),
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Register topic for deduplication
  await registerTopic(post?.title_ar ?? topic ?? "", "chart", category_slug, post?.id);
  return NextResponse.json({ success: true, post });
}
