/**
 * SharePreviewCard — بطاقة مشاركة موحّدة 1080×1350 (4:5 Instagram)
 * ──────────────────────────────────────────────────────────────────
 * تُستخدم في /share-preview/[id] لـ Puppeteer فقط
 * تدعم جميع 19 نوع محتوى + ثنائية اللغة
 */
"use client";

import { buildShareCardData, TYPE_META } from "@/lib/share-card-data";
import type { PostWithRelations, Category } from "@/lib/supabase/types";

const W = 1080;
const H = 1350;
const FONT = "'Cairo', 'IBM Plex Sans Arabic', sans-serif";
const GREEN = "#4CB36C";
const NAVY  = "#373C55";
const INK   = "#1E2130";
const MUTED = "#6B7280";
const PALE  = "#F2FAF5";

interface Props {
  post:    PostWithRelations;
  locale:  "ar" | "en";
  logoSrc: string;
}

export default function SharePreviewCard({ post, locale, logoSrc }: Props) {
  const isAr  = locale === "ar";
  const data  = buildShareCardData(post, locale);
  const cat   = post.category as Category | null | undefined;
  const catColor = cat?.color ?? GREEN;
  const catName  = isAr ? (cat?.name_ar ?? "") : (cat?.name_en ?? cat?.name_ar ?? "");
  const meta     = TYPE_META[post.type] ?? { emoji: "📄", color: "#6B7280" };

  const footerText = isAr
    ? "اقرأ المقال كاملاً في جمهرة"
    : "Read more on Jamhara";

  const slogan = isAr ? "قيمة المرء ما يعرف" : "Knowledge is worth";

  return (
    <div style={{
      width: W, height: H, overflow: "hidden",
      display: "flex", flexDirection: "column",
      fontFamily: FONT, direction: isAr ? "rtl" : "ltr",
      background: "#fff",
    }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{
        height: 100, flexShrink: 0,
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
        background: PALE,
        borderBottom: `4px solid ${GREEN}`,
      }}>
        {/* Logo */}
        <img src={logoSrc} alt="جمهرة" style={{ height: 44, objectFit: "contain" }} />

        {/* Slogan */}
        <div style={{
          fontSize: 22, fontWeight: 700, color: GREEN,
          fontStyle: "italic", letterSpacing: isAr ? 0 : ".02em",
        }}>
          {slogan}
        </div>
      </div>

      {/* ── Category bar ───────────────────────────────────────── */}
      <div style={{
        height: 50, flexShrink: 0,
        display: "flex", alignItems: "center",
        padding: "0 48px", gap: 10,
        background: catColor + "18",
        borderBottom: `2px solid ${catColor}22`,
      }}>
        <span style={{ fontSize: 22 }}>{meta.emoji}</span>
        <span style={{
          fontSize: 19, fontWeight: 700, color: catColor,
          letterSpacing: isAr ? 0 : ".02em",
        }}>
          {catName}
        </span>
      </div>

      {/* ── Title ──────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        padding: "34px 48px 24px",
        borderBottom: `1px solid #E8EBF0`,
      }}>
        <h1 style={{
          margin: 0, fontSize: 46, fontWeight: 900,
          lineHeight: 1.35, color: INK,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {data.title}
        </h1>
      </div>

      {/* ── Content (fills remaining space) ────────────────────── */}
      <div style={{ flex: 1, overflow: "hidden", padding: "28px 48px" }}>
        <ContentSection data={data} post={post} locale={locale} catColor={catColor} />
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div style={{
        height: 96, flexShrink: 0,
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
        background: NAVY,
        borderTop: `4px solid ${GREEN}`,
      }}>
        <div style={{
          fontSize: 21, fontWeight: 700, color: "#fff",
          letterSpacing: isAr ? 0 : ".01em",
        }}>
          {footerText}
        </div>
        <div style={{
          fontSize: 18, fontWeight: 600, color: GREEN,
          letterSpacing: ".03em",
        }}>
          jamhara.com
        </div>
      </div>
    </div>
  );
}

