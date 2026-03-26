"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Props {
  totalPosts: number;
  lastPublishedAt: string | null;
  locale: string;
}

function timeAgo(dateStr: string, isAr: boolean): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return isAr ? "الآن"        : "just now";
  if (mins < 60) return isAr ? `منذ ${mins} دقيقة` : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return isAr ? `منذ ${hrs} ساعة`   : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return isAr ? `منذ ${days} يوم` : `${days}d ago`;
}

const TEMPLATES_COUNT = 43;

export default function HomeHero({ totalPosts, lastPublishedAt, locale }: Props) {
  const router   = useRouter();
  const isAr     = locale === "ar";
  const [refreshing, setRefreshing] = useState(false);
  const [timeStr,    setTimeStr]    = useState(
    lastPublishedAt ? timeAgo(lastPublishedAt, isAr) : ""
  );

  /* مزامنة فورية عند تغيّر lastPublishedAt (router.refresh) */
  useEffect(() => {
    if (lastPublishedAt) setTimeStr(timeAgo(lastPublishedAt, isAr));
  }, [lastPublishedAt, isAr]);

  /* تحديث "منذ X" كل دقيقة */
  useEffect(() => {
    if (!lastPublishedAt) return;
    const iv = setInterval(() => setTimeStr(timeAgo(lastPublishedAt, isAr)), 60_000);
    return () => clearInterval(iv);
  }, [lastPublishedAt, isAr]);

  function handleRefresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 1200);
  }

  const philoHref = isAr ? "/our-dna" : "/en/our-dna";

  return (
    <div className="home-hero">

      {/* خلفية مزخرفة */}
      <div className="home-hero-bg" aria-hidden />

      {/* نقطة وهج زخرفية */}
      <div className="home-hero-glow" aria-hidden />

      <div className="home-hero-inner">

        {/* ── شريط علوي ──────────────────────────── */}
        <div className="home-hero-toprow">
          <div className="home-hero-live" aria-label="بث مباشر">
            <span className="live-dot" />
            <span className="home-hero-live-text">
              {timeStr
                ? (isAr ? `آخر تحديث ${timeStr}` : `Updated ${timeStr}`)
                : (isAr ? "مباشر" : "Live")}
            </span>
          </div>


          <button
            className={`home-hero-refresh${refreshing ? " spinning" : ""}`}
            onClick={handleRefresh}
            title={isAr ? "تحديث الصفحة" : "Refresh"}
            aria-label={isAr ? "تحديث" : "Refresh"}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6"/>
              <path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
          </button>
        </div>

        {/* ── العنوان ─────────────────────────────── */}
        <h1 className="home-hero-title" style={{ fontFamily: "var(--font-rubik)" }}>
          {isAr ? "سلام أيها الجمهريون" : "Welcome to Jamhara"}
        </h1>
        <p className="home-hero-sub">
          {isAr
            ? "نسخّر قوة الذكاء الاصطناعي لنقدم لكم وجبات معرفية مذهلة"
            : "We harness AI to deliver amazing knowledge experiences"}
        </p>

        {/* ── الإحصائيات ──────────────────────────── */}
        <div className="home-hero-stats">

          {/* عدد المنشورات */}
          <div className="home-hero-stat-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,.5)" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span className="home-hero-stat-num">
              {totalPosts.toLocaleString("en")}
            </span>
            <span className="home-hero-stat-label">
              {isAr ? "منشور" : "posts"}
            </span>
          </div>

          {/* عدد القوالب */}
          <div className="home-hero-stat-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,.5)" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span className="home-hero-stat-num">{TEMPLATES_COUNT}</span>
            <span className="home-hero-stat-label">
              {isAr ? "قالب محتوى" : "templates"}
            </span>
          </div>

          {/* فلسفتنا / Our DNA */}
          <Link href={philoHref} className="home-hero-dna-btn">
            {/* أيقونة DNA */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 15c6.667-6 13.333 0 20-6"/>
              <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/>
              <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/>
              <path d="m17 6-2.5-2.5"/>
              <path d="m14 8-1-1"/>
              <path d="m7 18 2.5 2.5"/>
              <path d="m3.5 14.5.5.5"/>
              <path d="m20 9 .5.5"/>
              <path d="m6.5 12.5 1 1"/>
            </svg>
            <span className="home-hero-dna-label">
              {isAr ? "فلسفتنا" : "Our DNA"}
            </span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ opacity: .6 }}>
              {isAr
                ? <polyline points="15 18 9 12 15 6"/>
                : <polyline points="9 18 15 12 9 6"/>}
            </svg>
          </Link>

        </div>
      </div>
    </div>
  );
}
