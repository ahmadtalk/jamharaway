import type {
  PostWithRelations,
  RankingConfig, NumbersConfig, ScenariosConfig,
  TimelinePostConfig, FactCheckConfig, ProfilePostConfig,
  BriefingConfig, QuotesConfig, ExplainerConfig, DebateConfig,
  GuideConfig, NetworkConfig, InterviewConfig, MapConfig,
  ChartConfig, QuizConfig, ComparisonConfig, NewsConfig,
  AnyQuizQuestion,
} from "@/lib/supabase/types";
// ── بيانات بطاقة الأخبار ──────────────────────────────────────────────────────
export interface NewsShareData {
  title:         string;
  lede?:         string;
  sourceName?:   string;
  keyPoints:     string[];
  whyItMatters?: string;
  whatsNext?:    string;
  quote?:        { text: string; author: string; role?: string };
  publishedAt?:  string;
}

// ── بيانات بطاقة البروفايل الغنية ─────────────────────────────────────────────
export interface ProfileShareData {
  fullName:      string;
  knownAs?:      string;
  tagline?:      string;
  avatarEmoji:   string;
  avatarColor:   string;
  subjectType:   string;
  quickFacts:    Array<{ icon: string; label: string; value: string }>;
  stats:         Array<{ icon?: string; value: string; unit?: string; label: string }>;
  timelineItems: Array<{ year: string; event: string; dotColor: string }>;
}

export interface ShareCardData {
  title: string;
  typeLabel: string;
  typeColor: string;
  typeEmoji: string;
  lede?: string;       // short text paragraph (1-2 sentences)
  items?: string[];    // 3-5 bullet points
  imageUrl?: string | null;
  // بيانات غنية لأنواع بعينها
  profileData?: ProfileShareData;
  newsData?:    NewsShareData;
}

export const TYPE_META: Record<string, { label: string; labelEn: string; emoji: string; color: string }> = {
  article:    { label: "مقال",        labelEn: "Article",     emoji: "✍️",  color: "#3B6CC4" },
  chart:      { label: "مخطط",        labelEn: "Chart",       emoji: "📈",  color: "#2D7A46" },
  quiz:       { label: "اختبار",      labelEn: "Quiz",        emoji: "🎯",  color: "#7C3AED" },
  comparison: { label: "مقارنة",      labelEn: "Comparison",  emoji: "⚡",  color: "#C05E1A" },
  ranking:    { label: "ترتيب",       labelEn: "Ranking",     emoji: "🥇",  color: "#D97706" },
  numbers:    { label: "أرقام",       labelEn: "Numbers",     emoji: "🔣",  color: "#4338CA" },
  scenarios:  { label: "سيناريوهات",  labelEn: "Scenarios",   emoji: "🌀",  color: "#BE185D" },
  timeline:   { label: "خط زمني",     labelEn: "Timeline",    emoji: "⏳",  color: "#0D9488" },
  factcheck:  { label: "تدقيق",       labelEn: "Fact Check",  emoji: "🔍",  color: "#DC2626" },
  profile:    { label: "بروفايل",     labelEn: "Profile",     emoji: "🪪",  color: "#4338CA" },
  briefing:   { label: "موجز",        labelEn: "Briefing",    emoji: "🗞️",  color: "#1D4ED8" },
  quotes:     { label: "اقتباسات",    labelEn: "Quotes",      emoji: "🗣️",  color: "#7C3AED" },
  explainer:  { label: "شارح",        labelEn: "Explainer",   emoji: "💡",  color: "#16A34A" },
  debate:     { label: "مناظرة",      labelEn: "Debate",      emoji: "🏛️",  color: "#C2410C" },
  guide:      { label: "دليل",        labelEn: "Guide",       emoji: "🧭",  color: "#0891B2" },
  network:    { label: "شبكة",        labelEn: "Network",     emoji: "🔗",  color: "#9333EA" },
  interview:  { label: "مقابلة",      labelEn: "Interview",   emoji: "🎙️",  color: "#D97706" },
  map:        { label: "خريطة",       labelEn: "Map",         emoji: "🌍",  color: "#059669" },
  news:       { label: "خبر",         labelEn: "News",        emoji: "📰",  color: "#E05A2B" },
};

const VERDICT_EMOJI: Record<string, string> = {
  true: "✅", false: "❌", misleading: "⚠️", partial: "🟡", unverified: "❓"
};

const TONE_EMOJI: Record<string, string> = {
  optimistic: "🟢", realistic: "🟡", pessimistic: "🔴"
};

