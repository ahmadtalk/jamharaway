"use client";

import type { ScenariosConfig, ScenarioTone, PostWithRelations } from "@/lib/supabase/types";
import JCardShell from "@/components/shared/JCardShell";
import ShareButton from "@/components/shared/ShareButton";

interface Props {
  id: string;
  title: string;
  body?: string;
  config: ScenariosConfig;
  categoryName?: string;
  categorySlug?: string;
  categoryColor?: string;
  likeCount: number;
  publishedAt: string;
  locale: "ar" | "en";
  timeAgoStr: string;
  isDetail?: boolean;
  // New unified props
  parentCat?: { name_ar: string; name_en: string; slug: string; color?: string };
  subCat?: { name_ar: string; name_en: string; slug: string };
  tags?: string[];
  tags_en?: string[];
  post?: PostWithRelations;
}

const TONE_CONFIG: Record<ScenarioTone, {
  borderColor: string;
  bg: string;
  emoji: string;
  label_ar: string;
  label_en: string;
  textColor: string;
}> = {
  optimistic: { borderColor: "#4CB36C", bg: "#F3FDF5", emoji: "🟢", label_ar: "متفائل",  label_en: "Optimistic",  textColor: "#2a7a45" },
  realistic:  { borderColor: "#2196F3", bg: "#F0F7FF", emoji: "🔵", label_ar: "واقعي",   label_en: "Realistic",   textColor: "#1565c0" },
  pessimistic:{ borderColor: "#E05A2B", bg: "#FFF5F2", emoji: "🔴", label_ar: "متشائم",  label_en: "Pessimistic", textColor: "#b03a18" },
};

export default function ScenariosCard({
  id, title, body, config,
  categoryName, categorySlug, categoryColor = "#0891B2",
  likeCount, locale, timeAgoStr, isDetail = false,
  parentCat, subCat, tags, tags_en, post,
}: Props) {
  const isAr = locale === "ar";

  // Build parentCat from legacy props if not provided directly
  const resolvedParentCat = parentCat ?? (categoryName && categorySlug
    ? { name_ar: categoryName, name_en: categoryName, slug: categorySlug, color: categoryColor }
    : undefined);

  const sourceUrl = config.sourceUrl || undefined;
  const question = isAr ? config.question_ar : config.question_en;
  const horizon  = isAr ? config.horizon_ar  : config.horizon_en;

  return (
    <JCardShell
      postId={id}
      postType="scenarios"
      title={title}
      locale={locale}
      timeAgoStr={timeAgoStr}
      isDetail={isDetail}
      parentCat={resolvedParentCat}
      subCat={subCat}
      sourceUrl={sourceUrl}
      likeCount={likeCount}
      tags={tags} tags_en={tags_en}
    >
      {/* زر المشاركة — يظهر فقط في صفحة التفاصيل */}
      {isDetail && post && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <ShareButton post={post} locale={locale} isAr={locale === "ar"} />
        </div>
      )}

      {/* Body — moved to top (feed only) */}
      {!isDetail && body && body.replace(/<[^>]*>/g, "").trim() && (
        <p style={{ fontSize: ".82rem", color: "#5A5F7A", lineHeight: 1.7, marginBottom: 12, marginTop: 0 }}>
          {body.replace(/<[^>]*>/g, "")}
        </p>
      )}

      {/* Question box */}
      <div style={{
        background: "#F4F5F8", borderRadius: 8,
        padding: "12px 14px", marginBottom: 14, textAlign: "center",
      }}>
        <p style={{ fontSize: ".8rem", color: "#5A5F7A", lineHeight: 1.65, fontStyle: "italic", margin: 0 }}>
          {question}
        </p>
        {horizon && (
          <span style={{
            display: "inline-block", marginTop: 8,
            fontSize: ".65rem", fontWeight: 700, color: "#0891B2",
            background: "#0891B214", borderRadius: 20, padding: "2px 10px", letterSpacing: ".03em",
          }}>
            🗓 {horizon}
          </span>
        )}
      </div>

      {/* Scenario cards — always full (only 3) */}
      <div style={{ marginBottom: 4 }}>
        {config.scenarios.map((scenario, idx) => {
          const tone          = TONE_CONFIG[scenario.tone] ?? TONE_CONFIG.realistic;
          const scenarioTitle = isAr ? scenario.title_ar : scenario.title_en;
          const conditions    = isAr ? scenario.conditions_ar : scenario.conditions_en;
          const outcome       = isAr ? scenario.outcome_ar : scenario.outcome_en;

          return (
            <div key={idx} style={{
              borderTop: `3px solid ${tone.borderColor}`,
              background: tone.bg, borderRadius: 8,
              padding: "12px 14px",
              marginBottom: idx < config.scenarios.length - 1 ? 10 : 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                  <span style={{ fontSize: ".85rem", lineHeight: 1, flexShrink: 0 }}>{tone.emoji}</span>
                  <span style={{ fontSize: ".85rem", fontWeight: 700, color: "#1A1D2E", lineHeight: 1.3 }}>
                    {scenarioTitle}
                  </span>
                </div>
                {scenario.probability && (
                  <span style={{
                    flexShrink: 0, fontSize: ".65rem", fontWeight: 700, color: tone.textColor,
                    background: `${tone.borderColor}18`, borderRadius: 20, padding: "2px 8px", letterSpacing: ".02em",
                  }}>
                    {scenario.probability}
                  </span>
                )}
              </div>

              {conditions.length > 0 && (
                <ul style={{ margin: "8px 0", padding: 0, listStyle: "none" }}>
                  {conditions.map((cond, ci) => (
                    <li key={ci} style={{
                      display: "flex", alignItems: "flex-start", gap: 5,
                      fontSize: ".72rem", color: "#5A5F7A", lineHeight: 1.55,
                      marginBottom: ci < conditions.length - 1 ? 4 : 0,
                    }}>
                      <span style={{ flexShrink: 0, color: tone.borderColor, marginTop: 1 }}>•</span>
                      <span>{cond}</span>
                    </li>
                  ))}
                </ul>
              )}

              <p style={{
                fontSize: ".78rem", fontStyle: "italic", color: tone.textColor,
                borderInlineEnd: `3px solid ${tone.borderColor}`,
                paddingInlineEnd: 10, margin: "8px 0 0", lineHeight: 1.6,
              }}>
                {outcome}
              </p>
            </div>
          );
        })}
      </div>

      {/* Body — detail only */}
      {isDetail && body && body.replace(/<[^>]*>/g, "").trim() && (
        <p style={{ fontSize: ".82rem", color: "#5A5F7A", lineHeight: 1.7, marginTop: 10, marginBottom: 0 }}>
          {body.replace(/<[^>]*>/g, "")}
        </p>
      )}
    </JCardShell>
  );
}
