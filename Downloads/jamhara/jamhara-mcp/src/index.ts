import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import express, { Request, Response } from "express";

// ─── Supabase ────────────────────────────────────────────────────────────────
const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://kzxphzobrkgqqshxzvjr.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

if (!SUPABASE_ANON_KEY) {
  console.error("❌ SUPABASE_ANON_KEY is required");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Types ───────────────────────────────────────────────────────────────────
const POST_TYPES = [
  "article", "news", "chart", "quiz", "comparison", "ranking",
  "numbers", "scenarios", "timeline", "factcheck", "profile",
  "briefing", "quotes", "explainer", "debate", "guide",
  "network", "interview", "map",
] as const;

type PostType = typeof POST_TYPES[number];

const TYPE_LABELS: Record<string, string> = {
  article:    "مقالة ✍️",
  news:       "خبر 📰",
  chart:      "مخطط 📈",
  quiz:       "اختبار 🎯",
  comparison: "مقارنة ⚡",
  ranking:    "ترتيب 🥇",
  numbers:    "أرقام 🔣",
  scenarios:  "سيناريوهات 🌀",
  timeline:   "خط زمني ⏳",
  factcheck:  "تدقيق حقائق 🔍",
  profile:    "بروفايل 🪪",
  briefing:   "موجز 🗞️",
  quotes:     "اقتباسات 🗣️",
  explainer:  "شارح 💡",
  debate:     "مناظرة 🏛️",
  guide:      "دليل 🧭",
  network:    "خريطة صلات 🔗",
  interview:  "مقابلة 🎙️",
  map:        "توزيع جغرافي 🌍",
};

// ─── Content Formatter ───────────────────────────────────────────────────────
function formatPost(post: any, locale: "ar" | "en" = "ar"): string {
  const ar = locale === "ar";
  const lines: string[] = [];

  const title = ar ? post.title_ar : (post.title_en || post.title_ar);
  lines.push(`# ${title || "—"}`);
  if (post.title_en && post.title_ar && !ar) lines.push(`*${post.title_ar}*`);
  lines.push("");

  lines.push(`**${ar ? "النوع" : "Type"}:** ${TYPE_LABELS[post.type] || post.type}`);
  if (post.categories?.name_ar)
    lines.push(`**${ar ? "التصنيف" : "Category"}:** ${ar ? post.categories.name_ar : (post.categories.name_en || post.categories.name_ar)}`);
  if (post.published_at)
    lines.push(`**${ar ? "النشر" : "Published"}:** ${new Date(post.published_at).toLocaleDateString(ar ? "ar-SA" : "en-US")}`);
  if (post.view_count)
    lines.push(`**${ar ? "المشاهدات" : "Views"}:** ${post.view_count.toLocaleString()}`);
  lines.push(`**${ar ? "الرابط" : "URL"}:** https://jamhara.com/${ar ? "ar" : "en"}/p/${post.id}`);
  lines.push("");

  // ── Type-specific content ──
  const c = post.content_config;
  const q = post.quiz_config;
  const comp = post.comparison_config;
  const chart = post.chart_config;

  switch (post.type) {
    case "article": {
      const body = ar ? post.body_ar : (post.body_en || post.body_ar);
      if (body) {
        lines.push(`## ${ar ? "المحتوى" : "Content"}`);
        lines.push(body.slice(0, 3000));
      }
      break;
    }

    case "news": {
      const lede = ar ? c?.lede_ar : (c?.lede_en || c?.lede_ar);
      const why  = ar ? c?.why_it_matters_ar : (c?.why_it_matters_en || c?.why_it_matters_ar);
      const pts  = ar ? c?.key_points_ar : (c?.key_points_en || c?.key_points_ar);
      const next = ar ? c?.whats_next_ar : (c?.whats_next_en || c?.whats_next_ar);

      if (lede)  { lines.push(`## ${ar ? "اللده" : "Lede"}`); lines.push(lede); lines.push(""); }
      if (why)   { lines.push(`## ${ar ? "لماذا يهم؟" : "Why It Matters"}`); lines.push(why); lines.push(""); }
      if (pts?.length) {
        lines.push(`## ${ar ? "النقاط الرئيسية" : "Key Points"}`);
        pts.forEach((p: string, i: number) => lines.push(`${i + 1}. ${p}`));
        lines.push("");
      }
      if (c?.quote) {
        const qt = ar ? c.quote.text_ar : (c.quote.text_en || c.quote.text_ar);
        const qa = ar ? c.quote.author_ar : (c.quote.author_en || c.quote.author_ar);
        if (qt) { lines.push(`> "${qt}"`); lines.push(`— **${qa}**`); lines.push(""); }
      }
      if (next) { lines.push(`## ${ar ? "ما التالي؟" : "What's Next"}`); lines.push(next); }
      break;
    }

    case "factcheck": {
      if (c?.claims?.length) {
        lines.push(`## ${ar ? "التدقيق" : "Fact Check"}`);
        c.claims.forEach((claim: any) => {
          const v = claim.verdict;
          const emoji = v === "true" ? "✅" : v === "false" ? "❌" : "⚠️";
          const label = v === "true" ? (ar ? "صحيح" : "True") : v === "false" ? (ar ? "خاطئ" : "False") : (ar ? "مضلل" : "Misleading");
          const text  = ar ? claim.claim_ar : (claim.claim_en || claim.claim_ar);
          const expl  = ar ? claim.explanation_ar : (claim.explanation_en || claim.explanation_ar);
          lines.push(`${emoji} **[${label}]** ${text}`);
          if (expl) lines.push(`  → ${expl}`);
          lines.push("");
        });
      }
      break;
    }

    case "profile": {
      const tagline = ar ? c?.tagline_ar : (c?.tagline_en || c?.tagline_ar);
      if (tagline) { lines.push(`*${tagline}*`); lines.push(""); }
      if (c?.quick_facts?.length) {
        lines.push(`## ${ar ? "حقائق سريعة" : "Quick Facts"}`);
        c.quick_facts.forEach((f: any) => {
          const label = ar ? f.label_ar : (f.label_en || f.label_ar);
          const value = ar ? f.value_ar : (f.value_en || f.value_ar);
          lines.push(`- **${label}:** ${value}`);
        });
        lines.push("");
      }
      if (c?.stats?.length) {
        lines.push(`## ${ar ? "أرقام بارزة" : "Key Stats"}`);
        c.stats.forEach((s: any) => {
          const label = ar ? s.label_ar : (s.label_en || s.label_ar);
          lines.push(`- **${s.value}** ${label}`);
        });
        lines.push("");
      }
      if (c?.timeline?.length) {
        lines.push(`## ${ar ? "خط زمني" : "Timeline"}`);
        c.timeline.forEach((t: any) => {
          const text = ar ? t.event_ar : (t.event_en || t.event_ar);
          lines.push(`- **${t.year}** — ${text}`);
        });
        lines.push("");
      }
      if (c?.sections?.length) {
        c.sections.forEach((s: any) => {
          const title   = ar ? s.title_ar   : (s.title_en   || s.title_ar);
          const content = ar ? s.content_ar : (s.content_en || s.content_ar);
          lines.push(`## ${title}`);
          lines.push(content || "");
          lines.push("");
        });
      }
      break;
    }

    case "timeline": {
      if (c?.events?.length) {
        lines.push(`## ${ar ? "الأحداث" : "Events"}`);
        c.events.forEach((e: any) => {
          const title = ar ? e.title_ar : (e.title_en || e.title_ar);
          const desc  = ar ? e.description_ar : (e.description_en || e.description_ar);
          lines.push(`- **${e.year || e.date}** — ${title}`);
          if (desc) lines.push(`  ${desc}`);
        });
      }
      break;
    }

    case "ranking": {
      if (c?.items?.length) {
        const metric = ar ? c.metric_ar : (c.metric_en || c.metric_ar);
        lines.push(`## ${ar ? "الترتيب" : "Ranking"} — ${metric || ""}`);
        c.items.forEach((item: any, i: number) => {
          const name = ar ? item.name_ar : (item.name_en || item.name_ar);
          lines.push(`${i + 1}. **${name}** — ${item.value}${item.unit || ""}`);
        });
      }
      break;
    }

    case "numbers": {
      if (c?.stats?.length) {
        lines.push(`## ${ar ? "الأرقام" : "Numbers"}`);
        c.stats.forEach((s: any) => {
          const label = ar ? s.label_ar : (s.label_en || s.label_ar);
          const desc  = ar ? s.description_ar : (s.description_en || s.description_ar);
          lines.push(`- **${s.number}** ${label}`);
          if (desc) lines.push(`  ${desc}`);
        });
      }
      break;
    }

    case "scenarios": {
      const question = ar ? c?.question_ar : (c?.question_en || c?.question_ar);
      if (question) { lines.push(`**${ar ? "التساؤل" : "Question"}:** ${question}`); lines.push(""); }
      if (c?.scenarios?.length) {
        c.scenarios.forEach((s: any) => {
          const title = ar ? s.title_ar : (s.title_en || s.title_ar);
          const desc  = ar ? s.description_ar : (s.description_en || s.description_ar);
          lines.push(`## ${title}`);
          if (desc) lines.push(desc);
          lines.push("");
        });
      }
      break;
    }

    case "debate": {
      const question = ar ? c?.question_ar : (c?.question_en || c?.question_ar);
      if (question) { lines.push(`**${ar ? "السؤال" : "Question"}:** ${question}`); lines.push(""); }
      ["side_a", "side_b"].forEach((side) => {
        if (!c?.[side]) return;
        const label = ar ? c[side].label_ar : (c[side].label_en || c[side].label_ar || side);
        lines.push(`## ${label}`);
        c[side].arguments?.forEach((a: string) => lines.push(`- ${a}`));
        lines.push("");
      });
      const verdict = ar ? c?.verdict_ar : (c?.verdict_en || c?.verdict_ar);
      if (verdict) { lines.push(`## ${ar ? "الخلاصة" : "Verdict"}`); lines.push(verdict); }
      break;
    }

    case "briefing": {
      if (c?.key_points?.length) {
        lines.push(`## ${ar ? "النقاط الرئيسية" : "Key Points"}`);
        c.key_points.forEach((p: any) => {
          const text = ar ? p.text_ar : (p.text_en || p.text_ar);
          lines.push(`- ${text}`);
        });
        lines.push("");
      }
      if (c?.key_numbers?.length) {
        lines.push(`## ${ar ? "أرقام مفتاحية" : "Key Numbers"}`);
        c.key_numbers.forEach((n: any) => {
          const label = ar ? n.label_ar : (n.label_en || n.label_ar);
          lines.push(`- **${n.value}** ${label}`);
        });
        lines.push("");
      }
      const bl = ar ? c?.bottom_line_ar : (c?.bottom_line_en || c?.bottom_line_ar);
      if (bl) { lines.push(`## ${ar ? "الخلاصة" : "Bottom Line"}`); lines.push(bl); }
      break;
    }

    case "quotes": {
      const topic = ar ? c?.topic_ar : (c?.topic_en || c?.topic_ar);
      if (topic) { lines.push(`**${ar ? "الموضوع" : "Topic"}:** ${topic}`); lines.push(""); }
      if (c?.quotes?.length) {
        c.quotes.forEach((qt: any) => {
          const text   = ar ? qt.text_ar   : (qt.text_en   || qt.text_ar);
          const author = ar ? qt.author_ar : (qt.author_en || qt.author_ar);
          const role   = ar ? qt.role_ar   : (qt.role_en   || qt.role_ar);
          lines.push(`> "${text}"`);
          lines.push(`— **${author}**${role ? `, ${role}` : ""}`);
          lines.push("");
        });
      }
      break;
    }

    case "explainer": {
      const intro = ar ? c?.intro_ar : (c?.intro_en || c?.intro_ar);
      if (intro) { lines.push(intro); lines.push(""); }
      if (c?.questions?.length) {
        c.questions.forEach((item: any) => {
          const qs = ar ? item.question_ar : (item.question_en || item.question_ar);
          const as = ar ? item.answer_ar   : (item.answer_en   || item.answer_ar);
          lines.push(`**${ar ? "س" : "Q"}: ${qs}**`);
          lines.push(`${ar ? "ج" : "A"}: ${as}`);
          lines.push("");
        });
      }
      break;
    }

    case "guide": {
      const goal = ar ? c?.goal_ar : (c?.goal_en || c?.goal_ar);
      if (goal) { lines.push(`**${ar ? "الهدف" : "Goal"}:** ${goal}`); lines.push(""); }
      if (c?.steps?.length) {
        lines.push(`## ${ar ? "الخطوات" : "Steps"}`);
        c.steps.forEach((s: any) => {
          const title = ar ? s.title_ar : (s.title_en || s.title_ar);
          const desc  = ar ? s.description_ar : (s.description_en || s.description_ar);
          const dur   = ar ? s.duration_ar : (s.duration_en || s.duration_ar);
          const warn  = ar ? s.warning_ar : (s.warning_en || s.warning_ar);
          lines.push(`${s.step}. **${s.icon || ""} ${title}**`);
          if (desc) lines.push(`   ${desc}`);
          if (dur)  lines.push(`   ⏱ ${dur}`);
          if (warn) lines.push(`   ⚠️ ${warn}`);
          lines.push("");
        });
      }
      break;
    }

    case "network": {
      const center = ar ? c?.center_ar : (c?.center_en || c?.center_ar);
      const role   = ar ? c?.center_role_ar : (c?.center_role_en || c?.center_role_ar);
      if (center) { lines.push(`**${ar ? "المركز" : "Center"}:** ${center}${role ? ` (${role})` : ""}`); lines.push(""); }
      if (c?.nodes?.length) {
        lines.push(`## ${ar ? "الصلات" : "Connections"}`);
        c.nodes.forEach((n: any) => {
          const name = ar ? n.name_ar : (n.name_en || n.name_ar);
          const desc = ar ? n.description_ar : (n.description_en || n.description_ar);
          const strength = n.strength === "strong" ? "●●●" : n.strength === "medium" ? "●●○" : "●○○";
          lines.push(`- **${n.emoji || ""} ${name}** [${n.relation_type}] ${strength}`);
          if (desc) lines.push(`  ${desc}`);
        });
      }
      break;
    }

    case "interview": {
      const interviewee = ar ? c?.interviewee_ar : (c?.interviewee_en || c?.interviewee_ar);
      const role        = ar ? c?.role_ar : (c?.role_en || c?.role_ar);
      const context     = ar ? c?.context_ar : (c?.context_en || c?.context_ar);
      if (interviewee) { lines.push(`**${ar ? "الضيف" : "Guest"}:** ${interviewee}${role ? `, ${role}` : ""}`); }
      if (c?.date)      lines.push(`**${ar ? "التاريخ" : "Date"}:** ${c.date}`);
      if (context)      { lines.push(""); lines.push(context); }
      lines.push("");
      if (c?.qa?.length) {
        lines.push(`## ${ar ? "الحوار" : "Interview"}`);
        c.qa.forEach((item: any) => {
          const qs = ar ? item.question_ar : (item.question_en || item.question_ar);
          const as = ar ? item.answer_ar   : (item.answer_en   || item.answer_ar);
          lines.push(`**${ar ? "س" : "Q"}: ${qs}**`);
          lines.push(`${ar ? "ج" : "A"}: ${as}`);
          lines.push("");
        });
      }
      break;
    }

    case "map": {
      const topic   = ar ? c?.topic_ar   : (c?.topic_en   || c?.topic_ar);
      const metric  = ar ? c?.metric_ar  : (c?.metric_en  || c?.metric_ar);
      const insight = ar ? c?.insight_ar : (c?.insight_en || c?.insight_ar);
      if (topic)   lines.push(`**${ar ? "الموضوع" : "Topic"}:** ${topic}`);
      if (metric)  lines.push(`**${ar ? "المقياس" : "Metric"}:** ${metric}`);
      if (insight) { lines.push(""); lines.push(`💡 ${insight}`); }
      lines.push("");
      if (c?.regions?.length) {
        lines.push(`## ${ar ? "البيانات" : "Data"}`);
        c.regions.forEach((r: any) => {
          const name = ar ? r.name_ar : (r.name_en || r.name_ar);
          lines.push(`- ${r.flag || ""} **${name}:** ${r.value} ${r.unit || ""}${r.note ? ` (${r.note})` : ""}`);
        });
      }
      break;
    }

    case "comparison": {
      if (comp?.entity_a && comp?.entity_b) {
        const nameA = ar ? comp.entity_a.name_ar : (comp.entity_a.name_en || comp.entity_a.name_ar);
        const nameB = ar ? comp.entity_b.name_ar : (comp.entity_b.name_en || comp.entity_b.name_ar);
        lines.push(`## ${nameA} ${ar ? "مقابل" : "vs"} ${nameB}`);
        lines.push("");
        if (comp.axes?.length) {
          comp.axes.forEach((axis: any) => {
            const label = ar ? axis.label_ar : (axis.label_en || axis.label_ar);
            const vA    = ar ? axis.value_a_ar : (axis.value_a_en || axis.value_a_ar);
            const vB    = ar ? axis.value_b_ar : (axis.value_b_en || axis.value_b_ar);
            lines.push(`**${label}:**`);
            lines.push(`  - ${nameA}: ${vA}`);
            lines.push(`  - ${nameB}: ${vB}`);
            lines.push("");
          });
        }
      }
      break;
    }

    case "quiz": {
      if (q?.questions?.length) {
        lines.push(`## ${ar ? "الأسئلة" : "Questions"}`);
        q.questions.forEach((item: any, i: number) => {
          const qs = ar ? item.question_ar : (item.question_en || item.question_ar);
          lines.push(`**${i + 1}. ${qs}**`);
          item.options?.forEach((opt: any) => {
            const correct = opt.id === item.correct_answer;
            const text    = ar ? opt.text_ar : (opt.text_en || opt.text_ar);
            lines.push(`  ${correct ? "✓" : "○"} ${text}`);
          });
          lines.push("");
        });
      }
      break;
    }

    case "chart": {
      const title = ar ? chart?.title_ar : (chart?.title_en || chart?.title_ar);
      const desc  = ar ? chart?.description_ar : (chart?.description_en || chart?.description_ar);
      if (title) lines.push(`**${ar ? "المخطط" : "Chart"}:** ${title}`);
      if (desc)  lines.push(desc);
      if (chart?.series?.length) {
        lines.push("");
        lines.push(`## ${ar ? "البيانات" : "Data"}`);
        chart.series.forEach((s: any) => {
          const sName = ar ? s.name_ar : (s.name_en || s.name_ar);
          lines.push(`- **${sName}**: ${s.data?.join(", ")}`);
        });
      }
      break;
    }
  }

  // Sources
  const sources = c?.sources || [];
  if (sources.length > 0) {
    lines.push(`\n## ${ar ? "المصادر" : "Sources"}`);
    sources.forEach((s: any) => lines.push(`- [${s.name}](${s.url})`));
  }

  return lines.join("\n");
}

// ─── MCP Server ──────────────────────────────────────────────────────────────
function createJamharaServer() {
  const server = new McpServer({
    name: "jamhara",
    version: "1.0.0",
  });

  // ── Tool 1: search_posts ──────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore — MCP SDK type inference depth
  server.tool(
    "search_posts",
    "ابحث في منشورات جمهرة — منصة معرفية عربية تضم 19 نوع محتوى و43 قالباً بصرياً",
    {
      query: z.string().describe("نص البحث (عربي أو إنجليزي)"),
      type: z.string().optional().describe(`نوع المحتوى: ${POST_TYPES.join(", ")}`),
      category_slug: z.string().optional().describe("slug التصنيف (مثال: politics, technology)"),
      limit: z.number().min(1).max(20).default(10).describe("عدد النتائج (افتراضي: 10)"),
      locale: z.enum(["ar", "en"]).default("ar").describe("لغة النتائج"),
    },
    async ({ query, type, category_slug, limit, locale }) => {
      try {
        let q = supabase
          .from("posts")
          .select("id, title_ar, title_en, type, published_at, view_count, tags, categories!category_id(name_ar, name_en, slug)")
          .eq("status", "published")
          .or(`title_ar.ilike.%${query}%,title_en.ilike.%${query}%,body_ar.ilike.%${query}%`)
          .order("published_at", { ascending: false })
          .limit(limit);

        if (type) q = q.eq("type", type);

        const { data, error } = await q;
        if (error) throw new Error(error.message);
        if (!data?.length)
          return { content: [{ type: "text" as const, text: `لم يُعثر على نتائج لـ "${query}"` }] };

        const isAr = locale === "ar";
        const lines = [`# ${isAr ? `نتائج البحث عن: "${query}"` : `Search results for: "${query}"`}\n`];

        data.forEach((post: any, i: number) => {
          const title = isAr ? post.title_ar : (post.title_en || post.title_ar);
          const cat   = isAr ? post.categories?.name_ar : (post.categories?.name_en || post.categories?.name_ar);
          lines.push(`${i + 1}. **${title}**`);
          lines.push(`   ${TYPE_LABELS[post.type] || post.type} | ${cat || "—"}`);
          lines.push(`   ${isAr ? "المشاهدات" : "Views"}: ${(post.view_count || 0).toLocaleString()} | ${new Date(post.published_at).toLocaleDateString(isAr ? "ar-SA" : "en-US")}`);
          lines.push(`   https://jamhara.com/${locale}/p/${post.id}`);
          if (post.tags?.length) lines.push(`   🏷️ ${post.tags.slice(0, 4).join(" • ")}`);
          lines.push("");
        });

        return { content: [{ type: "text" as const, text: lines.join("\n") }] };
      } catch (err: any) {
        return { content: [{ type: "text" as const, text: `❌ خطأ: ${err.message}` }] };
      }
    }
  );

  // ── Tool 2: get_post ──────────────────────────────────────────────────────
  server.tool(
    "get_post",
    "احصل على المحتوى الكامل لمنشور من جمهرة بواسطة الـ ID — يعيد النص الكامل بحسب نوع المحتوى",
    {
      id: z.string().describe("معرّف المنشور UUID"),
      locale: z.enum(["ar", "en"]).default("ar").describe("لغة المحتوى"),
    },
    async ({ id, locale }) => {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*, categories!category_id(name_ar, name_en, slug, color)")
          .eq("id", id)
          .eq("status", "published")
          .single();

        if (error || !data)
          return { content: [{ type: "text" as const, text: `لم يُعثر على المنشور: ${id}` }] };

        return { content: [{ type: "text" as const, text: formatPost(data, locale) }] };
      } catch (err: any) {
        return { content: [{ type: "text" as const, text: `❌ خطأ: ${err.message}` }] };
      }
    }
  );

  // ── Tool 3: get_latest_posts ──────────────────────────────────────────────
  server.tool(
    "get_latest_posts",
    "احصل على أحدث منشورات جمهرة مع إمكانية التصفية بالنوع أو التصنيف",
    {
      type: z.string().optional().describe(`نوع المحتوى: ${POST_TYPES.join(", ")}`),
      category_slug: z.string().optional().describe("slug التصنيف"),
      limit: z.number().min(1).max(20).default(10).describe("عدد النتائج"),
      locale: z.enum(["ar", "en"]).default("ar"),
    },
    async ({ type, category_slug, limit, locale }) => {
      try {
        let q = supabase
          .from("posts")
          .select("id, title_ar, title_en, type, published_at, view_count, categories!category_id(name_ar, name_en, slug)")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(limit);

        if (type) q = q.eq("type", type);

        const { data, error } = await q;
        if (error) throw new Error(error.message);
        if (!data?.length) return { content: [{ type: "text" as const, text: "لا توجد منشورات." }] };

        const isAr = locale === "ar";
        const lines = [`# ${isAr ? "أحدث منشورات جمهرة" : "Latest Jamhara Posts"}\n`];

        data.forEach((post: any, i: number) => {
          const title = isAr ? post.title_ar : (post.title_en || post.title_ar);
          const cat   = isAr ? post.categories?.name_ar : (post.categories?.name_en || post.categories?.name_ar);
          lines.push(`${i + 1}. **${title}**`);
          lines.push(`   ${TYPE_LABELS[post.type] || post.type} | ${cat || "—"} | ${new Date(post.published_at).toLocaleDateString(isAr ? "ar-SA" : "en-US")}`);
          lines.push(`   https://jamhara.com/${locale}/p/${post.id}`);
          lines.push("");
        });

        return { content: [{ type: "text" as const, text: lines.join("\n") }] };
      } catch (err: any) {
        return { content: [{ type: "text" as const, text: `❌ خطأ: ${err.message}` }] };
      }
    }
  );

  // ── Tool 4: list_categories ───────────────────────────────────────────────
  server.tool(
    "list_categories",
    "احصل على قائمة تصنيفات جمهرة مع عدد منشورات كل تصنيف",
    {
      locale: z.enum(["ar", "en"]).default("ar"),
    },
    async ({ locale }) => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("name_ar, name_en, slug, post_count, color")
          .eq("is_active", true)
          .order("post_count", { ascending: false });

        if (error) throw new Error(error.message);
        if (!data?.length) return { content: [{ type: "text" as const, text: "لا توجد تصنيفات." }] };

        const isAr = locale === "ar";
        const lines = [`# ${isAr ? "تصنيفات جمهرة" : "Jamhara Categories"}\n`];

        data.forEach((cat: any) => {
          const name = isAr ? cat.name_ar : (cat.name_en || cat.name_ar);
          lines.push(`- **${name}** — slug: \`${cat.slug}\` — ${cat.post_count || 0} ${isAr ? "منشور" : "posts"}`);
        });

        lines.push(`\n${isAr ? "استخدم الـ slug في أدوات البحث والتصفية." : "Use the slug in search and filter tools."}`);

        return { content: [{ type: "text" as const, text: lines.join("\n") }] };
      } catch (err: any) {
        return { content: [{ type: "text" as const, text: `❌ خطأ: ${err.message}` }] };
      }
    }
  );

  // ── Tool 5: get_statistics ────────────────────────────────────────────────
  server.tool(
    "get_statistics",
    "احصل على إحصائيات منصة جمهرة: إجمالي المنشورات وتوزيعها حسب النوع والتصنيف",
    {
      locale: z.enum(["ar", "en"]).default("ar"),
    },
    async ({ locale }) => {
      try {
        const [totalRes, byTypeRes, topViewedRes] = await Promise.all([
          supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "published"),
          supabase.from("posts").select("type").eq("status", "published"),
          supabase.from("posts")
            .select("id, title_ar, title_en, type, view_count")
            .eq("status", "published")
            .order("view_count", { ascending: false })
            .limit(5),
        ]);

        const isAr = locale === "ar";
        const typeCounts: Record<string, number> = {};
        byTypeRes.data?.forEach((p: any) => {
          typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
        });

        const lines = [
          `# ${isAr ? "إحصائيات جمهرة" : "Jamhara Statistics"}\n`,
          `**${isAr ? "إجمالي المنشورات" : "Total Posts"}:** ${totalRes.count?.toLocaleString() || 0}`,
          `**${isAr ? "أنواع المحتوى" : "Content Types"}:** 19`,
          `**${isAr ? "القوالب البصرية" : "Visual Templates"}:** 43`,
          "",
          `## ${isAr ? "توزيع الأنواع" : "By Type"}`,
        ];

        Object.entries(typeCounts)
          .sort(([, a], [, b]) => b - a)
          .forEach(([type, count]) => {
            lines.push(`- ${TYPE_LABELS[type] || type}: **${count}**`);
          });

        if (topViewedRes.data?.length) {
          lines.push(`\n## ${isAr ? "الأكثر قراءة" : "Most Read"}`);
          topViewedRes.data.forEach((p: any, i: number) => {
            const title = isAr ? p.title_ar : (p.title_en || p.title_ar);
            lines.push(`${i + 1}. ${title} — ${(p.view_count || 0).toLocaleString()} ${isAr ? "قراءة" : "views"}`);
          });
        }

        return { content: [{ type: "text" as const, text: lines.join("\n") }] };
      } catch (err: any) {
        return { content: [{ type: "text" as const, text: `❌ خطأ: ${err.message}` }] };
      }
    }
  );

  return server;
}

