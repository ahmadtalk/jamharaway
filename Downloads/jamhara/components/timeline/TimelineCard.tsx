"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { TimelinePostConfig, TimelineEventType } from "@/lib/supabase/types";
import { postUrl } from "@/lib/utils";
import JCardShell from "@/components/shared/JCardShell";

interface Props {
  id: string;
  title: string;
  body?: string;
  config: TimelinePostConfig;
  categoryName?: string;
  categorySlug?: string;
  categoryColor?: string;
  likeCount: number;
  publishedAt: string;
  locale: "ar" | "en";
  timeAgoStr: string;
  isDetail?: boolean;
  // New unified props
  parentCat?: { name_ar: string; name_en: string; slug: string; color?: string };
  subCat?: { name_ar: string; name_en: string; slug: string };
}

const EVENT_COLOR: Record<TimelineEventType, string> = {
  milestone:  "#F59E0B",
  crisis:     "#E05A2B",
  innovation: "#4CB36C",
  discovery:  "#2196F3",
  default:    "#0D9488",
};

const FEED_LIMIT = 5;

export default function TimelineCard({
  id, title, body, config,
  categoryName, categorySlug, categoryColor = "#0D9488",
  likeCount, locale, timeAgoStr, isDetail = false,
  parentCat, subCat,
}: Props) {
  const isAr = locale === "ar";
  const [visible, setVisible] = useState<boolean[]>([]);

  const events = config.events ?? [];
  const displayedEvents = isDetail ? events : events.slice(0, FEED_LIMIT);
  const hasMore = !isDetail && events.length > FEED_LIMIT;

  // Staggered entrance animation
  useEffect(() => {
    setVisible(new Array(displayedEvents.length).fill(false));
    const timers: ReturnType<typeof setTimeout>[] = [];
    displayedEvents.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setVisible(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * 80));
    });
    return () => timers.forEach(clearTimeout);
  }, [isDetail, events.length]);

  // Build parentCat from legacy props if not provided directly
  const resolvedParentCat = parentCat ?? (categoryName && categorySlug
    ? { name_ar: categoryName, name_en: categoryName, slug: categorySlug, color: categoryColor }
    : undefined);

  const sourceUrl = config.sourceUrl || undefined;
  const href = postUrl(id, locale);

  return (
    <JCardShell
      postId={id}
      postType="timeline"
      title={title}
      locale={locale}
      timeAgoStr={timeAgoStr}
      isDetail={isDetail}
      parentCat={resolvedParentCat}
      subCat={subCat}
      sourceUrl={sourceUrl}
      likeCount={likeCount}
    >
      {/* Body — moved to top */}
      {!isDetail && body && body.replace(/<[^>]*>/g, "").trim() && (
        <p style={{ fontSize: ".82rem", color: "#5A5F7A", lineHeight: 1.7, marginBottom: 12, marginTop: 0 }}>
          {body.replace(/<[^>]*>/g, "")}
        </p>
      )}

      {/* Vertical timeline */}
      <div className={hasMore ? "jcard-fade-wrap" : ""}>
      <div style={{ position: "relative", marginBottom: 4 }}>
        {/* Center line */}
        <div style={{
          position: "absolute", top: 0, bottom: 0,
          left: "50%", transform: "translateX(-50%)",
          width: 2, background: "#EDEEF3", zIndex: 0,
        }} />

        {displayedEvents.map((event, idx) => {
          const color = EVENT_COLOR[event.type ?? "default"] ?? EVENT_COLOR.default;
          const eventTitle = isAr ? event.title_ar : event.title_en;
          const description = isAr ? event.description_ar : event.description_en;
          const isVisible = visible[idx] ?? false;

          return (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 20px 1fr",
                alignItems: "flex-start",
                gap: 0,
                marginBottom: idx < displayedEvents.length - 1 ? 14 : 0,
                position: "relative", zIndex: 1,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(8px)",
                transition: "opacity .35s ease, transform .35s ease",
              }}
            >
              {/* Left column */}
              {idx % 2 === 0 ? (
                <div style={{ display: "flex", justifyContent: "flex-end", paddingInlineEnd: 12, paddingTop: 2 }}>
                  <span style={{
                    display: "inline-block", fontSize: ".65rem", fontWeight: 800,
                    color: "#fff", background: color, borderRadius: 20,
                    padding: "2px 9px", letterSpacing: ".02em", whiteSpace: "nowrap",
                  }}>
                    {event.year}
                  </span>
                </div>
              ) : (
                <div style={{ paddingTop: 4 }}>
                  {description && (
                    <p style={{
                      fontSize: ".7rem", color: "#7A7F99", lineHeight: 1.55, margin: 0,
                      paddingInlineEnd: 12, textAlign: isAr ? "right" : "left",
                    }}>
                      {description}
                    </p>
                  )}
                </div>
              )}

              {/* Center dot */}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 4 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: color, border: "2px solid #fff",
                  boxShadow: `0 0 0 1px ${color}`, flexShrink: 0,
                }} />
              </div>

              {/* Right column */}
              {idx % 2 === 0 ? (
                <div style={{ paddingInlineStart: 12, paddingTop: 0 }}>
                  <p style={{ fontSize: ".78rem", fontWeight: 700, color: "#1A1D2E", margin: "0 0 3px", lineHeight: 1.4 }}>
                    {event.emoji ? `${event.emoji} ${eventTitle}` : eventTitle}
                  </p>
                  {description && (
                    <p style={{ fontSize: ".7rem", color: "#7A7F99", lineHeight: 1.55, margin: 0 }}>
                      {description}
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "flex-start", paddingInlineStart: 12, paddingTop: 2 }}>
                  <span style={{
                    display: "inline-block", fontSize: ".65rem", fontWeight: 800,
                    color: "#fff", background: color, borderRadius: 20,
                    padding: "2px 9px", letterSpacing: ".02em", whiteSpace: "nowrap",
                  }}>
                    {event.year}
                  </span>
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
          {isAr ? `اعرض الكل (${events.length}) ←` : `Show all (${events.length}) →`}
        </Link>
      )}

      {/* Body — detail only (feed shows it at top) */}
      {isDetail && body && body.replace(/<[^>]*>/g, "").trim() && (
        <p style={{ fontSize: ".82rem", color: "#5A5F7A", lineHeight: 1.7, marginTop: 10, marginBottom: 0 }}>
          {body.replace(/<[^>]*>/g, "")}
        </p>
      )}
    </JCardShell>
  );
}
