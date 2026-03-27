"use client";

import Link from "next/link";
import type { FactCheckConfig, FactVerdict, PostWithRelations } from "@/lib/supabase/types";
import { postUrl } from "@/lib/utils";
import JCardShell from "@/components/shared/JCardShell";
import ShareButton from "@/components/shared/ShareButton";

interface Props {
  id: string;
  title: string;
  body?: string;
  config: FactCheckConfig;
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

const VERDICT_CONFIG: Record<FactVerdict, { color: string; bg: string; label_ar: string; label_en: string }> = {
  true:       { color: "#4CB36C", bg: "#F3FDF5", label_ar: "✓ صحيح",    label_en: "✓ True" },
  false:      { color: "#E05A2B", bg: "#FFF5F2", label_ar: "✗ خاطئ",    label_en: "✗ False" },
  misleading: { color: "#F59E0B", bg: "#FFFBEB", label_ar: "⚠ مضلل",    label_en: "⚠ Misleading" },
  partial:    { color: "#2196F3", bg: "#EFF8FF", label_ar: "◑ جزئي",    label_en: "◑ Partial" },
  unverified: { color: "#9BA0B8", bg: "#F4F5F8", label_ar: "？ غير مؤكد", label_en: "？ Unverified" },
};

const FEED_LIMIT = 3;

export default function FactCheckCard({
  id, title, body, config,
  categoryName, categorySlug, categoryColor = "#DC2626",
  likeCount, locale, timeAgoStr, isDetail = false,
  parentCat, subCat, tags, tags_en, post,
}: Props) {
  const isAr = locale === "ar";

  // Build parentCat from legacy props if not provided directly
  const resolvedParentCat = parentCat ?? (categoryName && categorySlug
    ? { name_ar: categoryName, name_en: categoryName, slug: categorySlug, color: categoryColor }
    : undefined);

  const sourceUrl = config.sourceUrl || undefined;
  const href = postUrl(id, locale);

  const visibleClaims = isDetail ? config.claims : config.claims.slice(0, FEED_LIMIT);
  const hasMore = !isDetail && config.claims.length > FEED_LIMIT;

  return (
    <JCardShell
      postId={id}
      postType="factcheck"
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

      {/* Claim cards */}
      <div className={hasMore ? "jcard-fade-wrap" : ""}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 4 }}>
        {visibleClaims.map((claim, idx) => {
          const verdict      = VERDICT_CONFIG[claim.verdict] ?? VERDICT_CONFIG.unverified;
          const claimText    = isAr ? claim.claim_ar : claim.claim_en;
          const explanation  = isAr ? claim.explanation_ar : claim.explanation_en;
          const verdictLabel = isAr ? verdict.label_ar : verdict.label_en;

          return (
            <div key={idx} style={{
              borderRadius: 8,
              border: `1px solid ${verdict.color}33`,
              background: verdict.bg,
              padding: "12px 14px",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                <p style={{
                  fontSize: ".82rem", fontWeight: 700, color: "#1A1D2E",
                  lineHeight: 1.5, margin: 0,
                  borderInlineEnd: `3px solid ${verdict.color}`,
                  paddingInlineEnd: 10, flex: 1,
                }}>
                  {claimText}
                </p>
                <span style={{
                  flexShrink: 0, display: "inline-block",
                  fontSize: ".68rem", fontWeight: 700, color: "#fff",
                  background: verdict.color, borderRadius: 20,
                  padding: "3px 9px", letterSpacing: ".02em",
                  whiteSpace: "nowrap", lineHeight: 1.4,
                }}>
                  {verdictLabel}
                </span>
              </div>

              <p style={{ fontSize: ".74rem", color: "#5A5F7A", lineHeight: 1.6, margin: 0 }}>
                {explanation}
              </p>

              {claim.sources && claim.sources.length > 0 && (
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: 6,
                  marginTop: 8, paddingTop: 6,
                  borderTop: `1px solid ${verdict.color}22`,
                }}>
                  <span style={{ fontSize: ".62rem", color: "#9BA0B8", alignSelf: "center" }}>
                    {isAr ? "المصادر:" : "Sources:"}
                  </span>
                  {claim.sources.map((src, si) => {
                    const isUrl = src.startsWith("http");
                    return isUrl ? (
                      <a key={si} href={src} target="_blank" rel="noopener noreferrer" style={{
                        fontSize: ".62rem", color: verdict.color,
                        textDecoration: "underline",
                        textDecorationColor: `${verdict.color}80`,
                        wordBreak: "break-all",
                      }}>
                        {src.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
                      </a>
                    ) : (
                      <span key={si} style={{ fontSize: ".62rem", color: "#7A7F99" }}>{src}</span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasMore && <div className="jcard-fade-overlay" />}
      </div>{/* end jcard-fade-wrap */}

      {/* "Show all" link when truncated */}
      {hasMore && (
        <Link href={href} className="jcard-more">
          {isAr ? `اعرض الكل (${config.claims.length}) ←` : `Show all (${config.claims.length}) →`}
        </Link>
      )}

      {/* Body — detail only */}
      {isDetail && body && body.replace(/<[^>]*>/g, "").trim() && (
        <p style={{ fontSize: ".82rem", color: "#5A5F7A", lineHeight: 1.7, marginTop: 10, marginBottom: 0 }}>
          {body.replace(/<[^>]*>/g, "")}
        </p>
      )}
    </JCardShell>
  );
}
