"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { RankingConfig } from "@/lib/supabase/types";
import { postUrl } from "@/lib/utils";
import JCardShell from "@/components/shared/JCardShell";

interface Props {
  id: string;
  title: string;
  body?: string;
  config: RankingConfig;
  categoryName?: string;
  categorySlug?: string;
  categoryColor?: string;
  likeCount: number;
  locale: "ar" | "en";
  timeAgoStr: string;
  isDetail: boolean;
  // New unified props
  parentCat?: { name_ar: string; name_en: string; slug: string; color?: string };
  subCat?: { name_ar: string; name_en: string; slug: string };
  tags?: string[];
}

const GOLD   = "#F59E0B";
const SILVER = "#9BA0B8";
const BRONZE = "#CD7F32";

function rankColor(rank: number): string {
  if (rank === 1) return GOLD;
  if (rank === 2) return SILVER;
  if (rank === 3) return BRONZE;
  return SILVER;
}

const FEED_LIMIT = 6;

export default function RankingCard({
  id, title, body, config,
  categoryName, categorySlug, categoryColor,
  likeCount, locale, timeAgoStr, isDetail,
  parentCat, subCat, tags,
}: Props) {
  const isAr = locale === "ar";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Build parentCat from legacy props if not provided directly
  const resolvedParentCat = parentCat ?? (categoryName && categorySlug
    ? { name_ar: categoryName, name_en: categoryName, slug: categorySlug, color: categoryColor }
    : undefined);

  const sourceUrl = config.sourceUrl || undefined;
  const href = postUrl(id, locale);

  const visibleItems = isDetail ? config.items : config.items.slice(0, FEED_LIMIT);
  const hasMore = !isDetail && config.items.length > FEED_LIMIT;
  const metricLabel = isAr ? config.metric_ar : config.metric_en;

  return (
    <JCardShell
      postId={id}
      postType="ranking"
      title={title}
      locale={locale}
      timeAgoStr={timeAgoStr}
      isDetail={isDetail}
      parentCat={resolvedParentCat}
      subCat={subCat}
      sourceUrl={sourceUrl}
      likeCount={likeCount}
      tags={tags}
    >
      {/* Body — moved to top (feed only) */}
      {!isDetail && body && body.replace(/<[^>]*>/g, "").trim() && (
        <p style={{ fontSize: ".82rem", color: "#5A5F7A", lineHeight: 1.7, marginBottom: 10, marginTop: 0 }}>
          {body.replace(/<[^>]*>/g, "")}
        </p>
      )}

      {/* Metric sub-label */}
      <div style={{ fontSize: ".7rem", fontWeight: 600, color: "#9BA0B8", marginBottom: 10, letterSpacing: ".02em" }}>
        {metricLabel}
      </div>

      {/* Items list */}
      <div className={hasMore ? "jcard-fade-wrap" : ""}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {visibleItems.map((item, idx) => {
          const isTop3 = item.rank <= 3;
          const rColor = rankColor(item.rank);
          const name   = isAr ? item.name_ar : item.name_en;
          const unit   = isAr ? (item.unit_ar ?? "") : (item.unit_en ?? "");
          const note   = isAr ? item.note_ar : item.note_en;
          const delay  = idx * 45;

          return (
            <div
              key={item.rank}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: isTop3 ? "9px 10px 9px 12px" : "6px 10px 6px 12px",
                borderRadius: 8,
                background: isTop3 ? `${rColor}08` : "transparent",
                borderLeft: isTop3 ? `3px solid ${rColor}` : "3px solid transparent",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateX(0)" : (isAr ? "translateX(10px)" : "translateX(-10px)"),
                transition: `opacity 320ms ease ${delay}ms, transform 320ms ease ${delay}ms`,
              }}
            >
              <span style={{ fontSize: ".85rem", fontWeight: 900, color: rColor, minWidth: 24, textAlign: "center", flexShrink: 0 }}>
                {item.rank}
              </span>

              {item.emoji && (
                <span style={{ fontSize: isTop3 ? "1.1rem" : ".95rem", lineHeight: 1, flexShrink: 0 }}>
                  {item.emoji}
                </span>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  fontFamily: "var(--font-cairo),sans-serif", fontWeight: 700,
                  fontSize: isTop3 ? ".9rem" : ".84rem", color: "#1A1D2E",
                  display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {name}
                </span>
                {note && (
                  <span style={{ fontSize: ".65rem", color: "#9BA0B8", display: "block", marginTop: 1 }}>
                    {note}
                  </span>
                )}
              </div>

              {item.change && (
                <span style={{
                  fontSize: ".72rem", fontWeight: 700,
                  color: item.change === "up" ? "#4CB36C" : item.change === "down" ? "#E05A2B" : "#9BA0B8",
                  flexShrink: 0,
                }}>
                  {item.change === "up" ? "↑" : item.change === "down" ? "↓" : "—"}
                  {item.change !== "same" && item.change_amount != null && (
                    <span style={{ fontSize: ".62rem", marginRight: 1 }}>{item.change_amount}</span>
                  )}
                </span>
              )}

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <span style={{
                  fontSize: isTop3 ? ".88rem" : ".8rem", fontWeight: 800,
                  color: isTop3 ? rColor : "#5A5F7A", fontVariantNumeric: "lining-nums",
                }}>
                  {item.value}
                </span>
                {unit && (
                  <span style={{ fontSize: ".62rem", color: "#9BA0B8", marginRight: 2 }}>{unit}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && <div className="jcard-fade-overlay" />}
      </div>{/* end jcard-fade-wrap */}

      {/* "Show all" link when truncated */}
      {hasMore && (
        <Link href={href} className="jcard-more">
          {isAr ? `اعرض الكل (${config.items.length}) ←` : `Show all (${config.items.length}) →`}
        </Link>
      )}

      {/* Body — detail only */}
      {isDetail && body && body.replace(/<[^>]*>/g, "").trim() && (
        <p style={{ fontSize: ".82rem", color: "#5A5F7A", lineHeight: 1.75, marginTop: 10, marginBottom: 0 }}>
          {body.replace(/<[^>]*>/g, "")}
        </p>
      )}
    </JCardShell>
  );
}
