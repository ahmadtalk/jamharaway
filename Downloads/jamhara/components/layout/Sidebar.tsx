"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import type { Category } from "@/lib/supabase/types";

interface Props { categories: Category[]; }

/* ── أيقونة SVG stroke بمربع ملوّن ───────────────────────────────── */
function NavIcon({
  d, d2, color, bg, size = 15,
}: {
  d: string; d2?: string; color: string; bg: string; size?: number;
}) {
  return (
    <span style={{
      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
      background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg
        width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ display: "block" }}
      >
        <path d={d} />
        {d2 && <path d={d2} />}
      </svg>
    </span>
  );
}

/* ── روابط التنقل السريع ─────────────────────────────────────────── */
const QUICK_LINKS = [
  {
    d:      "M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2",
    d2:     "M12 6v6l4 2",
    color:  "#0891B2",
    bg:     "#E0F7FA",
    labelAr: "أحدث المنشورات",
    labelEn: "Latest Posts",
    href:    "/latest",
    hrefEn:  "/en/latest",
  },
  {
    d:      "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A8 8 0 0117.657 18.657z",
    d2:     "M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z",
    color:  "#E05A2B",
    bg:     "#FFF0EB",
    labelAr: "الأكثر قراءة",
    labelEn: "Most Read",
    href:    "/most-read",
    hrefEn:  "/en/most-read",
    hot:     true,
  },
];

/* ── أنواع المحتوى ───────────────────────────────────────────────── */
const TYPE_LINKS = [
  {
    d:      "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z",
    color:  "#3B6CC4", bg: "#EDF3FF",
    labelAr: "مقالات", labelEn: "Articles",
    typeSlug: "article",
  },
  {
    d:      "M18 20V10M12 20V4M6 20v-6",
    color:  "#2D7A46", bg: "#E8F6ED",
    labelAr: "مخططات", labelEn: "Charts",
    typeSlug: "chart",
  },
  {
    d:      "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color:  "#7C3AED", bg: "#F3EEFF",
    labelAr: "اختبارات", labelEn: "Quizzes",
    typeSlug: "quiz",
  },
  {
    d:      "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5",
    color:  "#C05E1A", bg: "#FFF3E8",
    labelAr: "مقارنات", labelEn: "Comparisons",
    typeSlug: "comparison",
  },
  {
    d:      "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
    color:  "#4338CA", bg: "#F0F4FF",
    labelAr: "بروفايل", labelEn: "Profiles",
    typeSlug: "profile",
  },
  {
    d:      "M3 12h18M3 6h18M3 18h18",
    d2:     "M7 3v18",
    color:  "#4338CA", bg: "#EEF0FF",
    labelAr: "بالأرقام", labelEn: "By Numbers",
    typeSlug: "numbers",
  },
];

export default function Sidebar({ categories }: Props) {
  const locale = useLocale();
  const pathname = usePathname();

  void categories; // المعامل محفوظ للاستخدام المستقبلي

  const isHome = pathname === "/" || pathname === "/en";

  return (
    <aside className="sidebar">

      {/* ── الرئيسية ── */}
      <Link
        href={locale === "en" ? "/en" : "/"}
        className={`nav-item ${isHome ? "active" : ""}`}
      >
        <NavIcon
          d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          d2="M9 22V12h6v10"
          color={isHome ? "#2D7A46" : "#6B7280"}
          bg={isHome ? "#E8F6ED" : "#F3F4F6"}
        />
        {locale === "ar" ? "الرئيسية" : "Home"}
      </Link>

      {/* ── تصفح — مخفي مؤقتاً مع QUICK_LINKS ── */}
      {false && <div className="nav-divider" style={{ margin: "6px 10px" }} />}
      {false && <div className="nav-section">{locale === "ar" ? "تصفح" : "Discover"}</div>}

      {/* QUICK_LINKS مخفية مؤقتاً — ستُفعَّل لاحقاً */}
      {false && QUICK_LINKS.map((item) => {
        const href = locale === "en" ? item.hrefEn : item.href;
        const active = pathname === href;
        return (
          <Link key={item.href} href={href} className={`nav-item ${active ? "active" : ""}`}>
            <NavIcon
              d={item.d} d2={item.d2}
              color={active ? "#2D7A46" : item.color}
              bg={active ? "#E8F6ED" : item.bg}
            />
            <span style={{ flex: 1 }}>{locale === "ar" ? item.labelAr : item.labelEn}</span>
            {item.hot && !active && (
              <span style={{
                fontSize: ".65rem", fontWeight: 700, color: "#E05A2B",
                background: "#FFF0EB", border: "1px solid #FECACA",
                padding: "1px 6px", borderRadius: 100,
              }}>
                {locale === "ar" ? "شائع" : "Hot"}
              </span>
            )}
          </Link>
        );
      })}

      <div className="nav-divider" style={{ margin: "6px 10px" }} />

      {/* ── أنواع المحتوى ── */}
      <div className="nav-section">{locale === "ar" ? "أنواع المحتوى" : "Content Types"}</div>

      {TYPE_LINKS.map((item) => {
        const href = locale === "en" ? `/en/type/${item.typeSlug}` : `/type/${item.typeSlug}`;
        const active = pathname === href;
        return (
          <Link key={item.typeSlug} href={href} className={`nav-item ${active ? "active" : ""}`} style={{ fontSize: ".83rem" }}>
            <NavIcon
              d={item.d} d2={item.d2}
              color={active ? "#2D7A46" : item.color}
              bg={active ? "#E8F6ED" : item.bg}
            />
            {locale === "ar" ? item.labelAr : item.labelEn}
          </Link>
        );
      })}

      {/* محتوى متقدم */}
      {(() => {
        const href = locale === "en" ? "/en/advanced" : "/advanced";
        const active = pathname === href;
        return (
          <Link href={href} className={`nav-item ${active ? "active" : ""}`} style={{ fontSize: ".83rem" }}>
            <NavIcon
              d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
              color={active ? "#2D7A46" : "#6366F1"}
              bg={active ? "#E8F6ED" : "#EEF2FF"}
            />
            {locale === "ar" ? "محتوى متقدم" : "Advanced"}
          </Link>
        );
      })()}

    </aside>
  );
}
