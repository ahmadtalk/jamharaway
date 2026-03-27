"use client";

import Link from "next/link";
import type { DebateConfig, PostWithRelations } from "@/lib/supabase/types";
import { postUrl } from "@/lib/utils";
import JCardShell from "@/components/shared/JCardShell";

interface Props {
  id: string;
  title: string;
  body?: string;
  config: DebateConfig;
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

const FEED_ARGS = 3;

export default function DebateCard({
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

  const colorA = config.side_a.color || "#059669";
  const colorB = config.side_b.color || "#DC2626";

  const argsA = isDetail ? config.side_a.arguments : config.side_a.arguments.slice(0, FEED_ARGS);
  const argsB = isDetail ? config.side_b.arguments : config.side_b.arguments.slice(0, FEED_ARGS);
  const totalArgs = config.side_a.arguments.length + config.side_b.arguments.length;
  const hasMore = !isDetail && totalArgs > FEED_ARGS * 2;

  return (
    <JCardShell
      postId={id}
      postType="debate"
      typeLabel_ar="مناظرة"
      typeLabel_en="Debate"
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

      {/* Body — top */}
      {body && body.replace(/<[^>]*>/g, "").trim() && (
        <p style={{ fontSize: ".82rem", color: "#5A5F7A", lineHeight: 1.7, marginBottom: 10, marginTop: 0 }}>
          {body.replace(/<[^>]*>/g, "")}
        </p>
      )}

      {/* Question box */}
      <div style={{
        padding: "10px 14px", marginBottom: 12,
        background: "#F8F9FC", borderRadius: 8,
        border: "1px solid #E2E8F0", textAlign: "center",
      }}>
        <p style={{ fontSize: ".84rem", fontWeight: 700, color: "#1A1D2E", lineHeight: 1.6, margin: 0 }}>
          {isAr ? config.question_ar : config.question_en}
        </p>
      </div>

      {/* Two-column debate */}
      <div className={hasMore ? "jcard-fade-wrap" : ""}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}>
          {/* Side A */}
          <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${colorA}30` }}>
            <div style={{
              padding: "8px 10px",
              background: `${colorA}15`,
              borderBottom: `2px solid ${colorA}`,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {config.side_a.emoji && (
                <span style={{ fontSize: ".9rem" }}>{config.side_a.emoji}</span>
              )}
              <span style={{ fontSize: ".76rem", fontWeight: 700, color: colorA }}>
                {isAr ? config.side_a.label_ar : config.side_a.label_en}
              </span>
            </div>
            <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
              {argsA.map((arg, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: colorA, flexShrink: 0, marginTop: 5,
                  }} />
                  <p style={{ fontSize: ".74rem", color: "#1A1D2E", lineHeight: 1.6, margin: 0 }}>
                    {isAr ? arg.point_ar : arg.point_en}
                  </p>
                </div>
              ))}
              {isDetail && (isAr ? config.side_a.summary_ar : config.side_a.summary_en) && (
                <p style={{
                  fontSize: ".72rem", color: colorA, lineHeight: 1.5,
                  margin: "4px 0 0 0", fontStyle: "italic",
                  borderTop: `1px solid ${colorA}20`, paddingTop: 6,
                }}>
                  {isAr ? config.side_a.summary_ar : config.side_a.summary_en}
                </p>
              )}
            </div>
          </div>

          {/* Side B */}
          <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${colorB}30` }}>
            <div style={{
              padding: "8px 10px",
              background: `${colorB}15`,
              borderBottom: `2px solid ${colorB}`,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {config.side_b.emoji && (
                <span style={{ fontSize: ".9rem" }}>{config.side_b.emoji}</span>
              )}
              <span style={{ fontSize: ".76rem", fontWeight: 700, color: colorB }}>
                {isAr ? config.side_b.label_ar : config.side_b.label_en}
              </span>
            </div>
            <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
              {argsB.map((arg, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: colorB, flexShrink: 0, marginTop: 5,
                  }} />
                  <p style={{ fontSize: ".74rem", color: "#1A1D2E", lineHeight: 1.6, margin: 0 }}>
                    {isAr ? arg.point_ar : arg.point_en}
                  </p>
                </div>
              ))}
              {isDetail && (isAr ? config.side_b.summary_ar : config.side_b.summary_en) && (
                <p style={{
                  fontSize: ".72rem", color: colorB, lineHeight: 1.5,
                  margin: "4px 0 0 0", fontStyle: "italic",
                  borderTop: `1px solid ${colorB}20`, paddingTop: 6,
                }}>
                  {isAr ? config.side_b.summary_ar : config.side_b.summary_en}
                </p>
              )}
            </div>
          </div>
        </div>
        {hasMore && <div className="jcard-fade-overlay" />}
      </div>

      {hasMore && (
        <Link href={href} className="jcard-more">
          {isAr ? `اعرض المناظرة كاملة ←` : `Show full debate →`}
        </Link>
      )}

      {/* Verdict — detail only */}
      {isDetail && (isAr ? config.verdict_ar : config.verdict_en) && (
        <div style={{
          marginTop: 14, padding: "12px 14px",
          background: "#F8F9FC", borderRadius: 8,
          border: "1px solid #E2E8F0",
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>⚖️</span>
          <div>
            <span style={{ fontSize: ".68rem", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 4, letterSpacing: ".04em" }}>
              {isAr ? "الخلاصة التحريرية" : "Editorial Verdict"}
            </span>
            <p style={{ fontSize: ".82rem", color: "#1A1D2E", lineHeight: 1.7, margin: 0 }}>
              {isAr ? config.verdict_ar : config.verdict_en}
            </p>
          </div>
        </div>
      )}
    </JCardShell>
  );
}
