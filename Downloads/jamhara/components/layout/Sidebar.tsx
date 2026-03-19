"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import type { Category } from "@/lib/supabase/types";

interface Props { categories: Category[]; }

// Category slug → SVG path (viewBox 0 0 20 20, fill="currentColor")
const CAT_ICONS: Record<string, string> = {
  philosophy:  "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z",
  religions:   "M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z",
  history:     "M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z",
  geography:   "M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z",
  politics:    "M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9H7a1 1 0 00-1 1v1.268l-1.994.855A1 1 0 003 13v3a1 1 0 001 1h12a1 1 0 001-1v-3a1 1 0 00-1.006-1l-2-.001V10a1 1 0 00-.617-.924l-.785-.336.799-.342a1 1 0 00-.788-1.838l-4 1.715A1 1 0 009 8.051V7h2a1 1 0 000-2H9V3.28l1.394-.6z",
  economics:   "M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z",
  business:    "M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z",
  law:         "M10 2a1 1 0 00-1 1v1.323l-3.954 1.582A1 1 0 004 6.82V13a1 1 0 00.553.894l4 2a1 1 0 00.894 0l4-2A1 1 0 0014 13V6.82a1 1 0 00-.537-.895L10 4.323V3a1 1 0 00-1-1z M4 6.82V13l4 2 4-2V6.82l-4-1.6-4 1.6z",
  ai:          "M13 7H7v6l3-3 3 3V7zM3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4z",
  computing:   "M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z",
  mathematics: "M7 3a1 1 0 000 2h6a1 1 0 000-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z",
  physics:     "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  space:       "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  chemistry:   "M9 3v.804A7.963 7.963 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V3a1 1 0 10-2 0z",
  biology:     "M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z",
  medicine:    "M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z",
  environment: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  sociology:   "M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z",
  psychology:  "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  linguistics: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z",
  literature:  "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  arts:        "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  design:      "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
  media:       "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
};

function Icon({ slug }: { slug: string }) {
  const d = CAT_ICONS[slug];
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0, opacity: .7 }}>
      {d ? <path d={d} /> : <circle cx="10" cy="10" r="4" />}
    </svg>
  );
}

// Special content-type links shown after الرئيسية / كل التصنيفات
const CONTENT_TYPE_LINKS = [
  {
    emoji: "🔥",
    labelAr: "الأكثر قراءة",
    labelEn: "Most Read",
    href: "/most-read",
    hrefEn: "/en/most-read",
    hot: true,
  },
  {
    emoji: "🎮",
    labelAr: "العاب واختبارات",
    labelEn: "Games & Quizzes",
    href: "/search?type=quiz",
    hrefEn: "/en/search?type=quiz",
    hot: false,
  },
  {
    emoji: "📊",
    labelAr: "مخططات",
    labelEn: "Charts",
    href: "/search?type=chart",
    hrefEn: "/en/search?type=chart",
    hot: false,
  },
  {
    emoji: "⚔️",
    labelAr: "مقارنات",
    labelEn: "Comparisons",
    href: "/search?type=comparison",
    hrefEn: "/en/search?type=comparison",
    hot: false,
  },
  {
    emoji: "✦",
    labelAr: "تفاعلي",
    labelEn: "Interactive",
    href: "/search?type=interactive",
    hrefEn: "/en/search?type=interactive",
    hot: false,
  },
];

export default function Sidebar({ categories }: Props) {
  const locale = useLocale();
  const pathname = usePathname();

  const main = categories
    .filter((c) => !c.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order);

  const isHome = pathname === "/" || pathname === "/en";
  function catHref(slug: string) { return locale === "en" ? `/en/${slug}` : `/${slug}`; }
  function isActive(slug: string) { return pathname.endsWith(`/${slug}`); }

  function isContentTypeActive(href: string, hrefEn: string) {
    const target = locale === "en" ? hrefEn : href;
    return pathname + (typeof window !== "undefined" ? window.location.search : "") === target;
  }

  return (
    <aside className="sidebar">

      {/* ── تصفح ── */}
      <div className="nav-section">{locale === "ar" ? "تصفح" : "Browse"}</div>

      {/* الرئيسية */}
      <Link
        href={locale === "en" ? "/en" : "/"}
        className={`nav-item ${isHome ? "active" : ""}`}
        style={{ fontSize: ".82rem" }}
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0, opacity: .7 }}>
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h3a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h3a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        {locale === "ar" ? "الرئيسية" : "Home"}
      </Link>

      {/* كل التصنيفات */}
      <Link
        href={locale === "en" ? "/en/sections" : "/sections"}
        className={`nav-item ${pathname.endsWith("/sections") ? "active" : ""}`}
        style={{ fontSize: ".82rem" }}
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0, opacity: .7 }}>
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        {locale === "ar" ? "كل التصنيفات" : "All Sections"}
      </Link>

      {/* 5 special content-type links */}
      {CONTENT_TYPE_LINKS.map((item) => {
        const href = locale === "en" ? item.hrefEn : item.href;
        const isActivePath = pathname === (locale === "en" ? item.hrefEn : item.href);
        return (
          <Link
            key={item.href}
            href={href}
            className={`nav-item ${isActivePath ? "active" : ""}`}
            style={{ fontSize: ".82rem" }}
          >
            <span style={{ fontSize: "1rem", lineHeight: 1, flexShrink: 0 }}>{item.emoji}</span>
            <span style={{ flex: 1 }}>{locale === "ar" ? item.labelAr : item.labelEn}</span>
            {item.hot && (
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#E8534A", flexShrink: 0,
                boxShadow: "0 0 0 2px rgba(232,83,74,.18)",
                display: "inline-block",
              }} />
            )}
          </Link>
        );
      })}

      <div className="nav-divider" style={{ margin: "8px 10px" }} />

      {/* ── التصنيفات ── */}
      <div className="nav-section">{locale === "ar" ? "التصنيفات" : "Categories"}</div>
      {main.map((cat) => (
        <Link
          key={cat.id}
          href={catHref(cat.slug)}
          className={`nav-item ${isActive(cat.slug) ? "active" : ""}`}
          style={{ fontSize: ".82rem" }}
        >
          <Icon slug={cat.slug} />
          {locale === "ar" ? cat.name_ar : cat.name_en}
          {cat.post_count > 0 && <span className="nav-count">{cat.post_count}</span>}
        </Link>
      ))}
    </aside>
  );
}
