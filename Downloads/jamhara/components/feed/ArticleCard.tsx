"use client";

import JCardShell from "@/components/shared/JCardShell";
import type { PostWithRelations } from "@/lib/supabase/types";

interface Props {
  post: PostWithRelations;
  locale: "ar" | "en";
  timeAgoStr: string;
  isDetail?: boolean;
  index?: number;
  tags?: string[];
  tags_en?: string[];
}

export default function ArticleCard({
  post, locale, timeAgoStr, isDetail = false, index = 0, tags, tags_en,
}: Props) {
  const isAr = locale === "ar";
  const title = isAr ? post.title_ar : (post.title_en || post.title_ar);
  const body  = isAr ? post.body_ar  : (post.body_en  || post.body_ar);

  const parentCat = post.category
    ? {
        name_ar: post.category.name_ar,
        name_en: post.category.name_en,
        slug: post.category.slug,
        color: post.category.color,
      }
    : undefined;

  const subCat = post.subcategory
    ? {
        name_ar: post.subcategory.name_ar,
        name_en: post.subcategory.name_en,
        slug: post.subcategory.slug,
      }
    : undefined;

  // Real sources from web search (stored in content_config by generate route)
  const configSources = (post.content_config as any)?.sources as { name: string; url: string }[] | undefined;
  const sources: { name: string; url: string }[] =
    configSources && configSources.length > 0
      ? configSources
      : post.source?.domain
        ? [{ name: post.source.name ?? post.source.domain, url: `https://${post.source.domain}` }]
        : [];

  return (
    <JCardShell
      postId={post.id}
      postType="article"
      title={title}
      locale={locale}
      timeAgoStr={timeAgoStr}
      isDetail={isDetail}
      index={index}
      parentCat={parentCat}
      subCat={subCat}
      sources={sources}
      likeCount={post.like_count}
      tags={tags} tags_en={tags_en}
    >
      {/* زر المشاركة — يظهر فقط في صفحة التفاصيل */}
      {isDetail && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>        </div>
      )}

      {/* Image */}
      {post.image_url && (
        <img
          src={post.image_url}
          alt={title}
          className="jcard-article-img"
          loading={index < 3 ? "eager" : "lazy"}
        />
      )}

      {/* Body text */}
      <div
        style={{
          fontSize: "1rem",
          lineHeight: 1.85,
          color: "var(--ink2, #3A3D52)",
          paddingBottom: 4,
        }}
        dangerouslySetInnerHTML={{
          __html: body.replace(/\*\*(.*?)\*\*/g, "<strong style='color:var(--ink);font-weight:600'>$1</strong>"),
        }}
      />
    </JCardShell>
  );
}
