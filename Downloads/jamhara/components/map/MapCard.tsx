"use client";

import Link from "next/link";
import type { MapConfig } from "@/lib/supabase/types";
import JCardShell from "@/components/shared/JCardShell";

interface Props {
  id: string;
  title: string;
  body?: string;
  config: MapConfig;
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

const ACCENT = "#059669";
const FEED_LIMIT = 8;

function parseNum(v?: string): number {
  if (!v) return 0;
  const n = parseFloat(v.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}

export default function MapCard({
  id, title, body, config,
  categoryName, categorySlug, categoryColor,
  likeCount, locale, timeAgoStr, isDetail = false,
  parentCat, subCat, tags,
}: Props) {
  const isAr = locale === "ar";
  const regions = config.regions ?? [];
  const regionsToShow = !isDetail ? regions.slice(0, FEED_LIMIT) : regions;
  const hasMore = !isDetail && regions.length > FEED_LIMIT;
  const postHref = `${locale === "en" ? "/en" : ""}/p/${id}`;
  const resolvedParentCat = parentCat ?? (categoryName && categorySlug
    ? { name_ar: categoryName, name_en: categoryName, slug: categorySlug, color: categoryColor }
    : undefined);

  // Calculate max value for bar widths
  const maxVal = Math.max(...regions.map(r => parseNum(r.value)), 1);

  return (
    <JCardShell
      postId={id}
      postType="map"
      typeLabel_ar="توزيع جغرافي"
      typeLabel_en="Geographic Data"
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

      {/* Topic + metric header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        marginBottom: 12,
        padding: "8px 12px",
        background: "rgba(5,150,105,0.06)",
        border: "1px solid rgba(5,150,105,0.15)",
        borderRadius: 10,
      }}>
        <span style={{ fontSize: "1.1rem" }}>🗺️</span>
        <div>
          <span style={{ fontSize: ".75rem", fontWeight: 700, color: "#1A1D2E" }}>
            {isAr ? config.topic_ar : config.topic_en}
          </span>
          {(isAr ? config.metric_ar : config.metric_en) && (
            <span style={{ fontSize: ".67rem", color: "#6B7280", marginInlineStart: 6 }}>
              — {isAr ? config.metric_ar : config.metric_en}
            </span>
          )}
        </div>
      </div>

      {/* Regions */}
      <div className={hasMore ? "jcard-fade-wrap" : ""}>
        {regionsToShow.map((region, i) => {
          const num = parseNum(region.value);
          const barPct = maxVal > 0 ? Math.max(4, Math.round((num / maxVal) * 100)) : 0;
          const isHighlighted = region.highlight;
          return (
            <div key={i} style={{
              padding: "7px 10px",
              marginBottom: i < regionsToShow.length - 1 ? 4 : 0,
              background: isHighlighted ? "rgba(5,150,105,0.06)" : "transparent",
              border: isHighlighted ? "1px solid rgba(5,150,105,0.2)" : "1px solid transparent",
              borderRadius: 8,
              borderInlineStart: isHighlighted ? `3px solid ${ACCENT}` : "3px solid transparent",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: num > 0 ? 5 : 0 }}>
                {region.flag && (
                  <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{region.flag}</span>
                )}
                <span style={{
                  fontFamily: "var(--font-cairo),sans-serif",
                  fontWeight: isHighlighted ? 700 : 600,
                  fontSize: ".78rem",
                  color: isHighlighted ? "#065F46" : "#374151",
                  flex: 1,
                }}>
                  {isAr ? region.name_ar : region.name_en}
                </span>
                {region.value && (
                  <span style={{
                    fontSize: ".78rem", fontWeight: 700,
                    color: isHighlighted ? ACCENT : "#374151",
                    flexShrink: 0,
                  }}>
                    {region.value}
                    {(isAr ? region.unit_ar : region.unit_en) && (
                      <span style={{ fontSize: ".62rem", fontWeight: 500, color: "#9CA3AF", marginInlineStart: 2 }}>
                        {isAr ? region.unit_ar : region.unit_en}
                      </span>
                    )}
                  </span>
                )}
              </div>
              {/* Bar */}
              {num > 0 && (
                <div style={{ height: 4, background: "#F3F4F6", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${barPct}%`,
                    background: isHighlighted ? ACCENT : "rgba(5,150,105,0.4)",
                    borderRadius: 2,
                    transition: "width .3s ease",
                  }} />
                </div>
              )}
              {(isAr ? region.note_ar : region.note_en) && (
                <p style={{ fontSize: ".67rem", color: "#9CA3AF", margin: "4px 0 0" }}>
                  {isAr ? region.note_ar : region.note_en}
                </p>
              )}
            </div>
          );
        })}
        {hasMore && <div className="jcard-fade-overlay" />}
      </div>
      {hasMore && (
        <Link href={postHref} className="jcard-more">
          {isAr ? `اعرض الكل (${regions.length}) ←` : `Show all (${regions.length}) →`}
        </Link>
      )}

      {/* Insight */}
      {(isAr ? config.insight_ar : config.insight_en) && (
        <div style={{
          marginTop: 12,
          padding: "9px 12px",
          background: "rgba(5,150,105,0.07)",
          border: "1px solid rgba(5,150,105,0.2)",
          borderRadius: 10,
          fontSize: ".75rem", color: "#065F46", lineHeight: 1.6,
          fontWeight: 500,
          display: "flex", gap: 7, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: ".9rem", flexShrink: 0 }}>💡</span>
          <span>{isAr ? config.insight_ar : config.insight_en}</span>
        </div>
      )}

      {isDetail && body && (
        <p style={{ fontSize: ".82rem", color: "#5A5F7A", lineHeight: 1.7, marginTop: 16, marginBottom: 0 }}>
          {body.replace(/<[^>]*>/g, "")}
        </p>
      )}
    </JCardShell>
  );
}
