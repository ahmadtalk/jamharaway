"use client";

import type { ChartConfig, PostWithRelations } from "@/lib/supabase/types";
import JCardShell from "@/components/shared/JCardShell";
import ShareButton from "@/components/shared/ShareButton";
import ChartRenderer from "./ChartRenderer";

interface Props {
  id: string;
  title: string;
  config: ChartConfig;
  categoryName?: string;
  categorySlug?: string;
  categoryColor?: string;
  likeCount: number;
  publishedAt: string;
  locale: "ar" | "en";
  timeAgoStr: string;
  isDetail?: boolean;
  body?: string | null;
  // New unified props (optional — passed from PostCard/detail page)
  parentCat?: { name_ar: string; name_en: string; slug: string; color?: string };
  subCat?: { name_ar: string; name_en: string; slug: string };
  tags?: string[];
  tags_en?: string[];
  post?: PostWithRelations;
}

export default function ChartCard({
  id, title, config,
  categoryName, categorySlug, categoryColor,
  likeCount, locale, timeAgoStr, isDetail = false, body,
  parentCat, subCat, tags, tags_en, post,
}: Props) {
  const isAr = locale === "ar";
  const chartHeight = isDetail ? 380 : 260;

  // Build parentCat from legacy props if not provided directly
  const resolvedParentCat = parentCat ?? (categoryName && categorySlug
    ? { name_ar: categoryName, name_en: categoryName, slug: categorySlug, color: categoryColor }
    : undefined);

  const sourceUrl = config.sourceUrl || undefined;

  return (
    <JCardShell
      postId={id}
      postType="chart"
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

      <div className="chart-wrap">
        <ChartRenderer config={config} height={chartHeight} />
      </div>

      {config.source && (
        <div className="chart-source">
          {isAr ? "المصدر:" : "Source:"}&nbsp;
          {config.sourceUrl
            ? <a href={config.sourceUrl} target="_blank" rel="noopener noreferrer">{config.source}</a>
            : <span>{config.source}</span>
          }
        </div>
      )}

      {body && (
        <p style={{
          paddingTop: 4,
          paddingBottom: 4,
          fontSize: 14,
          lineHeight: 1.85,
          color: "var(--ink2, #3A3D52)",
          margin: 0,
        }}>
          {body.replace(/<[^>]*>/g, "")}
        </p>
      )}
    </JCardShell>
  );
}
