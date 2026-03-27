"use client";

import Link from "next/link";
import type { GuideConfig } from "@/lib/supabase/types";
import JCardShell from "@/components/shared/JCardShell";

interface Props {
  id: string;
  title: string;
  body?: string;
  config: GuideConfig;
  categoryName?: string;
  categorySlug?: string;
  categoryColor?: string;
  likeCount: number;
  publishedAt?: string;
  locale: "ar" | "en";
  timeAgoStr: string;
  isDetail?: boolean;
  parentCat?: { name_ar: string; name_en: string; slug: string; color?: string };
  subCat?: { name_ar: string; name_en: string; slug: string };
  tags?: string[];
}

const ACCENT = "#0891B2";
const DIFF_COLOR: Record<string, string> = {
  easy: "#4CB36C",
  medium: "#F59E0B",
  hard: "#E05A2B",
};
const DIFF_LABEL: Record<string, { ar: string; en: string }> = {
  easy:   { ar: "سهل",   en: "Easy"   },
  medium: { ar: "متوسط", en: "Medium" },
  hard:   { ar: "متقدم", en: "Advanced" },
};

const FEED_LIMIT = 4;

export default function GuideCard({
  id, title, body, config,
  categoryName, categorySlug, categoryColor,
  likeCount, locale, timeAgoStr, isDetail = false,
  parentCat, subCat, tags,
}: Props) {
  const isAr = locale === "ar";
  const steps = config.steps ?? [];
  const stepsToShow = !isDetail ? steps.slice(0, FEED_LIMIT) : steps;
  const hasMore = !isDetail && steps.length > FEED_LIMIT;
  const postHref = `${locale === "en" ? "/en" : ""}/p/${id}`;
  const diffColor = config.difficulty ? (DIFF_COLOR[config.difficulty] ?? ACCENT) : ACCENT;
  const diffLabel = config.difficulty ? (DIFF_LABEL[config.difficulty]?.[isAr ? "ar" : "en"] ?? "") : "";
  const resolvedParentCat = parentCat ?? (categoryName && categorySlug
    ? { name_ar: categoryName, name_en: categoryName, slug: categorySlug, color: categoryColor }
    : undefined);

  return (
    <JCardShell
      postId={id}
      postType="guide"
      typeLabel_ar="خطوات عملية"
      typeLabel_en="How-to Guide"
      title={title}
      locale={locale}
      timeAgoStr={timeAgoStr}
      isDetail={isDetail}
      parentCat={resolvedParentCat}
      subCat={subCat}
      sourceUrl={config.sourceUrl}
      likeCount={likeCount}
      tags={tags}
    >
      {/* Body */}
      {!isDetail && body && (
        <p style={{ fontSize: ".82rem", color: "#5A5F7A", lineHeight: 1.7, marginBottom: 12, marginTop: 0 }}>
          {body.replace(/<[^>]*>/g, "")}
        </p>
      )}

      {/* Goal + Meta */}
      <div style={{
        display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8,
        marginBottom: 14,
        padding: "10px 12px",
        background: `rgba(8,145,178,0.06)`,
        border: `1px solid rgba(8,145,178,0.15)`,
        borderRadius: 10,
      }}>
        <span style={{ fontSize: "1.1rem" }}>🎯</span>
        <span style={{ fontSize: ".78rem", color: "#1A1D2E", fontWeight: 600, flex: 1 }}>
          {isAr ? config.goal_ar : config.goal_en}
        </span>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {config.difficulty && (
            <span style={{
              fontSize: ".62rem", fontWeight: 700,
              color: diffColor,
              background: `rgba(${diffColor === "#4CB36C" ? "76,179,108" : diffColor === "#F59E0B" ? "245,158,11" : "224,90,43"},0.1)`,
              borderRadius: 20, padding: "2px 8px",
            }}>{diffLabel}</span>
          )}
          {(isAr ? config.total_duration_ar : config.total_duration_en) && (
            <span style={{
              fontSize: ".62rem", fontWeight: 600,
              color: "#6B7280", background: "#F3F4F6",
              borderRadius: 20, padding: "2px 8px",
            }}>
              ⏱ {isAr ? config.total_duration_ar : config.total_duration_en}
            </span>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className={hasMore ? "jcard-fade-wrap" : ""} style={{ position: "relative" }}>
        {stepsToShow.map((step, i) => (
          <div key={i} style={{
            display: "flex", gap: 12, alignItems: "flex-start",
            marginBottom: i < stepsToShow.length - 1 ? 14 : 0,
            position: "relative",
          }}>
            {/* Step number */}
            <div style={{
              flexShrink: 0,
              width: 30, height: 30,
              borderRadius: "50%",
              background: ACCENT,
              color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: ".72rem", fontWeight: 800,
              zIndex: 1,
            }}>
              {step.step}
            </div>
            {/* Connector line */}
            {i < stepsToShow.length - 1 && (
              <div style={{
                position: "absolute",
                top: 30, bottom: -14,
                insetInlineStart: 14,
                width: 2,
                background: "rgba(8,145,178,0.15)",
              }} />
            )}
            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                {step.icon && <span style={{ fontSize: "1rem" }}>{step.icon}</span>}
                <span style={{
                  fontFamily: "var(--font-cairo),sans-serif",
                  fontWeight: 700, fontSize: ".82rem", color: "#1A1D2E",
                }}>
                  {isAr ? step.title_ar : step.title_en}
                </span>
                {(isAr ? step.duration_ar : step.duration_en) && (
                  <span style={{
                    fontSize: ".6rem", color: "#9CA3AF",
                    background: "#F3F4F6", borderRadius: 20, padding: "1px 7px",
                    marginInlineStart: "auto", flexShrink: 0,
                  }}>
                    {isAr ? step.duration_ar : step.duration_en}
                  </span>
                )}
              </div>
              <p style={{ fontSize: ".75rem", color: "#5A5F7A", lineHeight: 1.65, margin: 0 }}>
                {isAr ? step.description_ar : step.description_en}
              </p>
              {(isAr ? step.warning_ar : step.warning_en) && (
                <div style={{
                  marginTop: 6,
                  padding: "5px 9px",
                  background: "rgba(224,90,43,0.07)",
                  border: "1px solid rgba(224,90,43,0.2)",
                  borderRadius: 7,
                  fontSize: ".7rem", color: "#C45A1E",
                  display: "flex", gap: 5, alignItems: "flex-start",
                }}>
                  <span>⚠️</span>
                  <span>{isAr ? step.warning_ar : step.warning_en}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {hasMore && <div className="jcard-fade-overlay" />}
      </div>
      {hasMore && (
        <Link href={postHref} className="jcard-more">
          {isAr ? `اعرض الكل (${steps.length}) ←` : `Show all (${steps.length}) →`}
        </Link>
      )}

      {/* Detail: full body at bottom */}
      {isDetail && body && (
        <p style={{ fontSize: ".82rem", color: "#5A5F7A", lineHeight: 1.7, marginTop: 16, marginBottom: 0 }}>
          {body.replace(/<[^>]*>/g, "")}
        </p>
      )}
    </JCardShell>
  );
}