// ── Content section dispatcher ──────────────────────────────────────────────
function ContentSection({ data, post, locale, catColor }: {
  data: ReturnType<typeof buildShareCardData>;
  post: PostWithRelations;
  locale: "ar" | "en";
  catColor: string;
}) {
  const isAr = locale === "ar";
  const cfg  = (post.content_config ?? {}) as Record<string, unknown>;

  switch (post.type) {

    case "article":
      return <ArticleContent lede={data.lede} isAr={isAr} />;

    case "news":
      return <NewsContent data={data} isAr={isAr} />;

    case "profile":
      return <ProfileContent data={data} isAr={isAr} catColor={catColor} />;

    case "ranking":
      return <RankingContent data={data} cfg={cfg} isAr={isAr} catColor={catColor} />;

    case "numbers":
      return <NumbersContent cfg={cfg} isAr={isAr} catColor={catColor} />;

    case "timeline":
      return <TimelineContent cfg={cfg} isAr={isAr} />;

    case "factcheck":
      return <FactcheckContent cfg={cfg} isAr={isAr} />;

    case "briefing":
      return <BriefingContent data={data} isAr={isAr} catColor={catColor} />;

    case "quotes":
      return <QuotesContent cfg={cfg} isAr={isAr} />;

    case "explainer":
      return <ExplainerContent cfg={cfg} isAr={isAr} />;

    case "debate":
      return <DebateContent cfg={cfg} isAr={isAr} />;

    case "guide":
      return <GuideContent cfg={cfg} isAr={isAr} catColor={catColor} />;

    case "scenarios":
      return <ScenariosContent cfg={cfg} data={data} isAr={isAr} />;

    case "network":
      return <NetworkContent cfg={cfg} isAr={isAr} />;

    case "interview":
      return <InterviewContent cfg={cfg} isAr={isAr} />;

    case "map":
      return <MapContent cfg={cfg} data={data} isAr={isAr} />;

    case "comparison":
      return <ComparisonContent post={post} data={data} isAr={isAr} catColor={catColor} />;

    case "quiz":
      return <QuizContent post={post} isAr={isAr} catColor={catColor} />;

    case "chart":
      return <ChartContent data={data} isAr={isAr} post={post} />;

    default:
      return <DefaultContent lede={data.lede} items={data.items} isAr={isAr} />;
  }
}

