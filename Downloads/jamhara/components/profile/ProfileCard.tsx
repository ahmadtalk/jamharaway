"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProfilePostConfig, ProfileSubjectType, PostWithRelations } from "@/lib/supabase/types";
import JCardShell from "@/components/shared/JCardShell";
import ShareButton from "@/components/shared/ShareButton";

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  id: string;
  title: string;
  body?: string;
  config: ProfilePostConfig;
  categoryName?: string;
  categorySlug?: string;
  categoryColor?: string;
  likeCount: number;
  publishedAt: string;
  locale: "ar" | "en";
  timeAgoStr: string;
  isDetail?: boolean;
  parentCat?: { name_ar: string; name_en: string; slug: string; color?: string };
  subCat?: { name_ar: string; name_en: string; slug: string };
  tags?: string[];
  tags_en?: string[];
  post?: PostWithRelations;
}

// ── Subject type labels ───────────────────────────────────────────────────────
const TYPE_LABEL: Record<ProfileSubjectType, { ar: string; en: string; color: string }> = {
  person:       { ar: "شخصية",   en: "Person",       color: "#7B5EA7" },
  organization: { ar: "منظمة",   en: "Organization", color: "#2196F3" },
  country:      { ar: "دولة",    en: "Country",      color: "#4CB36C" },
  movement:     { ar: "حركة",    en: "Movement",     color: "#E05A2B" },
  other:        { ar: "ملف",     en: "Profile",      color: "#0891B2" },
};

// ── Timeline dot colors ───────────────────────────────────────────────────────
const TIMELINE_COLORS: Record<string, string> = {
  milestone: "#4CB36C",
  award:     "#F59E0B",
  crisis:    "#E05A2B",
  founding:  "#2196F3",
  death:     "#6B7280",
  other:     "#7B5EA7",
};

