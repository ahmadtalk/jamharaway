import { NextRequest, NextResponse } from "next/server";
import { CONTENT_MODEL } from "@/lib/ai-config";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import type { QuizType } from "@/lib/supabase/types";
import { buildQuizPrompt } from "@/lib/prompts";
import { checkTopicDuplicate, registerTopic, getRecentTopics } from "@/lib/dedup";
import { normalizeTags } from "@/lib/tags";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
function isAuthorized(req: NextRequest) {
  const secret = process.env.GENERATE_SECRET?.trim();
  if (!secret) return true;
  const auth = (req.headers.get("authorization") ?? req.nextUrl.searchParams.get("secret") ?? "").trim();
  return auth === secret || auth === `Bearer ${secret}`;
}
export const maxDuration = 60;
const stripTags = (s: string) => typeof s === "string" ? s.replace(/<[^>]*>/g, "") : s;
function stripAll(obj: any): any {
  if (typeof obj === "string") return stripTags(obj);
  if (Array.isArray(obj)) return obj.map(stripAll);
  if (obj && typeof obj === "object") return Object.fromEntries(Object.entries(obj).map(([k,v]) => [k, stripAll(v)]));
  return obj;
}
function validateQuiz(questions: any[], quizType: QuizType): { valid: boolean; error?: string } {
  if (!Array.isArray(questions) || questions.length < 2) {
    return { valid: false, error: `Need at least 2 questions, got ${questions?.length}` };
  }
  switch (quizType) {
    case "mcq":
    case "speed":
      for (const q of questions) {
        if (!q.options_ar || q.options_ar.length !== 4) return { valid: false, error: "MCQ/Speed needs exactly 4 options" };
        if (typeof q.correct_index !== "number") return { valid: false, error: "Missing correct_index" };
      }
      break;
    case "true_false":
      for (const q of questions) {
        if (typeof q.is_true !== "boolean") return { valid: false, error: "true_false needs is_true boolean" };
        if (!q.statement_ar) return { valid: false, error: "Missing statement_ar" };
      }
      break;
    case "timeline":
      for (const q of questions) {
        if (!Array.isArray(q.events) || q.events.length < 3) return { valid: false, error: "timeline needs at least 3 events" };
      }
      break;
    case "matching":
      for (const q of questions) {
        if (!Array.isArray(q.pairs) || q.pairs.length < 3) return { valid: false, error: "matching needs at least 3 pairs" };
      }
      break;
    case "guess_who":
      for (const q of questions) {
        if (!Array.isArray(q.hints_ar) || q.hints_ar.length < 2) return { valid: false, error: "guess_who needs at least 2 hints" };
        if (!q.options_ar || q.options_ar.length !== 4) return { valid: false, error: "guess_who needs 4 options" };
      }
      break;
  }
  return { valid: true };
}
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { topic, category_slug, difficulty, quiz_type, use_web_search = false } = await req.json() as {
    topic?: string;
    category_slug: string;
    difficulty?: "easy" | "medium" | "hard";
    quiz_type?: QuizType;
    use_web_search?: boolean;
  };
  if (!category_slug) return NextResponse.json({ error: "category_slug is required" }, { status: 400 });
  const quizType: QuizType = quiz_type ?? "mcq";
  const supabase = createAdminClient();
  const { data: cat } = await supabase.from("categories").select("*").eq("slug", category_slug).single();
  if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 404 });
  const effectiveTopic = topic?.trim() || `اختر موضوعاً مناسباً من قسم ${cat.name_ar}`;
  // Layer 2a — فحص التكرار عندما يُوفَّر topic صريح
  if (topic?.trim()) {
    const dupCheck = await checkTopicDuplicate(topic.trim(), "quiz", category_slug);
    if (dupCheck.isDuplicate) {
      return NextResponse.json({
        error: "duplicate_topic",
        message: `محتوى مشابه موجود بالفعل: "${dupCheck.similarTopic}" (منذ ${dupCheck.daysAgo} يوم)`,
        similarPostId: dupCheck.similarPostId,
      }, { status: 409 });
    }
  }
  // Layer 3 — جلب المواضيع الأخيرة لمنع التكرار في البرومبت
  const recentTopics = await getRecentTopics(category_slug, "quiz", 15, 30);
  const recentTopicsBlock = recentTopics.length > 0
    ? `\n\n⚠️ لا تكرر هذه المواضيع (كُتبت مؤخراً في نفس التصنيف):\n${recentTopics.map((t: string) => `- ${t}`).join("\n")}`
    : "";
  const difficultyLabel = difficulty === "easy" ? "سهل" : difficulty === "hard" ? "صعب" : "متوسط";
  const difficultyEn = difficulty ?? "medium";
  const prompt = buildQuizPrompt({
    topic: effectiveTopic,
    categoryName: cat.name_ar,
    difficulty: difficultyLabel,
    difficultyEn,
    quizType,
  }) + recentTopicsBlock;
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
    console.error("[generate-quiz] Anthropic error:", err?.message ?? err);
    return NextResponse.json({ error: "AI generation failed", detail: err?.message }, { status: 500 });
  }
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("[generate-quiz] No JSON. Raw:", raw.slice(0, 300));
    return NextResponse.json({ error: "No JSON in AI response" }, { status: 500 });
  }
  let parsed: any;
  try { parsed = JSON.parse(jsonMatch[0]); }
  catch (e: any) {
    return NextResponse.json({ error: "Invalid JSON from AI" }, { status: 500 });
  }
  const questions = parsed.questions ?? [];
  const validation = validateQuiz(questions, quizType);
  if (!validation.valid) {
    return NextResponse.json({ error: `Validation failed: ${validation.error}` }, { status: 500 });
  }
  parsed.questions = stripAll(questions);
  const quizConfig = {
    quiz_type: quizType,
    questions: parsed.questions,
    difficulty: parsed.difficulty ?? difficultyEn,
    source: parsed.source,
    sourceUrl: parsed.sourceUrl,
  };
  const tags = normalizeTags(Array.isArray(parsed.tags) ? parsed.tags : []);
  const { data: post, error } = await supabase.from("posts").insert({
    title_ar: stripTags(parsed.title_ar ?? `اختبار: ${topic}`),
    title_en: stripTags(parsed.title_en ?? `Quiz: ${topic}`),
    body_ar: `اختبار من ${questions.length} ${quizType === "true_false" ? "جملة" : "أسئلة"} عن ${topic}`,
    body_en: `A ${questions.length}-item quiz about ${topic}`,
    type: "quiz",
    quiz_config: quizConfig,
    chart_config: null,
    category_id: cat.id,
    status: "published",
    tags,
    quality_score: 88,
    like_count: 0, share_count: 0, view_count: 0,
    reading_time: 3, is_featured: false,
    published_at: new Date().toISOString(),
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Register topic for deduplication
  await registerTopic(post?.title_ar ?? topic ?? "", "quiz", category_slug, post?.id);
  return NextResponse.json({ success: true, post });
}
