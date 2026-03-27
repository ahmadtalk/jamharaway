"use client";

import Link from "next/link";
import type { BriefingConfig } from "@/lib/supabase/types";
import { postUrl } from "@/lib/utils";
import JCardShell from "@/components/shared/JCardShell";

interface Props {
  id: string;
  title: string;
  body?: string;
  config: BriefingConfig;
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

const FEED_LIMIT = 5;
const ACCENT = "#1D4ED8";

export default function BriefingCard({
  id, title, body, config,
  categoryName, categorySlug, categoryColor,
  likeCount, locale, timeAgoStr, isDetail = false,
  parentCat, subCat, tags,
}: Props) {
  const isAr = locale === "ar";

  const resolvedParentCat = parentCat ?? (categoryName && categorySlug
    ? { name_ar: categoryName, name_en: categoryName, slug: categorySlug, color: categoryColor }
    : undefined);

  const sourceUrl = config.sourceUrl || undefined;
  const href = postUrl(id, locale);

  const visiblePoints = isDetail ? config.key_points : config.key_points.slice(0, FEED_LIMIT);
  const hasMore = !isDetail && config.key_points.length > FEED_LIMIT;

  return (
    <JCardShell
      postId={id}
      postType="briefing"
      typeLabel_ar="موجز"
      typeLabel_en="Briefing"
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
      {/* Body — top (feed only) */}
      {!isDetail && body && body.replace(/<[^>]*>/g, "").trim() && (
        <p style={{ fontSize: ".82rem", color: "#5A5F7A", lineHeight: 1.7, marginBottom: 12, marginTop: 0 }}>
          {body.replace(/<[^>]*>/g, "")}
        </p>
      )}

      {/* Key Points */}
      <div className={hasMore ? "jcard-fade-wrap" : ""}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {visiblePoints.map((point, idx) => (
            <div key={idx} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "8px 12px",
              background: `${ACCENT}08`,
              borderRadius: 8,
              borderInlineStart: `3px solid ${ACCENT}`,
            }}>
              {point.icon && (
                <span style={{ fontSize: "1rem", lineHeight: 1, flexShrink: 0, marginTop: 1 }}>
                  {point.icon}
                </span>
              )}
              {!point.icon && (
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: ACCENT, flexShrink: 0, marginTop: 5,
                }} />
              )}
              <p style={{ fontSize: ".8rem", color: "#1A1D2E", lineHeight: 1.6, margin: 0 }}>
                {isAr ? point.text_ar : point.text_en}
              </p>
            </div>
          ))}
        </div>
        {hasMore && <div className="jcard-fade-overlay" />}
      </div>

      {hasMore && (
        <Link href={href} className="jcard-more">
          {isAr ? `اعرض الكل (${config.key_points.length}) ←` : `Show all (${config.key_points.length}) →`}
        </Link>
      )}

      {/* Detail-only extras */}
      {isDetail && (
        <>
          {/* Key Numbers grid */}
          {config.key_numbers && config.key_numbers.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(config.key_numbers.length, 3)}, 1fr)`,
              gap: 10, marginTop: 14,
            }}>
              {config.key_numbers.map((num, idx) => (
                <div key={idx} style={{
                  background: `${ACCENT}0C`, borderRadius: 10,
                  padding: "12px 10px", textAlign: "center",
                  border: `1px solid ${ACCENT}22`,
                }}>
                  {num.icon && (
                    <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>{num.icon}</div>
                  )}
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: ACCENT, lineHeight: 1 }}>
                    {num.value}
                  </div>
                  <div style={{ fontSize: ".7rem", color: "#5A5F7A", marginTop: 4, lineHeight: 1.4 }}>
                    {isAr ? num.label_ar : num.label_en}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Featured quote */}
          {config.featured_quote && (
            <div style={{
              marginTop: 14, padding: "14px 16px",
              background: "#F8FAFF", borderRadius: 10,
              border: `1px solid ${ACCENT}22`,
              position: "relative",
            }}>
              <span style={{
                position: "absolute", top: 6, insetInlineStart: 10,
                fontSize: "2.2rem", color: `${ACCENT}30`, lineHeight: 1,
                fontFamily: "Georgia, serif",
              }}>
                "
              </span>
              <p style={{
                fontSize: ".84rem", color: "#1A1D2E", lineHeight: 1.7,
                margin: "0 0 10px 0", paddingTop: 8, fontStyle: "italic",
              }}>
                {isAr ? config.featured_quote.text_ar : config.featured_quote.text_en}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: ".78rem", color: ACCENT }}>
                  {isAr ? config.featured_quote.author_ar : config.featured_quote.author_en}
                </span>
                {(isAr ? config.featured_quote.role_ar : config.featured_quote.role_en) && (
                  <span style={{ fontSize: ".72rem", color: "#9BA0B8" }}>
                    — {isAr ? config.featured_quote.role_ar : config.featured_quote.role_en}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Bottom line */}
          {(isAr ? config.bottom_line_ar : config.bottom_line_en) && (
            <div style={{
              marginTop: 14, padding: "10px 14px",
              background: `${ACCENT}06`,
              borderInlineStart: `4px solid ${ACCENT}`,
              borderRadius: "0 8px 8px 0",
            }}>
              <span style={{ fontSize: ".68rem", fontWeight: 700, color: ACCENT, display: "block", marginBottom: 4, letterSpacing: ".03em" }}>
                {isAr ? "خلاصة القول" : "Bottom Line"}
              </span>
              <p style={{ fontSize: ".82rem", color: "#1A1D2E", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
                {isAr ? config.bottom_line_ar : config.bottom_line_en}
              </p>
            </div>
          )}

          {/* Body — detail bottom */}
          {body && body.replace(/<[^>]*>/g, "").trim() && (
            <p style={{ fontSize: ".82rem", color: "#5A5F7A", lineHeight: 1.7, marginTop: 12, marginBottom: 0 }}>
              {body.replace(/<[^>]*>/g, "")}
            </p>
          )}
        </>
      )}
    </JCardShell>
  );
}
