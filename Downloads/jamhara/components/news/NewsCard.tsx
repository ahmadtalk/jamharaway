"use client";

import { useState } from "react";
import Link from "next/link";
import JCardShell from "@/components/shared/JCardShell";
import ShareButton from "@/components/shared/ShareButton";
import type { PostWithRelations, NewsConfig } from "@/lib/supabase/types";

interface Props {
  post: PostWithRelations;
  locale: "ar" | "en";
  timeAgoStr: string;
  isDetail?: boolean;
  index?: number;
  tags?: string[];
  tags_en?: string[];
}

export default function NewsCard({ post, locale, timeAgoStr, isDetail = false, index = 0, tags, tags_en }: Props) {
  const isAr = locale === "ar";
  const title = isAr ? post.title_ar : (post.title_en || post.title_ar);
  const lede  = isAr ? post.body_ar  : (post.body_en  || post.body_ar);
  const cfg   = (post.content_config as NewsConfig | null) ?? {};

  const [imgErr, setImgErr] = useState(false);
  const hasImage = !!post.image_url && !imgErr;

  const sourceName = cfg.source_name ?? "";
  const sourceHref = cfg.gnews_url ?? cfg.source_url ?? "#";
  const sources: { name: string; url: string }[] = sourceName
    ? [{ name: sourceName, url: sourceHref }]
    : [];

  const parentCat = post.category
    ? { name_ar: post.category.name_ar, name_en: post.category.name_en, slug: post.category.slug, color: post.category.color }
    : undefined;

  // اختيار المحتوى حسب اللغة
  const keyPoints  = isAr ? (cfg.key_points_ar ?? []) : (cfg.key_points_en ?? cfg.key_points_ar ?? []);
  const whyMatters = isAr ? cfg.why_it_matters_ar : (cfg.why_it_matters_en ?? cfg.why_it_matters_ar);
  const whatsNext  = isAr ? cfg.whats_next_ar : (cfg.whats_next_en ?? cfg.whats_next_ar);
  const quote      = cfg.quote ?? null;

  const FEED_LIMIT = 3;
  const hasMore = !isDetail && keyPoints.length > FEED_LIMIT;
  const postHref = `/${locale === "en" ? "en/" : ""}p/${post.id}`;

  // في feed: نعرض الـ lede فقط. في صفحة التفاصيل: نعرض الهيكل الكامل
  return (
    <JCardShell
      postId={post.id}
      postType="news"
      title={title}
      locale={locale}
      timeAgoStr={timeAgoStr}
      isDetail={isDetail}
      index={index}
      parentCat={parentCat}
      sources={sources}
      likeCount={post.like_count}
      tags={tags ?? post.tags ?? []} tags_en={tags_en ?? post.tags_en ?? []}
    >
      {/* ── صورة الخبر ── */}
      {hasImage && (
        <Link
          href={`/${locale === "en" ? "en/" : ""}p/${post.id}`}
          style={{ display: "block", marginBottom: 12, borderRadius: 10, overflow: "hidden" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image_url!}
            alt={title}
            onError={() => setImgErr(true)}
            style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
          />
        </Link>
      )}

      {/* ── شارة المصدر + زر المشاركة ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            fontSize: ".67rem", fontWeight: 700, letterSpacing: ".04em",
            background: "#E05A2B15", color: "#E05A2B",
            padding: "2px 9px", borderRadius: 20,
            border: "1px solid #E05A2B30",
          }}>
            {isAr ? "📰 خبر" : "📰 News"}
          </span>
          {sourceName && (
            <span style={{ fontSize: ".72rem", color: "var(--muted)", fontWeight: 500 }}>
              {sourceName}
            </span>
          )}
        </div>
        {/* زر مشاركة كصورة — يظهر فقط في صفحة التفاصيل */}
        {isDetail && <ShareButton post={post} locale={locale} isAr={isAr} />}
      </div>

      {/* ── الـ Lede ── */}
      {lede && (
        <p style={{
          fontSize: isDetail ? "1.05rem" : ".92rem",
          lineHeight: 1.85,
          color: "var(--ink)",
          fontWeight: 500,
          margin: "0 0 12px",
        }}>
          {lede}
        </p>
      )}

      {/* ── محتوى Axios الكامل (صفحة التفاصيل) أو معاينة في feed ── */}

      {/* ما سبب أهميته؟ — في التفاصيل فقط */}
      {isDetail && whyMatters && (
        <div style={{
          background: "var(--green-pale)",
          border: "1px solid var(--green-light)",
          borderRadius: 10, padding: "12px 14px", marginBottom: 14,
        }}>
          <div style={{
            fontSize: ".72rem", fontWeight: 700, color: "var(--green-deep)",
            marginBottom: 6, letterSpacing: ".04em",
          }}>
            {isAr ? "⚡ ما سبب أهميته؟" : "⚡ Why it matters"}
          </div>
          <p style={{ fontSize: ".93rem", lineHeight: 1.8, color: "var(--ink)", margin: 0 }}>
            {whyMatters}
          </p>
        </div>
      )}

      {/* النقاط الرئيسية — في التفاصيل كاملة، في feed بحد وfade */}
      {keyPoints.length > 0 && (
        <>
          {isDetail && (
            <div style={{
              fontSize: ".72rem", fontWeight: 700, color: "var(--ink)",
              marginBottom: 8, letterSpacing: ".04em", textTransform: "uppercase",
            }}>
              {isAr ? "أبرز التفاصيل" : "Key points"}
            </div>
          )}
          <div className={hasMore ? "jcard-fade-wrap" : ""}>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {(isDetail ? keyPoints : keyPoints.slice(0, FEED_LIMIT)).map((point, i) => (
                <li key={i} style={{
                  display: "flex", gap: 10, alignItems: "flex-start",
                  padding: "7px 0",
                  borderBottom: i < keyPoints.length - 1 ? "1px solid var(--slate3)" : "none",
                }}>
                  <span style={{
                    width: 20, height: 20, flexShrink: 0,
                    background: "#E05A2B", color: "#fff",
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: ".65rem", fontWeight: 700, marginTop: 2,
                  }}>{i + 1}</span>
                  <span style={{ fontSize: ".92rem", lineHeight: 1.75, color: "var(--ink)" }}>
                    {point}
                  </span>
                </li>
              ))}
            </ul>
            {hasMore && <div className="jcard-fade-overlay" />}
          </div>
          {hasMore && (
            <Link href={postHref} className="jcard-more">
              {isAr ? `قراءة الخبر كاملاً ←` : `Read full article →`}
            </Link>
          )}
        </>
      )}

      {/* اقتباس بارز — في التفاصيل فقط */}
      {isDetail && quote && (quote.text_ar || quote.text_en) && (() => {
        const qText   = isAr ? quote.text_ar   : (quote.text_en   ?? quote.text_ar);
        const qAuthor = isAr ? quote.author_ar  : (quote.author_en ?? quote.author_ar);
        const qRole   = isAr ? quote.role_ar    : (quote.role_en   ?? quote.role_ar);
        return (
          <blockquote style={{
            margin: "14px 0", padding: "12px 16px",
            borderRight: isAr ? "4px solid var(--navy)" : "none",
            borderLeft: !isAr ? "4px solid var(--navy)" : "none",
            background: "var(--slate3)",
            borderRadius: isAr ? "0 10px 10px 0" : "10px 0 0 10px",
          }}>
            <p style={{
              fontSize: ".93rem", lineHeight: 1.8, color: "var(--ink)",
              fontStyle: "italic", margin: "0 0 6px",
            }}>
              &ldquo;{qText}&rdquo;
            </p>
            <footer style={{ fontSize: ".78rem", color: "var(--muted)", fontWeight: 600 }}>
              — {qAuthor}
              {qRole && <span style={{ fontWeight: 400 }}> · {qRole}</span>}
            </footer>
          </blockquote>
        );
      })()}

      {/* ما التالي؟ — في التفاصيل فقط */}
      {isDetail && whatsNext && (
        <div style={{
          background: "#1E213008", borderRadius: 10,
          padding: "12px 14px", marginBottom: 4,
        }}>
          <div style={{
            fontSize: ".72rem", fontWeight: 700, color: "var(--ink)",
            marginBottom: 6, letterSpacing: ".04em",
          }}>
            {isAr ? "🔮 ما التالي؟" : "🔮 What's next"}
          </div>
          <p style={{ fontSize: ".92rem", lineHeight: 1.8, color: "var(--ink)", margin: 0 }}>
            {whatsNext}
          </p>
        </div>
      )}
    </JCardShell>
  );
}