export function buildShareCardData(post: PostWithRelations, locale: "ar" | "en" = "ar"): ShareCardData {
  const isEn = locale === "en";
  const meta = TYPE_META[post.type] ?? { label: post.type, labelEn: post.type, emoji: "📄", color: "#6B7280" };
  const base: ShareCardData = {
    title: isEn ? (post.title_en || post.title_ar) : post.title_ar,
    typeLabel: isEn ? meta.labelEn : meta.label,
    typeColor: meta.color,
    typeEmoji: meta.emoji,
    imageUrl: post.image_url,
  };

  const cfg = (post.content_config ?? {}) as unknown;

  switch (post.type) {

    case "article":
      return {
        ...base,
        lede: isEn
          ? (post.body_en || post.body_ar)?.slice(0, 220) ?? undefined
          : post.body_ar?.slice(0, 220) ?? undefined,
      };

    case "news": {
      const c = cfg as unknown as NewsConfig;
      const newsData: NewsShareData = {
        title:         base.title,
        lede:          (isEn ? post.body_en : post.body_ar) ?? undefined,
        sourceName:    c.source_name ?? undefined,
        keyPoints:     c.key_points_ar ?? [],
        whyItMatters:  c.why_it_matters_ar ?? undefined,
        whatsNext:     c.whats_next_ar ?? undefined,
        quote:         c.quote
          ? { text: c.quote.text_ar, author: c.quote.author_ar, role: c.quote.role_ar }
          : undefined,
        publishedAt:   c.gnews_published_at ?? undefined,
      };
      return {
        ...base,
        imageUrl: c.image_url ?? post.image_url,
        newsData,
      };
    }

    case "ranking": {
      const c = cfg as unknown as RankingConfig;
      return {
        ...base,
        lede: isEn ? (c.metric_en || c.metric_ar) : c.metric_ar,
        items: (c.items ?? []).slice(0, 5).map(i =>
          `${i.rank}. ${i.emoji ? i.emoji + " " : ""}${isEn ? (i.name_en || i.name_ar) : i.name_ar}${i.value ? " — " + i.value + (isEn ? (i.unit_en || i.unit_ar || "") : (i.unit_ar ? " " + i.unit_ar : "")) : ""}`
        ),
      };
    }

    case "numbers": {
      const c = cfg as unknown as NumbersConfig;
      return {
        ...base,
        items: (c.stats ?? []).slice(0, 5).map(s =>
          `${s.icon ? s.icon + " " : ""}${s.number} — ${isEn ? (s.label_en || s.label_ar) : s.label_ar}`
        ),
      };
    }

    case "scenarios": {
      const c = cfg as unknown as ScenariosConfig;
      return {
        ...base,
        lede: isEn ? (c.question_en || c.question_ar) : c.question_ar,
        items: (c.scenarios ?? []).map(s =>
          `${TONE_EMOJI[s.tone] ?? "•"} ${isEn ? (s.title_en || s.title_ar) : s.title_ar}${s.probability ? " (" + s.probability + ")" : ""}`
        ),
      };
    }

    case "timeline": {
      const c = cfg as unknown as TimelinePostConfig;
      return {
        ...base,
        items: (c.events ?? []).slice(0, 5).map(e =>
          `${e.emoji ? e.emoji + " " : ""}${e.year} — ${isEn ? (e.title_en || e.title_ar) : e.title_ar}`
        ),
      };
    }

    case "factcheck": {
      const c = cfg as unknown as FactCheckConfig;
      return {
        ...base,
        items: (c.claims ?? []).slice(0, 4).map(cl =>
          `${VERDICT_EMOJI[cl.verdict] ?? "•"} ${(isEn ? (cl.claim_en || cl.claim_ar) : cl.claim_ar).slice(0, 70)}`
        ),
      };
    }

    case "profile": {
      const c = cfg as unknown as ProfilePostConfig;
      const TIMELINE_DOT_COLORS: Record<string, string> = {
        milestone: "#4CB36C", award: "#F59E0B", crisis: "#E05A2B",
        founding:  "#2196F3", death: "#6B7280", other: "#7B5EA7",
      };
      const profileData: ProfileShareData = {
        fullName:    isEn ? (c.full_name_en || c.full_name_ar) : c.full_name_ar,
        knownAs:     isEn ? (c.known_as_en || c.known_as_ar || undefined) : (c.known_as_ar || undefined),
        tagline:     isEn ? (c.tagline_en   || c.tagline_ar  || undefined) : (c.tagline_ar  || undefined),
        avatarEmoji: c.avatar_emoji || "👤",
        avatarColor: c.avatar_color || "#373C55",
        subjectType: c.subject_type,
        quickFacts: (c.quick_facts ?? []).slice(0, 5).map(f => ({
          icon: f.icon,
          label: isEn ? (f.label_en || f.label_ar) : f.label_ar,
          value: isEn ? (f.value_en || f.value_ar) : f.value_ar,
        })),
        stats: (c.stats ?? []).slice(0, 4).map(s => ({
          icon: s.icon, value: s.value, unit: s.unit,
          label: isEn ? (s.label_en || s.label_ar) : s.label_ar,
        })),
        timelineItems: (c.timeline ?? []).slice(0, 5).map(t => ({
          year:     t.year,
          event:    isEn ? (t.event_en || t.event_ar) : t.event_ar,
          dotColor: TIMELINE_DOT_COLORS[t.type ?? "other"] ?? TIMELINE_DOT_COLORS.other,
        })),
      };
      return {
        ...base,
        lede:      isEn ? (c.tagline_en || c.tagline_ar || undefined) : (c.tagline_ar || undefined),
        imageUrl:  c.image_url  ?? post.image_url,
        profileData,
      };
    }

    case "briefing": {
      const c = cfg as unknown as BriefingConfig;
      return {
        ...base,
        lede: isEn ? (c.bottom_line_en || c.bottom_line_ar || undefined) : (c.bottom_line_ar ?? undefined),
        items: (c.key_points ?? []).slice(0, 4).map(kp => isEn ? (kp.text_en || kp.text_ar) : kp.text_ar),
      };
    }

    case "quotes": {
      const c = cfg as unknown as QuotesConfig;
      return {
        ...base,
        lede: isEn ? (c.topic_en || c.topic_ar) : c.topic_ar,
        items: (c.quotes ?? []).slice(0, 3).map(q =>
          `"${(isEn ? (q.text_en || q.text_ar) : q.text_ar).slice(0, 80)}" — ${isEn ? (q.author_en || q.author_ar) : q.author_ar}`
        ),
      };
    }

    case "explainer": {
      const c = cfg as unknown as ExplainerConfig;
      return {
        ...base,
        lede: isEn ? (c.intro_en || c.intro_ar || undefined) : (c.intro_ar ?? undefined),
        items: (c.questions ?? []).slice(0, 4).map(q => `❓ ${isEn ? (q.question_en || q.question_ar) : q.question_ar}`),
      };
    }

    case "debate": {
      const c = cfg as unknown as DebateConfig;
      return {
        ...base,
        lede: isEn ? (c.question_en || c.question_ar) : c.question_ar,
        items: [
          c.side_a ? `${c.side_a.emoji ?? "🔵"} ${isEn ? (c.side_a.label_en || c.side_a.label_ar) : c.side_a.label_ar}: ${(isEn ? (c.side_a.summary_en || c.side_a.summary_ar || c.side_a.arguments?.[0]?.point_en || c.side_a.arguments?.[0]?.point_ar || "") : (c.side_a.summary_ar ?? (c.side_a.arguments?.[0]?.point_ar ?? ""))).slice(0, 70)}` : "",
          c.side_b ? `${c.side_b.emoji ?? "🔴"} ${isEn ? (c.side_b.label_en || c.side_b.label_ar) : c.side_b.label_ar}: ${(isEn ? (c.side_b.summary_en || c.side_b.summary_ar || c.side_b.arguments?.[0]?.point_en || c.side_b.arguments?.[0]?.point_ar || "") : (c.side_b.summary_ar ?? (c.side_b.arguments?.[0]?.point_ar ?? ""))).slice(0, 70)}` : "",
          (isEn ? c.verdict_en : c.verdict_ar) ? `⚖️ ${(isEn ? (c.verdict_en || c.verdict_ar) : c.verdict_ar)!.slice(0, 80)}` : "",
        ].filter(Boolean),
      };
    }

    case "guide": {
      const c = cfg as unknown as GuideConfig;
      return {
        ...base,
        lede: isEn ? (c.goal_en || c.goal_ar) : c.goal_ar,
        items: (c.steps ?? []).slice(0, 4).map(s =>
          `${s.icon ? s.icon + " " : ""}${s.step}. ${isEn ? (s.title_en || s.title_ar) : s.title_ar}`
        ),
      };
    }

    case "network": {
      const c = cfg as unknown as NetworkConfig;
      return {
        ...base,
        lede: isEn
          ? `Network: ${c.center_en || c.center_ar}${c.center_role_en || c.center_role_ar ? " · " + (c.center_role_en || c.center_role_ar) : ""}`
          : `شبكة علاقات: ${c.center_ar}${c.center_role_ar ? " · " + c.center_role_ar : ""}`,
        items: (c.nodes ?? []).slice(0, 4).map(n =>
          `${n.emoji ?? "🔗"} ${isEn ? (n.name_en || n.name_ar) : n.name_ar} — ${isEn ? (n.relation_label_en || n.relation_label_ar) : n.relation_label_ar}`
        ),
      };
    }

    case "interview": {
      const c = cfg as unknown as InterviewConfig;
      return {
        ...base,
        lede: isEn
          ? `Interview with ${c.interviewee_en || c.interviewee_ar}${c.role_en || c.role_ar ? " · " + (c.role_en || c.role_ar) : ""}`
          : `حوار مع ${c.interviewee_ar}${c.role_ar ? " · " + c.role_ar : ""}`,
        items: (c.qa ?? []).slice(0, 3).map(q => `❓ ${isEn ? (q.question_en || q.question_ar) : q.question_ar}`),
      };
    }

    case "map": {
      const c = cfg as unknown as MapConfig;
      return {
        ...base,
        lede: isEn ? (c.insight_en || c.insight_ar || c.topic_en || c.topic_ar) : (c.insight_ar ?? c.topic_ar),
        items: (c.regions ?? []).slice(0, 5).map(r =>
          `${r.flag ?? "🗺"} ${isEn ? (r.name_en || r.name_ar) : r.name_ar}${r.value ? ": " + r.value + (isEn ? (r.unit_en || r.unit_ar || "") : (r.unit_ar ? " " + r.unit_ar : "")) : ""}`
        ),
      };
    }

    case "chart": {
      const c = (post.chart_config as ChartConfig | null) ?? ({} as ChartConfig);
      const seriesNames = (c.series ?? []).map(s => s.name).filter(Boolean).slice(0, 4);
      return {
        ...base,
        lede: isEn
          ? (post.body_en || post.body_ar)?.slice(0, 200) ?? undefined
          : post.body_ar?.slice(0, 200) ?? undefined,
        items: seriesNames.length > 0 ? seriesNames : undefined,
      };
    }

    case "quiz": {
      const c = (post.quiz_config as QuizConfig | null) ?? ({} as QuizConfig);
      return {
        ...base,
        items: (c.questions ?? []).slice(0, 3).map((q: AnyQuizQuestion) => {
          const qr = q as unknown as Record<string, string>;
          if ("question_ar" in q) return `❓ ${isEn ? (qr.question_en || qr.question_ar) : qr.question_ar}`;
          if ("statement_ar" in q) return `❓ ${isEn ? (qr.statement_en || qr.statement_ar) : qr.statement_ar}`;
          if ("instruction_ar" in q) return `❓ ${isEn ? (qr.instruction_en || qr.instruction_ar) : qr.instruction_ar}`;
          return isEn ? "❓ Question" : "❓ سؤال";
        }),
      };
    }

    case "comparison": {
      const c = (post.comparison_config as ComparisonConfig | null) ?? ({} as ComparisonConfig);
      const ea = isEn ? (c.entity_a?.name_en || c.entity_a?.name_ar || "") : (c.entity_a?.name_ar ?? "");
      const eb = isEn ? (c.entity_b?.name_en || c.entity_b?.name_ar || "") : (c.entity_b?.name_ar ?? "");
      const dims = (c.dimensions ?? c.features ?? c.topics ?? c.axes ?? []) as unknown as Array<Record<string, unknown>>;
      return {
        ...base,
        lede: isEn ? `${ea} vs ${eb}` : `${ea} مقابل ${eb}`,
        items: dims.slice(0, 4).map(d =>
          String(isEn ? (d.name_en ?? d.topic_en ?? d.name_ar ?? d.topic_ar ?? "") : (d.name_ar ?? d.topic_ar ?? ""))
        ).filter(Boolean),
      };
    }

    default:
      return {
        ...base,
        lede: isEn
          ? (post.body_en || post.body_ar)?.slice(0, 200) ?? undefined
          : post.body_ar?.slice(0, 200) ?? undefined,
      };
  }
}