// ── Helper: hex → rgba ────────────────────────────────────────────────────────
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ config }: { config: ProfilePostConfig }) {
  const [imgFailed, setImgFailed] = useState(false);
  const color = config.avatar_color || "#373C55";
  const showImg = !!config.image_url && !imgFailed;

  return (
    <div style={{
      width: 80, height: 80, borderRadius: "50%",
      background: showImg ? "transparent" : hexToRgba(color, 0.15),
      border: `3px solid ${color}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, overflow: "hidden", position: "relative",
    }}>
      {showImg ? (
        <img
          src={config.image_url}
          alt={config.full_name_ar}
          onError={() => setImgFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span style={{ fontSize: "2rem", lineHeight: 1 }}>{config.avatar_emoji || "👤"}</span>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ProfileCard({
  id, title, body, config,
  categoryName, categorySlug, categoryColor = "#0891B2",
  likeCount, locale, timeAgoStr, isDetail = false,
  parentCat, subCat, tags, tags_en, post,
}: Props) {
  const isAr = locale === "ar";
  const color = config.avatar_color || "#373C55";
  const typeInfo = TYPE_LABEL[config.subject_type] ?? TYPE_LABEL.other;
  const displayName = isAr
    ? (config.known_as_ar || config.full_name_ar)
    : (config.known_as_en || config.full_name_en);
  const tagline = isAr ? config.tagline_ar : config.tagline_en;
  const sourceUrl = config.sourceUrl || undefined;

  const resolvedParentCat = parentCat ?? (categoryName && categorySlug
    ? { name_ar: categoryName, name_en: categoryName, slug: categorySlug, color: categoryColor }
    : undefined);

  const typeLabel_ar = `بروفايل — ${typeInfo.ar}`;
  const typeLabel_en = `Profile — ${typeInfo.en}`;

  const TIMELINE_LIMIT = 4;
  const timeline = config.timeline ?? [];
  const timelineToShow = !isDetail ? timeline.slice(0, TIMELINE_LIMIT) : timeline;
  const hasMore = !isDetail && timeline.length > TIMELINE_LIMIT;
  const postHref = `${locale === "en" ? "/en" : ""}/p/${id}`;

  return (
    <JCardShell
      postId={id}
      postType="profile"
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
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <ShareButton post={post} locale={locale} isAr={locale === "ar"} />
        </div>
      )}

      {/* ── Profile Header ─────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${hexToRgba(color, 0.08)} 0%, ${hexToRgba(color, 0.03)} 100%)`,
        border: `1px solid ${hexToRgba(color, 0.2)}`,
        borderRadius: 12,
        padding: "16px 16px 14px",
        marginBottom: 14,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative arc */}
        <div style={{
          position: "absolute", top: -30, insetInlineEnd: -30,
          width: 100, height: 100, borderRadius: "50%",
          background: hexToRgba(color, 0.07),
          pointerEvents: "none",
        }} />

        {/* Type badge */}
        <div style={{
          position: "absolute", top: 10, insetInlineEnd: 12,
          fontSize: ".6rem", fontWeight: 800, letterSpacing: ".06em",
          color: typeInfo.color,
          background: hexToRgba(typeInfo.color, 0.12),
          borderRadius: 20, padding: "2px 9px",
        }}>
          {isAr ? typeInfo.ar : typeInfo.en}
        </div>

        {/* Avatar + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar config={config} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{
              fontFamily: "var(--font-cairo),sans-serif",
              fontWeight: 800, fontSize: "1.05rem",
              color: "#1A1D2E", margin: "0 0 3px",
              lineHeight: 1.25,
            }}>
              {displayName}
            </h3>
            {tagline && (
              <p style={{
                fontSize: ".75rem", color: color, fontWeight: 600,
                margin: "0 0 8px", lineHeight: 1.4,
              }}>
                {tagline}
              </p>
            )}

            {/* Quick facts row */}
            <div style={{
              display: "flex", flexWrap: "wrap", gap: "4px 8px",
              marginTop: 4,
            }}>
              {config.quick_facts.map((fact, i) => (
                <span key={i} style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: ".68rem", color: "#5A5F7A",
                  background: "#fff",
                  border: "1px solid #E8EBF0",
                  borderRadius: 20, padding: "2px 8px",
                  whiteSpace: "nowrap",
                }}>
                  <span>{fact.icon}</span>
                  <span style={{ color: "#9CA3AF", fontSize: ".62rem" }}>
                    {isAr ? fact.label_ar : fact.label_en}:
                  </span>
                  <span style={{ fontWeight: 600, color: "#373C55" }}>
                    {isAr ? fact.value_ar : fact.value_en}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ──────────────────────────────────────────────── */}
      {config.stats && config.stats.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(config.stats.length, 4)}, 1fr)`,
          gap: 8,
          marginBottom: 14,
        }}>
          {config.stats.map((stat, i) => (
            <div key={i} style={{
              background: "#F8F9FB",
              border: "1px solid #E8EBF0",
              borderRadius: 10,
              padding: "10px 8px",
              textAlign: "center",
            }}>
              {stat.icon && (
                <div style={{ fontSize: "1.1rem", marginBottom: 3 }}>{stat.icon}</div>
              )}
              <div style={{
                fontFamily: "var(--font-cairo),sans-serif",
                fontWeight: 800, fontSize: ".95rem",
                color: color, lineHeight: 1.1,
              }}>
                {stat.value}
                {stat.unit && (
                  <span style={{ fontSize: ".55rem", fontWeight: 600, color: "#9CA3AF", marginInlineStart: 2 }}>
                    {stat.unit}
                  </span>
                )}
              </div>
              <div style={{ fontSize: ".62rem", color: "#5A5F7A", marginTop: 2, lineHeight: 1.3 }}>
                {isAr ? stat.label_ar : stat.label_en}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Body text ───────────────────────────────────────────────── */}
      {body && body.replace(/<[^>]*>/g, "").trim() && (
        <p style={{
          fontSize: ".82rem", color: "#5A5F7A", lineHeight: 1.75,
          marginBottom: 14, marginTop: 0,
        }}>
          {body.replace(/<[^>]*>/g, "")}
        </p>
      )}

      {/* ── Timeline ────────────────────────────────────────────────── */}
      {timelineToShow.length > 0 && (
        <div style={{ marginBottom: hasMore ? 0 : 14 }}>
          <p style={{
            fontSize: ".68rem", fontWeight: 700, color: "#9CA3AF",
            letterSpacing: ".06em", textTransform: "uppercase",
            marginBottom: 10, marginTop: 0,
          }}>
            {isAr ? "المسار الزمني" : "Timeline"}
          </p>

          <div className={hasMore ? "jcard-fade-wrap" : ""}>
            <div style={{ position: "relative" }}>
              {/* Vertical line */}
              <div style={{
                position: "absolute",
                top: 8, bottom: 8,
                inlineSize: 2,
                insetInlineStart: 22,
                background: "#E8EBF0",
                borderRadius: 2,
              }} />

              {timelineToShow.map((item, i) => {
                const dotColor = TIMELINE_COLORS[item.type ?? "other"] ?? TIMELINE_COLORS.other;
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 0,
                    marginBottom: i < timelineToShow.length - 1 ? 10 : 0,
                    position: "relative",
                  }}>
                    {/* Year badge */}
                    <div style={{
                      flexShrink: 0, width: 44,
                      fontSize: ".6rem", fontWeight: 800,
                      color: dotColor, textAlign: "center",
                      paddingTop: 2,
                    }}>
                      {item.year}
                    </div>
                    {/* Dot */}
                    <div style={{
                      flexShrink: 0,
                      width: 10, height: 10,
                      borderRadius: "50%",
                      background: dotColor,
                      marginTop: 3, marginInlineEnd: 10,
                      border: "2px solid #fff",
                      boxShadow: `0 0 0 1px ${dotColor}`,
                      zIndex: 1,
                    }} />
                    {/* Event */}
                    <p style={{
                      fontSize: ".75rem", color: "#373C55",
                      lineHeight: 1.5, margin: 0,
                      fontWeight: 500,
                    }}>
                      {isAr ? item.event_ar : item.event_en}
                    </p>
                  </div>
                );
              })}
            </div>

            {hasMore && <div className="jcard-fade-overlay" />}
          </div>

          {hasMore && (
            <Link href={postHref} className="jcard-more">
              {isAr
                ? `اعرض الكل (${timeline.length}) ←`
                : `Show all (${timeline.length}) →`}
            </Link>
          )}
        </div>
      )}

      {/* ── Sections (detail only) ──────────────────────────────────── */}
      {isDetail && config.sections && config.sections.length > 0 && (
        <div style={{ marginBottom: 14, marginTop: 14 }}>
          {config.sections.map((section, i) => (
            <div key={i} style={{
              borderInlineStart: `3px solid ${hexToRgba(color, 0.4)}`,
              paddingInlineStart: 12,
              marginBottom: i < (config.sections?.length ?? 0) - 1 ? 16 : 0,
            }}>
              <p style={{
                fontFamily: "var(--font-cairo),sans-serif",
                fontWeight: 700, fontSize: ".82rem",
                color: color, marginBottom: 5, marginTop: 0,
              }}>
                {isAr ? section.title_ar : section.title_en}
              </p>
              <p style={{
                fontSize: ".78rem", color: "#5A5F7A",
                lineHeight: 1.75, margin: 0,
              }}>
                {isAr ? section.content_ar : section.content_en}
              </p>
            </div>
          ))}
        </div>
      )}

    </JCardShell>
  );
}

