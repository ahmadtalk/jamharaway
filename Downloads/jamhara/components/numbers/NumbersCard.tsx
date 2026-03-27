"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { NumbersConfig, PostWithRelations } from "@/lib/supabase/types";
import { postUrl } from "@/lib/utils";
import JCardShell from "@/components/shared/JCardShell";

interface Props {
  id: string;
  title: string;
  body?: string;
  config: NumbersConfig;
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
  tags_en?: string[];
  post?: PostWithRelations;
}

const PALETTE = ["#4CB36C", "#7B5EA7", "#E05A2B", "#2196F3", "#F59E0B", "#00BCD4"];

const FEED_LIMIT = 4;

export default function NumbersCard({
  id, title, body, config,
  categoryName, categorySlug, categoryColor,
  likeCount, locale, timeAgoStr, isDetail,
  parentCat, subCat, tags, tags_en, post,
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

  const visibleStats = isDetail ? config.stats : config.stats.slice(0, FEED_LIMIT);
  const hasMore = !isDetail && config.stats.length > FEED_LIMIT;

  return (
    <JCardShell
      postId={id}
      postType="numbers"
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
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>        </div>
      )}

      {/* Body — moved to top (feed only) */}
      {!isDetail && body && body.replace(/<[^>]*>/g, "").trim() && (
        <p style={{ fontSize: ".82rem", color: "#5A5F7A", lineHeight: 1.7, marginBottom: 10, marginTop: 0 }}>
          {body.replace(/<[^>]*>/g, "")}
        </p>
      )}

      {/* Stats grid */}
      <div className={hasMore ? "jcard-fade-wrap" : ""}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: 10,
        marginBottom: 4,
      }}>
        {visibleStats.map((stat, idx) => {
          const color   = stat.color ?? PALETTE[idx % PALETTE.length];
          const label   = isAr ? stat.label_ar : stat.label_en;
          const context = isAr ? stat.context_ar : stat.context_en;
          const delay   = idx * 60;

          return (
            <div
              key={idx}
              style={{
                borderRadius: 10,
                border: "1px solid #E8EAF0",
                borderTop: `3px solid ${color}`,
                padding: "14px 12px 12px",
                background: "#FAFBFD",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "scale(1)" : "scale(0.9)",
                transition: `opacity 300ms ease ${delay}ms, transform 300ms ease ${delay}ms`,
              }}
            >
              {stat.icon && (
                <div style={{ fontSize: "1.8rem", lineHeight: 1, marginBottom: 6 }}>
                  {stat.icon}
                </div>
              )}

              <div style={{
                fontSize: "1.6rem", fontWeight: 900, color,
                lineHeight: 1.1, marginBottom: 5,
                fontVariantNumeric: "lining-nums",
                fontFamily: "var(--font-cairo),sans-serif",
                wordBreak: "break-word",
              }}>
                {stat.number}
              </div>

              <div style={{
                fontSize: ".78rem", fontWeight: 700, color: "#3A3D52",
                lineHeight: 1.35, marginBottom: context ? 4 : 0,
                fontFamily: "var(--font-cairo),sans-serif",
              }}>
                {label}
              </div>

              {context && (
                <div style={{ fontSize: ".66rem", color: "#9BA0B8", lineHeight: 1.4 }}>
                  {context}
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
          {isAr ? `اعرض الكل (${config.stats.length}) ←` : `Show all (${config.stats.length}) →`}
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
