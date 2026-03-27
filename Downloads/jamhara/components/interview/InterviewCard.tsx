"use client";

import Link from "next/link";
import type { InterviewConfig, PostWithRelations } from "@/lib/supabase/types";
import JCardShell from "@/components/shared/JCardShell";
import ShareButton from "@/components/shared/ShareButton";

interface Props {
  id: string;
  title: string;
  body?: string;
  config: InterviewConfig;
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
  tags_en?: string[];
  post?: PostWithRelations;
}

const ACCENT = "#1D4ED8";
const FEED_LIMIT = 3;

export default function InterviewCard({
  id, title, body, config,
  categoryName, categorySlug, categoryColor,
  likeCount, locale, timeAgoStr, isDetail = false,
  parentCat, subCat, tags, tags_en, post,
}: Props) {
  const isAr = locale === "ar";
  const qa = config.qa ?? [];
  const qaToShow = !isDetail ? qa.slice(0, FEED_LIMIT) : qa;
  const hasMore = !isDetail && qa.length > FEED_LIMIT;
  const postHref = `${locale === "en" ? "/en" : ""}/p/${id}`;
  const resolvedParentCat = parentCat ?? (categoryName && categorySlug
    ? { name_ar: categoryName, name_en: categoryName, slug: categorySlug, color: categoryColor }
    : undefined);
  const initial = (isAr ? config.interviewee_ar : config.interviewee_en)?.[0]?.toUpperCase() ?? "؟";

  return (
    <JCardShell
      postId={id}
      postType="interview"
      typeLabel_ar="مقابلة"
      typeLabel_en="Interview"
      title={title}
      locale={locale}
      timeAgoStr={timeAgoStr}
      isDetail={isDetail}
      parentCat={resolvedParentCat}
      subCat={subCat}
      sourceUrl={config.sourceUrl}
      likeCount={likeCount}
      tags={tags} tags_en={tags_en}
    >
      {/* زر المشاركة — يظهر فقط في صفحة التفاصيل */}
      {isDetail && post && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <ShareButton post={post} locale={locale} isAr={locale === "ar"} />
        </div>
      )}

      {/* Body */}
      {!isDetail && body && (
        <p style={{ fontSize: ".82rem", color: "#5A5F7A", lineHeight: 1.7, marginBottom: 12, marginTop: 0 }}>
          {body.replace(/<[^>]*>/g, "")}
        </p>
      )}

      {/* Interviewee header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px",
        background: "#F8FAFF",
        border: "1px solid #DBEAFE",
        borderRadius: 12,
        marginBottom: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: ACCENT, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-cairo),sans-serif",
          fontWeight: 800, fontSize: "1rem", flexShrink: 0,
        }}>
          {initial}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: "var(--font-cairo),sans-serif",
            fontWeight: 800, fontSize: ".88rem",
            color: "#1A1D2E", margin: "0 0 2px",
          }}>
            {isAr ? config.interviewee_ar : config.interviewee_en}
          </p>
          {(isAr ? config.role_ar : config.role_en) && (
            <p style={{ fontSize: ".7rem", color: "#6B7280", margin: 0 }}>
              {isAr ? config.role_ar : config.role_en}
            </p>
          )}
        </div>
        {config.date && (
          <span style={{
            fontSize: ".62rem", color: "#9CA3AF",
            background: "#F3F4F6", borderRadius: 20,
            padding: "2px 8px", flexShrink: 0,
          }}>
            {config.date}
          </span>
        )}
      </div>

      {/* Context */}
      {(isAr ? config.context_ar : config.context_en) && (
        <div style={{
          padding: "8px 12px",
          borderInlineStart: `3px solid ${ACCENT}`,
          background: "rgba(29,78,216,0.04)",
          borderRadius: "0 8px 8px 0",
          marginBottom: 14,
          fontSize: ".75rem", color: "#374151", lineHeight: 1.6,
          fontStyle: "italic",
        }}>
          {isAr ? config.context_ar : config.context_en}
        </div>
      )}

      {/* Q&A */}
      <div className={hasMore ? "jcard-fade-wrap" : ""}>
        {qaToShow.map((item, i) => (
          <div key={i} style={{ marginBottom: i < qaToShow.length - 1 ? 12 : 0 }}>
            {/* Question */}
            <div style={{
              display: "flex", gap: 8, alignItems: "flex-start",
              padding: "8px 10px",
              background: "#EFF6FF",
              borderRadius: "8px 8px 0 0",
            }}>
              <span style={{
                flexShrink: 0,
                width: 20, height: 20, borderRadius: "50%",
                background: ACCENT, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: ".65rem", fontWeight: 800,
              }}>
                س
              </span>
              <p style={{
                fontSize: ".78rem", fontWeight: 600, color: "#1E40AF",
                margin: 0, lineHeight: 1.6,
              }}>
                {isAr ? item.question_ar : item.question_en}
              </p>
            </div>
            {/* Answer */}
            <div style={{
              padding: "8px 10px",
              background: "#fff",
              border: "1px solid #DBEAFE",
              borderTop: "none",
              borderRadius: "0 0 8px 8px",
            }}>
              <p style={{ fontSize: ".78rem", color: "#374151", margin: 0, lineHeight: 1.7 }}>
                {isAr ? item.answer_ar : item.answer_en}
              </p>
            </div>
          </div>
        ))}
        {hasMore && <div className="jcard-fade-overlay" />}
      </div>
      {hasMore && (
        <Link href={postHref} className="jcard-more">
          {isAr ? `اعرض الكل (${qa.length}) ←` : `Show all (${qa.length}) →`}
        </Link>
      )}

      {isDetail && body && (
        <p style={{ fontSize: ".82rem", color: "#5A5F7A", lineHeight: 1.7, marginTop: 16, marginBottom: 0 }}>
          {body.replace(/<[^>]*>/g, "")}
        </p>
      )}
    </JCardShell>
  );
}