// ─── Express HTTP Server ──────────────────────────────────────────────────────
const app = express();
app.use(express.json());

// SSE transport sessions (for Claude Desktop compatibility)
const sseTransports: Record<string, SSEServerTransport> = {};

// SSE endpoint — Claude Desktop connects here
app.get("/sse", async (req: Request, res: Response) => {
  const transport = new SSEServerTransport("/messages", res);
  const server = createJamharaServer();
  await server.connect(transport);
  sseTransports[transport.sessionId] = transport;
  res.on("close", () => {
    delete sseTransports[transport.sessionId];
    server.close();
  });
});

// SSE messages endpoint
app.post("/messages", async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  const transport = sseTransports[sessionId];
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).json({ error: "Session not found" });
  }
});

// StreamableHTTP endpoint (Claude Code / API clients)
app.post("/mcp", async (req: Request, res: Response) => {
  const server = createJamharaServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
  res.on("finish", () => server.close());
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    name: "jamhara-mcp",
    version: "1.0.0",
    description: "منصة جمهرة — مصدر معرفي عربي بالذكاء الاصطناعي",
    tools: ["search_posts", "get_post", "get_latest_posts", "list_categories", "get_statistics"],
    endpoints: { sse: "/sse", mcp: "/mcp" },
  });
});

app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "Jamhara MCP Server",
    description: "Arabic knowledge platform — 19 content types, 43 visual templates",
    sse_endpoint: "/sse",
    mcp_endpoint: "/mcp",
    health: "/health",
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Jamhara MCP Server → port ${PORT}`);
  console.log(`   SSE:    http://localhost:${PORT}/sse`);
  console.log(`   MCP:    http://localhost:${PORT}/mcp`);
});
