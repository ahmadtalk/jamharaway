"use client";

import Link from "next/link";
import type { ExplainerConfig, PostWithRelations } from "@/lib/supabase/types";
import { postUrl } from "@/lib/utils";
import JCardShell from "@/components/shared/JCardShell";
import ShareButton from "@/components/shared/ShareButton";

interface Props {
  id: string;
  title: string;
  body?: string;
  config: ExplainerConfig;
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

const ACCENT = "#B45309";
const FEED_LIMIT = 4;

export default function ExplainerCard({
  id, title, body, config,
  categoryName, categorySlug, categoryColor,
  likeCount, locale, timeAgoStr, isDetail = false,
  parentCat, subCat, tags, tags_en, post,
}: Props) {
  const isAr = locale === "ar";

  const resolvedParentCat = parentCat ?? (categoryName && categorySlug
    ? { name_ar: categoryName, name_en: categoryName, slug: categorySlug, color: categoryColor }
    : undefined);

  const sourceUrl = config.sourceUrl || undefined;
  const href = postUrl(id, locale);

  const visibleQuestions = isDetail ? config.questions : config.questions.slice(0, FEED_LIMIT);
  const hasMore = !isDetail && config.questions.length > FEED_LIMIT;

  return (
    <JCardShell
      postId={id}
      postType="explainer"
      typeLabel_ar="أسئلة شارحة"
      typeLabel_en="Explainer"
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

      {/* Intro — feed only */}
      {!isDetail && (config.intro_ar || config.intro_en) && (
        <p style={{ fontSize: ".82rem", color: "#5A5F7A", lineHeight: 1.7, marginBottom: 10, marginTop: 0 }}>
          {isAr ? config.intro_ar : config.intro_en}
        </p>
      )}

      {/* Body — feed only */}
      {!isDetail && body && body.replace(/<[^>]*>/g, "").trim() && (
        <p style={{ fontSize: ".82rem", color: "#5A5F7A", lineHeight: 1.7, marginBottom: 10, marginTop: 0 }}>
          {body.replace(/<[^>]*>/g, "")}
        </p>
      )}

      {/* Q&A list */}
      <div className={hasMore ? "jcard-fade-wrap" : ""}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visibleQuestions.map((q, idx) => (
            <div key={idx} style={{
              borderRadius: 8,
              border: `1px solid ${ACCENT}22`,
              background: `${ACCENT}06`,
              overflow: "hidden",
            }}>
              {/* Question row */}
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "10px 12px",
                background: `${ACCENT}10`,
                borderBottom: `1px solid ${ACCENT}18`,
              }}>
                {q.icon ? (
                  <span style={{ fontSize: "1rem", lineHeight: 1, flexShrink: 0, marginTop: 1 }}>
                    {q.icon}
                  </span>
                ) : (
                  <span style={{
                    minWidth: 20, height: 20, borderRadius: "50%",
                    background: ACCENT, color: "#fff",
                    fontSize: ".65rem", fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {idx + 1}
                  </span>
                )}
                <p style={{
                  fontSize: ".82rem", fontWeight: 700, color: "#1A1D2E",
                  lineHeight: 1.5, margin: 0,
                }}>
                  {isAr ? q.question_ar : q.question_en}
                </p>
              </div>
              {/* Answer row */}
              <div style={{ padding: "10px 12px" }}>
                <p style={{ fontSize: ".78rem", color: "#5A5F7A", lineHeight: 1.7, margin: 0 }}>
                  {isAr ? q.answer_ar : q.answer_en}
                </p>
              </div>
            </div>
          ))}
        </div>
        {hasMore && <div className="jcard-fade-overlay" />}
      </div>

      {hasMore && (
        <Link href={href} className="jcard-more">
          {isAr ? `اعرض الكل (${config.questions.length}) ←` : `Show all (${config.questions.length}) →`}
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
