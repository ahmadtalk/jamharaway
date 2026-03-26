"use client";

import { useState } from "react";
import Link from "next/link";
import JCardShell from "@/components/shared/JCardShell";
import type { PostWithRelations } from "@/lib/supabase/types";

interface Props {
  post: PostWithRelations;
  locale: "ar" | "en";
  timeAgoStr: string;
  isDetail?: boolean;
  index?: number;
}

interface NewsConfig {
  source_name?: string;
  source_url?: string;
  gnews_url?: string;
  gnews_published_at?: string;
}

export default function NewsCard({ post, locale, timeAgoStr, isDetail = false, index = 0 }: Props) {
  const isAr = locale === "ar";
  const title = isAr ? post.title_ar : (post.title_en || post.title_ar);
  const body  = isAr ? post.body_ar  : (post.body_en  || post.body_ar);
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
    >
      {/* ── صورة الخبر ── */}
      {hasImage && (
        <Link href={`/${locale === "en" ? "en/" : ""}p/${post.id}`} style={{ display: "block", marginBottom: 12, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image_url!}
            alt={title}
            onError={() => setImgErr(true)}
            style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
          />
        </Link>
      )}

      {/* ── شارة الخبر العاجل ── */}
      {!isDetail && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{
            fontSize: ".68rem", fontWeight: 700, letterSpacing: ".05em",
            background: "#E05A2B15", color: "#E05A2B",
            padding: "2px 8px", borderRadius: 20,
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
      )}

      {/* ── متن الخبر ── */}
      {body && (
        <div style={{
          fontSize: isDetail ? "1rem" : ".88rem",
          lineHeight: isDetail ? 1.9 : 1.75,
          color: "var(--ink)",
          display: "-webkit-box",
          WebkitLineClamp: isDetail ? undefined : 5,
          WebkitBoxOrient: isDetail ? undefined : "vertical" as const,
          overflow: isDetail ? undefined : "hidden",
        }}>
          {body}
        </div>
      )}

      {/* ── رابط المصدر الأصلي (في صفحة التفاصيل) ── */}
      {isDetail && cfg.gnews_url && (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--slate)" }}>
          <a
            href={cfg.gnews_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: ".82rem", color: "#E05A2B", fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ↗ {isAr ? "قراءة المصدر الأصلي" : "Read Original Source"}
            {sourceName && ` — ${sourceName}`}
          </a>
        </div>
      )}
    </JCardShell>
  );
}