// ─── Article ──────────────────────────────────────────────────────────────────
function ArticleContent({ lede, isAr }: { lede?: string; isAr: boolean }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      {lede && (
        <p style={{
          margin: 0, fontSize: 28, lineHeight: 1.8,
          color: INK, fontWeight: 300,
          display: "-webkit-box", WebkitLineClamp: 8,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {lede}
        </p>
      )}
    </div>
  );
}

// ─── News ────────────────────────────────────────────────────────────────────
function NewsContent({ data, isAr }: { data: ReturnType<typeof buildShareCardData>; isAr: boolean }) {
  const nd = data.newsData;
  const lede = nd?.lede || data.lede;
  const points = nd?.keyPoints ?? [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, height: "100%", overflow: "hidden" }}>
      {lede && (
        <p style={{
          margin: 0, fontSize: 26, lineHeight: 1.75, color: INK, fontWeight: 300,
          display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {lede}
        </p>
      )}
      {points.slice(0, 4).map((pt, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "#E05A2B", color: "#fff",
            fontSize: 15, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, marginTop: 2,
          }}>{i + 1}</span>
          <span style={{ fontSize: 23, lineHeight: 1.6, color: INK }}>{pt}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Profile ─────────────────────────────────────────────────────────────────
function ProfileContent({ data, isAr, catColor }: { data: ReturnType<typeof buildShareCardData>; isAr: boolean; catColor: string }) {
  const pd = data.profileData;
  if (!pd) return <DefaultContent lede={data.lede} items={data.items} isAr={isAr} />;
  return (
    <div style={{ display: "flex", gap: 40, height: "100%", alignItems: "flex-start" }}>
      {/* Avatar */}
      <div style={{
        width: 160, height: 160, borderRadius: "50%",
        background: pd.avatarColor, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 72, border: `4px solid ${pd.avatarColor}44`,
      }}>
        {pd.avatarEmoji}
      </div>
      {/* Info */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, overflow: "hidden" }}>
        {pd.tagline && (
          <p style={{ margin: 0, fontSize: 22, color: MUTED, fontStyle: "italic", lineHeight: 1.5 }}>
            {pd.tagline}
          </p>
        )}
        {pd.quickFacts.slice(0, 5).map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 22 }}>{f.icon}</span>
            <span style={{ fontSize: 18, color: MUTED, flexShrink: 0 }}>{f.label}:</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: INK }}>{f.value}</span>
          </div>
        ))}
        {pd.stats.slice(0, 3).map((s, i) => (
          <div key={i} style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: catColor + "15", borderRadius: 8, padding: "8px 16px",
          }}>
            {!!s.icon && <span style={{ fontSize: 22 }}>{s.icon}</span>}
            <span style={{ fontSize: 28, fontWeight: 900, color: catColor }}>{s.value}</span>
            {s.unit && <span style={{ fontSize: 16, color: MUTED }}>{s.unit}</span>}
            <span style={{ fontSize: 16, color: INK }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Ranking ─────────────────────────────────────────────────────────────────
function RankingContent({ data, cfg, isAr, catColor }: { data: ReturnType<typeof buildShareCardData>; cfg: Record<string, unknown>; isAr: boolean; catColor: string }) {
  const items = (cfg.items as Array<Record<string, unknown>> | undefined) ?? [];
  const metric = data.lede;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, overflow: "hidden" }}>
      {metric && <p style={{ margin: 0, fontSize: 20, color: MUTED }}>{metric}</p>}
      {items.slice(0, 5).map((item, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 18,
          padding: "12px 18px", borderRadius: 10,
          background: i === 0 ? catColor + "18" : "#F8F9FA",
          border: i === 0 ? `2px solid ${catColor}44` : "2px solid transparent",
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: i < 3 ? catColor : "#E8EBF0",
            color: i < 3 ? "#fff" : MUTED,
            fontWeight: 900, fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
          </div>
          {!!item.emoji && <span style={{ fontSize: 26 }}>{String(item.emoji)}</span>}
          <span style={{ flex: 1, fontSize: 22, fontWeight: 600, color: INK }}>
            {isAr ? String(item.name_ar ?? "") : String(item.name_en || item.name_ar || "")}
          </span>
          {!!item.value && (
            <span style={{ fontSize: 20, fontWeight: 800, color: catColor }}>
              {String(item.value)} {isAr ? String(item.unit_ar ?? "") : String(item.unit_en || item.unit_ar || "")}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Numbers ─────────────────────────────────────────────────────────────────
function NumbersContent({ cfg, isAr, catColor }: { cfg: Record<string, unknown>; isAr: boolean; catColor: string }) {
  const stats = (cfg.stats as Array<Record<string, unknown>> | undefined) ?? [];
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr",
      gap: 20, alignContent: "start",
    }}>
      {stats.slice(0, 6).map((s, i) => (
        <div key={i} style={{
          padding: "22px 24px", borderRadius: 14,
          background: i % 2 === 0 ? catColor + "12" : "#F8F9FA",
          border: `1.5px solid ${catColor}22`,
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          {!!s.icon && <span style={{ fontSize: 30 }}>{String(s.icon)}</span>}
          <div style={{ fontSize: 38, fontWeight: 900, color: catColor, lineHeight: 1 }}>
            {String(s.number ?? "")}
          </div>
          <div style={{ fontSize: 17, color: INK, fontWeight: 600 }}>
            {isAr ? String(s.label_ar ?? "") : String(s.label_en || s.label_ar || "")}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Timeline ────────────────────────────────────────────────────────────────
function TimelineContent({ cfg, isAr }: { cfg: Record<string, unknown>; isAr: boolean }) {
  const events = (cfg.events as Array<Record<string, unknown>> | undefined) ?? [];
  const COLORS: Record<string, string> = {
    milestone: "#4CB36C", award: "#F59E0B", crisis: "#E05A2B",
    founding: "#2196F3", death: "#6B7280", other: "#7B5EA7",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, overflow: "hidden" }}>
      {events.slice(0, 6).map((ev, i) => {
        const dotColor = COLORS[String(ev.type ?? "other")] ?? COLORS.other;
        return (
          <div key={i} style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
            {/* Dot column */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 44, flexShrink: 0 }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                background: dotColor, marginTop: 20, flexShrink: 0,
              }} />
              {i < events.slice(0, 6).length - 1 && (
                <div style={{ width: 2, flex: 1, background: "#E8EBF0", minHeight: 20 }} />
              )}
            </div>
            {/* Content */}
            <div style={{ padding: "14px 16px 14px 0", flex: 1 }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: dotColor }}>{String(ev.year ?? "")}</span>
              {!!ev.emoji && <span style={{ fontSize: 20, margin: "0 6px" }}>{String(ev.emoji)}</span>}
              <span style={{ fontSize: 21, color: INK, marginInlineStart: 8 }}>
                {isAr ? String(ev.title_ar ?? "") : String(ev.title_en || ev.title_ar || "")}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── FactCheck ───────────────────────────────────────────────────────────────
const VERDICT_LABEL: Record<string, { ar: string; en: string; bg: string; color: string }> = {
  true:       { ar: "صحيح",       en: "True",        bg: "#D1FAE5", color: "#059669" },
  false:      { ar: "خاطئ",       en: "False",       bg: "#FEE2E2", color: "#DC2626" },
  misleading: { ar: "مضلل",       en: "Misleading",  bg: "#FEF3C7", color: "#D97706" },
  partial:    { ar: "جزئي",       en: "Partial",     bg: "#FEF3C7", color: "#D97706" },
  unverified: { ar: "غير مؤكد",   en: "Unverified",  bg: "#F3F4F6", color: "#6B7280" },
};
const VERDICT_EMOJI: Record<string, string> = {
  true: "✅", false: "❌", misleading: "⚠️", partial: "🟡", unverified: "❓"
};

function FactcheckContent({ cfg, isAr }: { cfg: Record<string, unknown>; isAr: boolean }) {
  const claims = (cfg.claims as Array<Record<string, unknown>> | undefined) ?? [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, overflow: "hidden" }}>
      {claims.slice(0, 5).map((cl, i) => {
        const v = String(cl.verdict ?? "unverified");
        const vInfo = VERDICT_LABEL[v] ?? VERDICT_LABEL.unverified;
        return (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: 16,
            padding: "14px 18px", borderRadius: 10,
            background: vInfo.bg, border: `1.5px solid ${vInfo.color}33`,
          }}>
            <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{VERDICT_EMOJI[v]}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 21, color: INK, lineHeight: 1.5 }}>
                {isAr ? String(cl.claim_ar ?? "") : String(cl.claim_en || cl.claim_ar || "")}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: vInfo.color, marginTop: 4 }}>
                {isAr ? vInfo.ar : vInfo.en}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Briefing ────────────────────────────────────────────────────────────────
function BriefingContent({ data, isAr, catColor }: { data: ReturnType<typeof buildShareCardData>; isAr: boolean; catColor: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, overflow: "hidden" }}>
      {data.lede && (
        <div style={{
          padding: "18px 22px", borderRadius: 12,
          background: catColor + "15", borderRight: isAr ? `5px solid ${catColor}` : "none",
          borderLeft: !isAr ? `5px solid ${catColor}` : "none",
          fontSize: 24, fontWeight: 700, color: INK, lineHeight: 1.6,
        }}>
          {data.lede}
        </div>
      )}
      {(data.items ?? []).map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span style={{
            width: 10, height: 10, borderRadius: "50%",
            background: catColor, flexShrink: 0, marginTop: 10,
          }} />
          <span style={{ fontSize: 22, lineHeight: 1.6, color: INK }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Quotes ───────────────────────────────────────────────────────────────────
function QuotesContent({ cfg, isAr }: { cfg: Record<string, unknown>; isAr: boolean }) {
  const quotes = (cfg.quotes as Array<Record<string, unknown>> | undefined) ?? [];
  const SENTIMENT_COLOR: Record<string, string> = {
    positive: "#4CB36C", negative: "#DC2626", neutral: "#6B7280", warning: "#D97706",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, overflow: "hidden" }}>
      {quotes.slice(0, 3).map((q, i) => {
        const color = SENTIMENT_COLOR[String(q.sentiment ?? "neutral")] ?? MUTED;
        return (
          <div key={i} style={{
            padding: "18px 24px", borderRadius: 12,
            background: "#F8F9FA", borderRight: isAr ? `5px solid ${color}` : "none",
            borderLeft: !isAr ? `5px solid ${color}` : "none",
          }}>
            <p style={{ margin: "0 0 10px", fontSize: 22, lineHeight: 1.6, color: INK, fontStyle: "italic" }}>
              "{isAr ? String(q.text_ar ?? "") : String(q.text_en || q.text_ar || "")}"
            </p>
            <div style={{ fontSize: 17, color: MUTED }}>
              — {isAr ? String(q.author_ar ?? "") : String(q.author_en || q.author_ar || "")}
              {!!(isAr ? q.role_ar : (q.role_en || q.role_ar)) &&
                <span> · {isAr ? String(q.role_ar ?? "") : String(q.role_en || q.role_ar || "")}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Explainer ───────────────────────────────────────────────────────────────
function ExplainerContent({ cfg, isAr }: { cfg: Record<string, unknown>; isAr: boolean }) {
  const questions = (cfg.questions as Array<Record<string, unknown>> | undefined) ?? [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, overflow: "hidden" }}>
      {questions.slice(0, 4).map((q, i) => (
        <div key={i} style={{
          padding: "16px 20px", borderRadius: 10, background: "#F8F9FA",
          border: "1.5px solid #E8EBF0",
        }}>
          <div style={{ fontSize: 21, fontWeight: 700, color: INK, marginBottom: 8 }}>
            💡 {isAr ? String(q.question_ar ?? "") : String(q.question_en || q.question_ar || "")}
          </div>
          <div style={{
            fontSize: 19, color: MUTED, lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {isAr ? String(q.answer_ar ?? "") : String(q.answer_en || q.answer_ar || "")}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Debate ───────────────────────────────────────────────────────────────────
function DebateContent({ cfg, isAr }: { cfg: Record<string, unknown>; isAr: boolean }) {
  const a = cfg.side_a as Record<string, unknown> | undefined;
  const b = cfg.side_b as Record<string, unknown> | undefined;
  const verdict = isAr ? String(cfg.verdict_ar ?? "") : String(cfg.verdict_en || cfg.verdict_ar || "");
  const argsA = (a?.arguments as Array<Record<string, unknown>> | undefined) ?? [];
  const argsB = (b?.arguments as Array<Record<string, unknown>> | undefined) ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 16 }}>
        {/* Side A */}
        <div style={{ flex: 1, padding: "18px", borderRadius: 12, background: "#EFF6FF", border: "1.5px solid #BFDBFE" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#1D4ED8", marginBottom: 12 }}>
            {a?.emoji ? String(a.emoji) : "🔵"} {isAr ? String(a?.label_ar ?? "") : String(a?.label_en || a?.label_ar || "")}
          </div>
          {argsA.slice(0, 2).map((arg, i) => (
            <div key={i} style={{ fontSize: 18, color: INK, lineHeight: 1.5, marginBottom: 8 }}>
              • {isAr ? String(arg.point_ar ?? "") : String(arg.point_en || arg.point_ar || "")}
            </div>
          ))}
        </div>
        {/* Side B */}
        <div style={{ flex: 1, padding: "18px", borderRadius: 12, background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#DC2626", marginBottom: 12 }}>
            {b?.emoji ? String(b.emoji) : "🔴"} {isAr ? String(b?.label_ar ?? "") : String(b?.label_en || b?.label_ar || "")}
          </div>
          {argsB.slice(0, 2).map((arg, i) => (
            <div key={i} style={{ fontSize: 18, color: INK, lineHeight: 1.5, marginBottom: 8 }}>
              • {isAr ? String(arg.point_ar ?? "") : String(arg.point_en || arg.point_ar || "")}
            </div>
          ))}
        </div>
      </div>
      {verdict && (
        <div style={{
          padding: "14px 20px", borderRadius: 10,
          background: "#FFFBEB", border: "1.5px solid #FCD34D",
          fontSize: 20, color: "#92400E",
        }}>
          ⚖️ {verdict}
        </div>
      )}
    </div>
  );
}

// ─── Guide ───────────────────────────────────────────────────────────────────
function GuideContent({ cfg, isAr, catColor }: { cfg: Record<string, unknown>; isAr: boolean; catColor: string }) {
  const steps = (cfg.steps as Array<Record<string, unknown>> | undefined) ?? [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, overflow: "hidden" }}>
      {steps.slice(0, 5).map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{
            width: 42, height: 42, borderRadius: "50%",
            background: catColor, color: "#fff",
            fontWeight: 900, fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {s.icon ? String(s.icon) : i + 1}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 21, fontWeight: 700, color: INK }}>
              {isAr ? String(s.title_ar ?? "") : String(s.title_en || s.title_ar || "")}
            </div>
            {!!(s.duration_ar || s.duration_en) && (
              <div style={{ fontSize: 16, color: MUTED, marginTop: 4 }}>
                ⏱ {isAr ? String(s.duration_ar ?? "") : String(s.duration_en || s.duration_ar || "")}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Scenarios ───────────────────────────────────────────────────────────────
function ScenariosContent({ cfg, data, isAr }: { cfg: Record<string, unknown>; data: ReturnType<typeof buildShareCardData>; isAr: boolean }) {
  const scenarios = (cfg.scenarios as Array<Record<string, unknown>> | undefined) ?? [];
  const TONE_COLOR: Record<string, { bg: string; color: string; dot: string }> = {
    optimistic: { bg: "#D1FAE5", color: "#059669", dot: "🟢" },
    realistic:  { bg: "#FEF3C7", color: "#D97706", dot: "🟡" },
    pessimistic: { bg: "#FEE2E2", color: "#DC2626", dot: "🔴" },
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, overflow: "hidden" }}>
      {data.lede && (
        <p style={{ margin: "0 0 4px", fontSize: 22, color: MUTED, lineHeight: 1.5 }}>{data.lede}</p>
      )}
      {scenarios.map((s, i) => {
        const tone = String(s.tone ?? "realistic");
        const tc = TONE_COLOR[tone] ?? TONE_COLOR.realistic;
        return (
          <div key={i} style={{
            padding: "16px 20px", borderRadius: 10,
            background: tc.bg, border: `1.5px solid ${tc.color}33`,
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: tc.color, marginBottom: 6 }}>
              {tc.dot} {isAr ? String(s.title_ar ?? "") : String(s.title_en || s.title_ar || "")}
              {!!s.probability && <span style={{ fontSize: 16, marginInlineStart: 8 }}>({String(s.probability)})</span>}
            </div>
            <div style={{
              fontSize: 18, color: INK, lineHeight: 1.5,
              display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {isAr ? String(s.description_ar ?? "") : String(s.description_en || s.description_ar || "")}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Network ─────────────────────────────────────────────────────────────────
const RELATION_COLOR: Record<string, string> = {
  ally: "#2D7A46", rival: "#B45309", partner: "#1D4ED8",
  competitor: "#DC2626", neutral: "#6B7280",
};

function NetworkContent({ cfg, isAr }: { cfg: Record<string, unknown>; isAr: boolean }) {
  const center = isAr ? String(cfg.center_ar ?? "") : String(cfg.center_en || cfg.center_ar || "");
  const nodes = (cfg.nodes as Array<Record<string, unknown>> | undefined) ?? [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, overflow: "hidden" }}>
      {/* Center */}
      <div style={{
        padding: "16px 24px", borderRadius: 12,
        background: "#373C55", color: "#fff",
        fontSize: 24, fontWeight: 800, textAlign: "center",
      }}>
        {cfg.center_emoji ? String(cfg.center_emoji) : "🎯"} {center}
        {!!(isAr ? cfg.center_role_ar : (cfg.center_role_en || cfg.center_role_ar)) && (
          <div style={{ fontSize: 16, color: "#9CA3AF", marginTop: 4 }}>
            {isAr ? String(cfg.center_role_ar ?? "") : String(cfg.center_role_en || cfg.center_role_ar || "")}
          </div>
        )}
      </div>
      {/* Nodes */}
      {nodes.slice(0, 5).map((n, i) => {
        const color = RELATION_COLOR[String(n.relation_type ?? "neutral")] ?? MUTED;
        return (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "12px 16px", borderRadius: 10,
            background: color + "12", border: `1.5px solid ${color}33`,
          }}>
            <span style={{ fontSize: 26 }}>{n.emoji ? String(n.emoji) : "🔗"}</span>
            <span style={{ flex: 1, fontSize: 20, fontWeight: 600, color: INK }}>
              {isAr ? String(n.name_ar ?? "") : String(n.name_en || n.name_ar || "")}
            </span>
            <span style={{
              fontSize: 15, fontWeight: 700, color,
              background: color + "18", padding: "4px 10px", borderRadius: 6,
            }}>
              {isAr ? String(n.relation_label_ar ?? "") : String(n.relation_label_en || n.relation_label_ar || "")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Interview ───────────────────────────────────────────────────────────────
function InterviewContent({ cfg, isAr }: { cfg: Record<string, unknown>; isAr: boolean }) {
  const qa = (cfg.qa as Array<Record<string, unknown>> | undefined) ?? [];
  const interviewee = isAr ? String(cfg.interviewee_ar ?? "") : String(cfg.interviewee_en || cfg.interviewee_ar || "");
  const role = isAr ? String(cfg.role_ar ?? "") : String(cfg.role_en || cfg.role_ar || "");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, overflow: "hidden" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 20px", borderRadius: 10,
        background: "#F0F4FF", border: "1.5px solid #C7D7F5",
      }}>
        <span style={{ fontSize: 32 }}>🎙️</span>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#1D4ED8" }}>{interviewee}</div>
          {role && <div style={{ fontSize: 16, color: MUTED }}>{role}</div>}
        </div>
      </div>
      {qa.slice(0, 3).map((q, i) => (
        <div key={i} style={{
          padding: "14px 18px", borderRadius: 10, background: "#F8F9FA",
          border: "1.5px solid #E8EBF0",
        }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: "#1D4ED8", marginBottom: 8 }}>
            ❓ {isAr ? String(q.question_ar ?? "") : String(q.question_en || q.question_ar || "")}
          </div>
          <div style={{
            fontSize: 19, color: INK, lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {isAr ? String(q.answer_ar ?? "") : String(q.answer_en || q.answer_ar || "")}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Map ─────────────────────────────────────────────────────────────────────
function MapContent({ cfg, data, isAr }: { cfg: Record<string, unknown>; data: ReturnType<typeof buildShareCardData>; isAr: boolean }) {
  const regions = (cfg.regions as Array<Record<string, unknown>> | undefined) ?? [];
  const maxVal = Math.max(1, ...regions.map(r => Number(r.value) || 0));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, overflow: "hidden" }}>
      {data.lede && (
        <p style={{ margin: "0 0 4px", fontSize: 20, color: MUTED, lineHeight: 1.5 }}>{data.lede}</p>
      )}
      {regions.slice(0, 6).map((r, i) => {
        const pct = Math.round((Number(r.value) || 0) / maxVal * 100);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>{String(r.flag ?? "🗺")}</span>
            <span style={{ width: 160, fontSize: 19, fontWeight: 600, color: INK, flexShrink: 0 }}>
              {isAr ? String(r.name_ar ?? "") : String(r.name_en || r.name_ar || "")}
            </span>
            <div style={{ flex: 1, height: 14, background: "#E8EBF0", borderRadius: 7, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: GREEN, borderRadius: 7 }} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: GREEN, minWidth: 80, textAlign: isAr ? "right" : "left" }}>
              {String(r.value ?? "")} {isAr ? String(r.unit_ar ?? "") : String(r.unit_en || r.unit_ar || "")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Comparison ───────────────────────────────────────────────────────────────
function ComparisonContent({ post, data, isAr, catColor }: { post: PostWithRelations; data: ReturnType<typeof buildShareCardData>; isAr: boolean; catColor: string }) {
  const cc = post.comparison_config as Record<string, unknown> | null ?? {};
  const ea = cc.entity_a as Record<string, unknown> | undefined;
  const eb = cc.entity_b as Record<string, unknown> | undefined;
  const dims = ((cc.dimensions ?? cc.features ?? cc.topics ?? cc.axes ?? []) as Array<Record<string, unknown>>).slice(0, 4);
  const nameA = isAr ? String(ea?.name_ar ?? "") : String(ea?.name_en || ea?.name_ar || "");
  const nameB = isAr ? String(eb?.name_ar ?? "") : String(eb?.name_en || eb?.name_ar || "");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, overflow: "hidden" }}>
      {/* Headers */}
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1, padding: "16px", borderRadius: 10, background: catColor + "15", textAlign: "center", fontSize: 22, fontWeight: 800, color: catColor }}>
          {ea?.emoji ? String(ea.emoji) : ""} {nameA}
        </div>
        <div style={{ padding: "16px", fontSize: 20, color: MUTED, display: "flex", alignItems: "center" }}>VS</div>
        <div style={{ flex: 1, padding: "16px", borderRadius: 10, background: "#F3F4F6", textAlign: "center", fontSize: 22, fontWeight: 800, color: NAVY }}>
          {eb?.emoji ? String(eb.emoji) : ""} {nameB}
        </div>
      </div>
      {/* Dimensions */}
      {dims.map((d, i) => (
        <div key={i} style={{
          padding: "12px 18px", borderRadius: 8,
          background: "#F8F9FA", border: "1.5px solid #E8EBF0",
          fontSize: 20, color: INK, textAlign: "center",
        }}>
          {isAr ? String(d.name_ar ?? d.topic_ar ?? "") : String(d.name_en || d.topic_en || d.name_ar || d.topic_ar || "")}
        </div>
      ))}
    </div>
  );
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────
function QuizContent({ post, isAr, catColor }: { post: PostWithRelations; isAr: boolean; catColor: string }) {
  const qc = post.quiz_config as Record<string, unknown> | null ?? {};
  const questions = (qc.questions as Array<Record<string, unknown>> | undefined) ?? [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, overflow: "hidden" }}>
      {questions.slice(0, 3).map((q, i) => {
        const text = isAr
          ? String(q.question_ar ?? q.statement_ar ?? q.instruction_ar ?? "")
          : String(q.question_en || q.statement_en || q.instruction_en || q.question_ar || q.statement_ar || q.instruction_ar || "");
        return (
          <div key={i} style={{
            padding: "16px 20px", borderRadius: 10,
            background: catColor + "10", border: `1.5px solid ${catColor}33`,
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: catColor, marginBottom: 8 }}>
              {isAr ? `سؤال ${i + 1}` : `Question ${i + 1}`}
            </div>
            <div style={{ fontSize: 21, color: INK, lineHeight: 1.5 }}>{text}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Chart ───────────────────────────────────────────────────────────────────
function ChartContent({ data, isAr, post }: { data: ReturnType<typeof buildShareCardData>; isAr: boolean; post: PostWithRelations }) {
  const cc = post.chart_config as Record<string, unknown> | null ?? {};
  const chartType = String(cc.chart_type ?? cc.type ?? "");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, height: "100%", justifyContent: "center" }}>
      {data.lede && (
        <p style={{ margin: 0, fontSize: 26, lineHeight: 1.7, color: INK }}>
          {data.lede}
        </p>
      )}
      <div style={{
        padding: "24px", borderRadius: 14,
        background: "#F8F9FA", border: "1.5px solid #E8EBF0",
        textAlign: "center", fontSize: 22, color: MUTED,
      }}>
        📈 {isAr ? "المخطط البياني متاح في جمهرة" : "Chart available on Jamhara"}
        {chartType && <div style={{ fontSize: 16, marginTop: 8 }}>{chartType}</div>}
      </div>
    </div>
  );
}

// ─── Default ─────────────────────────────────────────────────────────────────
function DefaultContent({ lede, items, isAr }: { lede?: string; items?: string[]; isAr: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, overflow: "hidden" }}>
      {lede && (
        <p style={{ margin: 0, fontSize: 26, lineHeight: 1.7, color: INK }}>
          {lede}
        </p>
      )}
      {(items ?? []).map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ color: GREEN, fontWeight: 800, fontSize: 20, flexShrink: 0 }}>•</span>
          <span style={{ fontSize: 22, lineHeight: 1.6, color: INK }}>{item}</span>
        </div>
      ))}
    </div>
  );
}
