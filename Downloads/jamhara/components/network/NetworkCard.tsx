"use client";

import Link from "next/link";
import type { NetworkConfig, NetworkRelationType, PostWithRelations } from "@/lib/supabase/types";
import JCardShell from "@/components/shared/JCardShell";
import ShareButton from "@/components/shared/ShareButton";

interface Props {
  id: string;
  title: string;
  body?: string;
  config: NetworkConfig;
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

const RELATION_STYLE: Record<NetworkRelationType | "other", { color: string; bg: string }> = {
  ally:        { color: "#2D7A46", bg: "#E8F6ED" },
  rival:       { color: "#B45309", bg: "#FEF3C7" },
  partner:     { color: "#1D4ED8", bg: "#EFF6FF" },
  client:      { color: "#7C3AED", bg: "#F5F3FF" },
  parent:      { color: "#0891B2", bg: "#E0F7FA" },
  subsidiary:  { color: "#6D28D9", bg: "#EDE9FE" },
  competitor:  { color: "#DC2626", bg: "#FEF2F2" },
  neutral:     { color: "#6B7280", bg: "#F3F4F6" },
  other:       { color: "#4B5563", bg: "#F9FAFB" },
};

const STRENGTH_DOTS: Record<string, number> = { strong: 3, medium: 2, weak: 1 };
const FEED_LIMIT = 5;

export default function NetworkCard({
  id, title, body, config,
  categoryName, categorySlug, categoryColor,
  likeCount, locale, timeAgoStr, isDetail = false,
  parentCat, subCat, tags, post,
}: Props) {
  const isAr = locale === "ar";
  const nodes = config.nodes ?? [];
  const nodesToShow = !isDetail ? nodes.slice(0, FEED_LIMIT) : nodes;
  const hasMore = !isDetail && nodes.length > FEED_LIMIT;
  const postHref = `${locale === "en" ? "/en" : ""}/p/${id}`;
  const resolvedParentCat = parentCat ?? (categoryName && categorySlug
    ? { name_ar: categoryName, name_en: categoryName, slug: categorySlug, color: categoryColor }
    : undefined);

  return (
    <JCardShell
      postId={id}
      postType="network"
      typeLabel_ar="خريطة الصلات"
      typeLabel_en="Network Map"
      title={title}
      locale={locale}
      timeAgoStr={timeAgoStr}
      isDetail={isDetail}
      parentCat={resolvedParentCat}
      subCat={subCat}
      sourceUrl={config.sourceUrl}
      likeCount={likeCount}
      tags={tags}
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

      {/* Center entity */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px",
        background: "linear-gradient(135deg, #F0F4FF 0%, #F8F9FF 100%)",
        border: "2px solid #C7D2FE",
        borderRadius: 12,
        marginBottom: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "#3730A3", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.3rem", flexShrink: 0,
        }}>
          {config.center_emoji || "🏛"}
        </div>
        <div>
          <p style={{
            fontFamily: "var(--font-cairo),sans-serif",
            fontWeight: 800, fontSize: ".9rem",
            color: "#1E2130", margin: "0 0 2px",
          }}>
            {isAr ? config.center_ar : config.center_en}
          </p>
          {(isAr ? config.center_role_ar : config.center_role_en) && (
            <p style={{ fontSize: ".7rem", color: "#6B7280", margin: 0 }}>
              {isAr ? config.center_role_ar : config.center_role_en}
            </p>
          )}
        </div>
        <div style={{
          marginInlineStart: "auto",
          fontSize: ".6rem", fontWeight: 700,
          color: "#4338CA", background: "#EEF2FF",
          borderRadius: 20, padding: "3px 10px", flexShrink: 0,
        }}>
          {isAr ? `${nodes.length} صلة` : `${nodes.length} connections`}
        </div>
      </div>

      {/* Nodes */}
      <div className={hasMore ? "jcard-fade-wrap" : ""}>
        {nodesToShow.map((node, i) => {
          const style = RELATION_STYLE[node.relation_type as NetworkRelationType] ?? RELATION_STYLE.other;
          const dots = STRENGTH_DOTS[node.strength ?? "medium"] ?? 2;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "9px 0",
              borderBottom: i < nodesToShow.length - 1 ? "1px solid #F3F4F6" : "none",
            }}>
              {/* Emoji */}
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "#F3F4F6",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.1rem", flexShrink: 0,
              }}>
                {node.emoji || "⬡"}
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{
                    fontFamily: "var(--font-cairo),sans-serif",
                    fontWeight: 700, fontSize: ".8rem", color: "#1A1D2E",
                  }}>
                    {isAr ? node.name_ar : node.name_en}
                  </span>
                  {(isAr ? node.role_ar : node.role_en) && (
                    <span style={{ fontSize: ".67rem", color: "#9CA3AF" }}>
                      — {isAr ? node.role_ar : node.role_en}
                    </span>
                  )}
                </div>
                {(isAr ? node.description_ar : node.description_en) && (
                  <p style={{ fontSize: ".72rem", color: "#5A5F7A", margin: "3px 0 0", lineHeight: 1.5 }}>
                    {isAr ? node.description_ar : node.description_en}
                  </p>
                )}
              </div>
              {/* Relation badge + strength */}
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span style={{
                  fontSize: ".62rem", fontWeight: 700,
                  color: style.color, background: style.bg,
                  borderRadius: 20, padding: "2px 8px",
                  whiteSpace: "nowrap",
                }}>
                  {isAr ? node.relation_label_ar : node.relation_label_en}
                </span>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1,2,3].map(d => (
                    <div key={d} style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: d <= dots ? style.color : "#E5E7EB",
                    }} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        {hasMore && <div className="jcard-fade-overlay" />}
      </div>
      {hasMore && (
        <Link href={postHref} className="jcard-more">
          {isAr ? `اعرض الكل (${nodes.length}) ←` : `Show all (${nodes.length}) →`}
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
