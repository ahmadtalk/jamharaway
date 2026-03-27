"use client";

import Link from "next/link";
import type { QuotesConfig, QuoteSentiment, PostWithRelations } from "@/lib/supabase/types";
import { postUrl } from "@/lib/utils";
import JCardShell from "@/components/shared/JCardShell";
import ShareButton from "@/components/shared/ShareButton";

interface Props {
  id: string;
  title: string;
  body?: string;
  config: QuotesConfig;
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
  post?: PostWithRelations;
}

const SENTIMENT_STYLE: Record<QuoteSentiment, { color: string; bg: string }> = {
  positive: { color: "#059669", bg: "#F0FDF4" },
  negative: { color: "#DC2626", bg: "#FEF2F2" },
  neutral:  { color: "#6B7280", bg: "#F9FAFB" },
  warning:  { color: "#D97706", bg: "#FFFBEB" },
};

const FEED_LIMIT = 4;

export default function QuotesCard({
  id, title, body, config,
  categoryName, categorySlug, categoryColor,
  likeCount, locale, timeAgoStr, isDetail = false,
  parentCat, subCat, tags, post,
}: Props) {
  const isAr = locale === "ar";

  const resolvedParentCat = parentCat ?? (categoryName && categorySlug
    ? { name_ar: categoryName, name_en: categoryName, slug: categorySlug, color: categoryColor }
    : undefined);

  const sourceUrl = config.sourceUrl || undefined;
  const href = postUrl(id, locale);

  const visibleQuotes = isDetail ? config.quotes : config.quotes.slice(0, FEED_LIMIT);
  const hasMore = !isDetail && config.quotes.length > FEED_LIMIT;

  return (
    <JCardShell
      postId={id}
      postType="quotes"
      typeLabel_ar="اقتباسات"
      typeLabel_en="Quotes"
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
      {/* زر المشاركة — يظهر فقط في صفحة التفاصيل */}
      {isDetail && post && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <ShareButton post={post} locale={locale} isAr={locale === "ar"} />
        </div>
      )}

      {/* Topic label */}
      {(isAr ? config.topic_ar : config.topic_en) && (
        <div style={{
          fontSize: ".68rem", fontWeight: 700, color: "#7C3AED",
          letterSpacing: ".04em", marginBottom: 6,
          textTransform: "uppercase",
        }}>
          {isAr ? config.topic_ar : config.topic_en}
        </div>
      )}

      {/* Body — top (feed only) */}
      {!isDetail && body && body.replace(/<[^>]*>/g, "").trim() && (
        <p style={{ fontSize: ".82rem", color: "#5A5F7A", lineHeight: 1.7, marginBottom: 10, marginTop: 0 }}>
          {body.replace(/<[^>]*>/g, "")}
        </p>
      )}

      {/* Quotes list */}
      <div className={hasMore ? "jcard-fade-wrap" : ""}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visibleQuotes.map((quote, idx) => {
            const sentiment = quote.sentiment ?? "neutral";
            const style = SENTIMENT_STYLE[sentiment] ?? SENTIMENT_STYLE.neutral;
            return (
              <div key={idx} style={{
                borderRadius: 8,
                background: style.bg,
                borderInlineStart: `3px solid ${style.color}`,
                padding: "12px 14px",
              }}>
                {/* Quote mark + text */}
                <p style={{
                  fontSize: ".82rem", color: "#1A1D2E",
                  lineHeight: 1.7, margin: "0 0 8px 0",
                  fontStyle: "italic",
                }}>
                  <span style={{ fontSize: "1.1rem", color: `${style.color}80`, marginInlineEnd: 3, fontStyle: "normal" }}>
                    "
                  </span>
                  {isAr ? quote.text_ar : quote.text_en}
                  <span style={{ fontSize: "1.1rem", color: `${style.color}80`, marginInlineStart: 3, fontStyle: "normal" }}>
                    "
                  </span>
                </p>
                {/* Author + role + date */}
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: ".74rem", color: style.color }}>
                    {isAr ? quote.author_ar : quote.author_en}
                  </span>
                  {(isAr ? quote.role_ar : quote.role_en) && (
                    <span style={{ fontSize: ".7rem", color: "#9BA0B8" }}>
                      · {isAr ? quote.role_ar : quote.role_en}
                    </span>
                  )}
                  {quote.date && (
                    <span style={{ fontSize: ".66rem", color: "#9BA0B8", marginInlineStart: "auto" }}>
                      {quote.date}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {hasMore && <div className="jcard-fade-overlay" />}
      </div>

      {hasMore && (
        <Link href={href} className="jcard-more">
          {isAr ? `اعرض الكل (${config.quotes.length}) ←` : `Show all (${config.quotes.length}) →`}
        </Link>
      )}

      {/* Body — detail bottom */}
      {isDetail && body && body.replace(/<[^>]*>/g, "").trim() && (
        <p style={{ fontSize: ".82rem", color: "#5A5F7A", lineHeight: 1.7, marginTop: 10, marginBottom: 0 }}>
          {body.replace(/<[^>]*>/g, "")}
        </p>
      )}
    </JCardShell>
  );
}
