"use client";

import type { ComparisonConfig, PostWithRelations } from "@/lib/supabase/types";
import JCardShell from "@/components/shared/JCardShell";
import { postUrl } from "@/lib/utils";
import Link from "next/link";

// ── Renderers ────────────────────────────────────────────────────────────────
import BarsRenderer       from "./renderers/BarsRenderer";
import MatrixRenderer     from "./renderers/MatrixRenderer";
import ProfileRenderer    from "./renderers/ProfileRenderer";
import TimelineDuelRenderer from "./renderers/TimelineDuelRenderer";
import StanceRenderer     from "./renderers/StanceRenderer";
import SpectrumRenderer   from "./renderers/SpectrumRenderer";

// ── Props ────────────────────────────────────────────────────────────────────
interface Props {
  id: string;
  title: string;
  body?: string;
  config: ComparisonConfig;
  categoryName?: string;
  categorySlug?: string;
  categoryColor?: string;
  likeCount: number;
  publishedAt: string;
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

// ── Type label ────────────────────────────────────────────────────────────────
const TYPE_LABEL: Record<string, { ar: string; en: string }> = {
  bars:          { ar: "مقارنة بالأرقام", en: "Scored Comparison" },
  matrix:        { ar: "جدول المقارنة",   en: "Feature Matrix" },
  profile:       { ar: "مقارنة الملفات",  en: "Profile Comparison" },
  timeline_duel: { ar: "تطور عبر الزمن",  en: "Timeline Duel" },
  stance:        { ar: "تناقض المواقف",   en: "Stance Clash" },
  spectrum:      { ar: "مقياس الطيف",     en: "Spectrum" },
};

// Truncation limits per comparison type
function getVisibleCount(cmpType: string, config: ComparisonConfig): number | null {
  if (cmpType === "bars" && config.dimensions) return 4;
  if (cmpType === "matrix" && config.features) return 4;
  if (cmpType === "stance" && config.topics) return 4;
  if (cmpType === "spectrum" && config.axes) return 4;
  return null; // no truncation for profile, timeline_duel
}

function getTotalCount(cmpType: string, config: ComparisonConfig): number {
  if (cmpType === "bars") return config.dimensions?.length ?? 0;
  if (cmpType === "matrix") return config.features?.length ?? 0;
  if (cmpType === "stance") return config.topics?.length ?? 0;
  if (cmpType === "spectrum") return config.axes?.length ?? 0;
  return 0;
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function ComparisonCard({
  id, title, body, config,
  categoryName, categorySlug, categoryColor,
  likeCount, locale, timeAgoStr, isDetail,
  parentCat, subCat, tags, tags_en, post,
}: Props) {
  const isAr = locale === "ar";

  const colorA  = config.entity_a.color || "#7B5EA7";
  const colorB  = config.entity_b.color || "#E05A2B";
  const nameA   = isAr ? config.entity_a.name_ar : config.entity_a.name_en;
  const nameB   = isAr ? config.entity_b.name_ar : config.entity_b.name_en;
  const cmpType = config.comparison_type ?? "bars";
  const typeLabel = TYPE_LABEL[cmpType]?.[isAr ? "ar" : "en"] ?? (isAr ? "مقارنة" : "Comparison");

  // Type label includes subtype
  const typeLabel_ar = `مقارنة — ${TYPE_LABEL[cmpType]?.ar ?? "مقارنة"}`;
  const typeLabel_en = `Comparison — ${TYPE_LABEL[cmpType]?.en ?? "Comparison"}`;

  // Profile type doesn't show entity strip (already inside the renderer)
  const showEntityStrip = cmpType !== "profile";

  // Truncation in feed
  const LIMIT = 4;
  const totalCount = getTotalCount(cmpType, config);
  const hasMore = !isDetail && getVisibleCount(cmpType, config) !== null && totalCount > LIMIT;

  // Build parentCat from legacy props if not provided directly
  const resolvedParentCat = parentCat ?? (categoryName && categorySlug
    ? { name_ar: categoryName, name_en: categoryName, slug: categorySlug, color: categoryColor }
    : undefined);

  const sourceUrl = config.sourceUrl || undefined;
  const href = postUrl(id, locale);

  // Build a truncated config for feed view
  let displayConfig = config;
  if (!isDetail && hasMore) {
    displayConfig = { ...config };
    if (cmpType === "bars" && config.dimensions) {
      displayConfig = { ...config, dimensions: config.dimensions.slice(0, LIMIT) };
    } else if (cmpType === "matrix" && config.features) {
      displayConfig = { ...config, features: config.features.slice(0, LIMIT) };
    } else if (cmpType === "stance" && config.topics) {
      displayConfig = { ...config, topics: config.topics.slice(0, LIMIT) };
    } else if (cmpType === "spectrum" && config.axes) {
      displayConfig = { ...config, axes: config.axes.slice(0, LIMIT) };
    }
  }

  return (
    <JCardShell
      postId={id}
      postType="comparison"
      typeLabel_ar={typeLabel_ar}
      typeLabel_en={typeLabel_en}
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
        <p style={{ fontSize: ".82rem", color: "#5A5F7A", lineHeight: 1.7, marginBottom: 12, marginTop: 0 }}>
          {body.replace(/<[^>]*>/g, "")}
        </p>
      )}

      {/* Entity strip (for non-profile types) */}
      {showEntityStrip && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#F8F9FB", borderRadius: 10,
          padding: "9px 14px", marginBottom: 16,
        }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
            {config.entity_a.emoji && <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{config.entity_a.emoji}</span>}
            <span style={{ fontFamily: "var(--font-cairo),sans-serif", fontWeight: 800, fontSize: ".88rem", color: colorA }}>{nameA}</span>
          </div>
          <div style={{ flexShrink: 0, fontSize: ".6rem", fontWeight: 900, color: "#fff", background: "#373C55", borderRadius: 20, padding: "3px 10px", letterSpacing: ".04em" }}>
            {isAr ? "مقابل" : "vs"}
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-cairo),sans-serif", fontWeight: 800, fontSize: ".88rem", color: colorB }}>{nameB}</span>
            {config.entity_b.emoji && <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{config.entity_b.emoji}</span>}
          </div>
        </div>
      )}

      {/* Renderer — wrapped for gradient when truncated */}
      <div className={hasMore ? "jcard-fade-wrap" : ""}>
        <div style={{ marginBottom: 4 }}>
          {cmpType === "bars"          && <BarsRenderer          config={displayConfig} isAr={isAr}/>}
          {cmpType === "matrix"        && <MatrixRenderer        config={displayConfig} isAr={isAr}/>}
          {cmpType === "profile"       && <ProfileRenderer       config={displayConfig} isAr={isAr}/>}
          {cmpType === "timeline_duel" && <TimelineDuelRenderer  config={displayConfig} isAr={isAr}/>}
          {cmpType === "stance"        && <StanceRenderer        config={displayConfig} isAr={isAr}/>}
          {cmpType === "spectrum"      && <SpectrumRenderer      config={displayConfig} isAr={isAr}/>}
        </div>
        {hasMore && <div className="jcard-fade-overlay" />}
      </div>

      {/* "Show all" link when truncated */}
      {hasMore && (
        <Link href={href} className="jcard-more">
          {isAr ? `اعرض الكل (${totalCount}) ←` : `Show all (${totalCount}) →`}
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
