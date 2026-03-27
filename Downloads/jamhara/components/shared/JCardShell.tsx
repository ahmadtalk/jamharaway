"use client";

import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";
import { fmt, getSessionId, postUrl } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useIsEmbed } from "@/components/embed/EmbedProvider";
import { tagHref } from "@/lib/tags";

/* ── Type config ─────────────────────────────────────────────────────────── */
export const TYPE_CONFIG: Record<string, { color: string; label_ar: string; label_en: string }> = {
  article:    { color: "#4CB36C", label_ar: "مقال",        label_en: "Article" },
  chart:      { color: "#2196F3", label_ar: "مخطط",        label_en: "Chart" },
  quiz:       { color: "#7B5EA7", label_ar: "اختبار",      label_en: "Quiz" },
  comparison: { color: "#E05A2B", label_ar: "مقارنة",      label_en: "Comparison" },
  ranking:    { color: "#D97706", label_ar: "ترتيب",       label_en: "Ranking" },
  numbers:    { color: "#4338CA", label_ar: "بالأرقام",    label_en: "By Numbers" },
  scenarios:  { color: "#0891B2", label_ar: "سيناريوهات", label_en: "Scenarios" },
  timeline:   { color: "#0D9488", label_ar: "خط زمني",    label_en: "Timeline" },
  factcheck:  { color: "#DC2626", label_ar: "تحقق",        label_en: "Fact Check" },
  briefing:   { color: "#1D4ED8", label_ar: "موجز",        label_en: "Briefing" },
  quotes:     { color: "#7C3AED", label_ar: "اقتباسات",   label_en: "Quotes" },
  explainer:  { color: "#B45309", label_ar: "أسئلة شارحة", label_en: "Explainer" },
  debate:     { color: "#059669", label_ar: "مناظرة",      label_en: "Debate" },
  news:       { color: "#E05A2B", label_ar: "خبر",         label_en: "News" },
};

/* ── fireBurst ───────────────────────────────────────────────────────────── */
const BURST_PALETTE = ["#E05A2B", "#FF8C5A", "#FFB347", "#FF6B6B", "#4CB36C"];

function fireBurst(el: HTMLElement) {
  for (let i = 0; i < 7; i++) {
    const p = document.createElement("span");
    const size = 4 + Math.random() * 5;
    const dist = 22 + Math.random() * 12;
    const rad  = (i / 7) * 360 * Math.PI / 180;
    const x = Math.cos(rad) * dist, y = Math.sin(rad) * dist;
    p.style.cssText = `position:absolute;width:${size}px;height:${size}px;border-radius:50%;
      background:${BURST_PALETTE[Math.floor(Math.random() * BURST_PALETTE.length)]};
      pointer-events:none;left:50%;top:50%;transform:translate(-50%,-50%);z-index:10;`;
    el.appendChild(p);
    const anim = p.animate(
      [{ transform: "translate(-50%,-50%)", opacity: "1" },
       { transform: `translate(calc(-50% + ${x}px),calc(-50% + ${y}px))`, opacity: "0" }],
      { duration: 520, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" }
    );
    anim.onfinish = () => p.remove();
  }
}

/* ── showToast ───────────────────────────────────────────────────────────── */
function showToast(msg: string) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 2200);
}

/* ── Props ───────────────────────────────────────────────────────────────── */
export interface JCardShellProps {
  postId: string;
  postType: string;
  typeLabel_ar?: string;   // override type label (e.g. quiz subtype)
  typeLabel_en?: string;
  title: string;
  locale: "ar" | "en";
  timeAgoStr: string;
  isDetail?: boolean;
  index?: number;
  parentCat?: { name_ar: string; name_en: string; slug: string; color?: string };
  subCat?: { name_ar: string; name_en: string; slug: string };
  sourceUrl?: string;   // legacy — single source URL
  sourceName?: string;  // legacy — single source name
  sources?: { name: string; url: string }[];  // preferred — array of real sources
  tags?: string[];      // SEO tags — clickable chips
  likeCount: number;
  children: React.ReactNode;
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function JCardShell({
  postId, postType, typeLabel_ar, typeLabel_en,
  title, locale, timeAgoStr, isDetail = false, index = 0,
  parentCat, subCat, sourceUrl, sourceName, sources, tags, likeCount, children,
}: JCardShellProps) {
  const isAr = locale === "ar";
  const isEmbed = useIsEmbed();
  const cfg = TYPE_CONFIG[postType] ?? TYPE_CONFIG.article;
  const typeColor = cfg.color;
  const typeLabelDisplay = isAr
    ? (typeLabel_ar ?? cfg.label_ar)
    : (typeLabel_en ?? cfg.label_en);

  const href = postUrl(postId, locale);
  const catHref = (slug: string) => locale === "en" ? `/en/${slug}` : `/${slug}`;

  /* Like state */
  const [likes, setLikes] = useState(likeCount);
  const [liked, setLiked] = useState(false);
  const likeRef = useRef<HTMLButtonElement>(null);

  /* Share menu */
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  /* Verify / Flag modal */
  const [verifyOpen,    setVerifyOpen]    = useState(false);
  const [verifyReason,  setVerifyReason]  = useState("");
  const [verifyName,    setVerifyName]    = useState("");
  const [verifyNote,    setVerifyNote]    = useState("");
  const [verifyBusy,    setVerifyBusy]    = useState(false);
  const [verifyDone,    setVerifyDone]    = useState(false);

  const FLAG_REASONS = isAr ? [
    "معلومات غير دقيقة أو خاطئة",
    "مصدر غير موثوق أو مفقود",
    "محتوى مضلل أو منحاز",
    "معلومات قديمة أو منتهية الصلاحية",
    "خطأ في الأرقام أو الإحصاءات",
    "أخرى",
  ] : [
    "Inaccurate or false information",
    "Unreliable or missing source",
    "Misleading or biased content",
    "Outdated information",
    "Error in numbers or statistics",
    "Other",
  ];

  async function handleVerifySubmit() {
    if (!verifyReason || verifyBusy) return;
    setVerifyBusy(true);
    try {
      await fetch("/api/flag-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, reason: verifyReason, name: verifyName, note: verifyNote }),
      });
      setVerifyDone(true);
    } finally {
      setVerifyBusy(false);
    }
  }

  function closeVerify() {
    setVerifyOpen(false);
    setTimeout(() => { setVerifyDone(false); setVerifyReason(""); setVerifyName(""); setVerifyNote(""); }, 300);
  }

  /* Sources menu */
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const sourcesRef = useRef<HTMLDivElement>(null);

  // Normalise: prefer sources[] array, fall back to legacy sourceUrl
  const resolvedSources: { name: string; url: string }[] =
    sources && sources.length > 0
      ? sources
      : sourceUrl
        ? [{ name: sourceName || (locale === "ar" ? "المصدر" : "Source"), url: sourceUrl }]
        : [];

  /* Close share menu on outside click */
  useEffect(() => {
    if (!shareOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [shareOpen]);

  /* Close sources menu on outside click */
  useEffect(() => {
    if (!sourcesOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (sourcesRef.current && !sourcesRef.current.contains(e.target as Node)) {
        setSourcesOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [sourcesOpen]);

  const handleLike = useCallback(async () => {
    // تحديث낙optimistic فوري
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikes(n => wasLiked ? Math.max(0, n - 1) : n + 1);
    if (!wasLiked && likeRef.current) fireBurst(likeRef.current);
    try {
      const sb  = createClient();
      const sid = getSessionId();
      // RPC atomic — increment/decrement في DB مباشرةً بدون race condition
      const { data, error } = await sb.rpc("increment_post_like", {
        p_post_id: postId,
        p_session_id: sid,
      });
      if (error) throw error;
      // مزامنة العداد مع القيمة الحقيقية من DB
      if (data?.count !== undefined) setLikes(data.count);
      setLiked(data?.liked ?? !wasLiked);
    } catch {
      // rollback عند الخطأ
      setLiked(wasLiked);
      setLikes(n => wasLiked ? n + 1 : Math.max(0, n - 1));
    }
  }, [liked, postId]);

  async function copyToClipboard(text: string, msg: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.cssText = "position:fixed;opacity:0;pointer-events:none;";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    showToast(msg);
    setShareOpen(false);
  }

  const fullUrl = typeof window !== "undefined"
    ? `${window.location.origin}${href}`
    : `https://jamhara.vercel.app${href}`;

  // postMessage auto-height: embed.js on the host page listens and resizes
  const embedCode = `<iframe src="https://jamhara.vercel.app/embed/${postId}" width="100%" height="600" frameborder="0" style="border:none;border-radius:14px;display:block;" loading="lazy"></iframe>\n<script src="https://jamhara.vercel.app/embed.js" async><\/script>`;

  const shareOptions = [
    {
      label: isAr ? "نسخ الرابط" : "Copy link",
      icon: "🔗",
      bg: "#F4F5F8",
      onClick: () => copyToClipboard(fullUrl, isAr ? "تم نسخ الرابط" : "Link copied"),
    },
    {
      label: isAr ? "تضمين في موقعك" : "Embed",
      icon: "⌗",
      bg: "#F4F5F8",
      onClick: () => copyToClipboard(embedCode, isAr ? "تم نسخ كود التضمين" : "Embed code copied"),
    },
  ];
  const socialOptions = [
    { label: "X (Twitter)", icon: "𝕏", bg: "#000", color: "#fff", href: `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}` },
    { label: "واتساب",      icon: "💬", bg: "#25D366", color: "#fff", href: `https://wa.me/?text=${encodeURIComponent(title + " " + fullUrl)}` },
    { label: "تيليغرام",   icon: "✈️", bg: "#0088CC", color: "#fff", href: `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}` },
    { label: "لينكد إن",   icon: "in", bg: "#0077B5", color: "#fff", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}` },
  ];

  return (
    <article
      className="jcard"
      style={{ animationDelay: index ? `${index * 0.07}s` : undefined }}
    >
      {/* Stripe */}
      <div className="jcard-stripe" style={{ background: typeColor }} />

      {/* Header */}
      {isEmbed ? (
        /* Embed mode: jamhara branding only */
        <div className="jcard-head">
          <a
            href="https://jamhara.vercel.app"
            style={{ display: "flex", alignItems: "center", gap: 5, textDecoration: "none" }}
          >
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#4CB36C"/>
              <path d="M9 22V12l7 5 7-5v10" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: ".8rem", fontWeight: 700, color: "#373C55", fontFamily: "var(--font-cairo),sans-serif" }}>
              جمهرة
            </span>
          </a>
        </div>
      ) : (
        /* Normal mode: category breadcrumb + type badge + time */
        <div className="jcard-head">
          {parentCat && (
            <Link
              href={catHref(parentCat.slug)}
              className="jcard-cat-parent"
              style={{ color: parentCat.color ?? typeColor }}
            >
              <span className="jcard-cat-dot" style={{ background: parentCat.color ?? typeColor }} />
              {isAr ? parentCat.name_ar : parentCat.name_en}
            </Link>
          )}

          {parentCat && <span className="jcard-sep">›</span>}

          <span
            className="jcard-type-badge"
            style={{ background: typeColor + "15", color: typeColor }}
          >
            {typeLabelDisplay}
          </span>

          <span className="jcard-time">{timeAgoStr}</span>
        </div>
      )}

      {/* Title */}
      {isDetail || isEmbed ? (
        <h1 className="jcard-title-h1">{title}</h1>
      ) : (
        <Link href={href} className="jcard-title-link">{title}</Link>
      )}

      {/* Content zone */}
      <div className="jcard-content">
        {children}
      </div>

      {/* Actions */}
      {isEmbed ? (
        /* Embed mode: single CTA button */
        <div className="jcard-actions" style={{ justifyContent: "center" }}>
          <a
            href={`https://jamhara.vercel.app${href}`}
            className="jcard-btn"
            style={{ color: typeColor, fontWeight: 700, flex: "none" }}
          >
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            {isAr ? "اقرأ على جمهرة ←" : "Read on Jamhara →"}
          </a>
        </div>
      ) : (
      <div className="jcard-actions">
        {/* Like */}
        <button
          ref={likeRef}
          className={`jcard-btn jcard-btn-like${liked ? " liked" : ""}`}
          onClick={handleLike}
          aria-label={isAr ? "أعجبني" : "Like"}
          style={liked ? { color: typeColor } : undefined}
        >
          <svg width="15" height="15" viewBox="0 0 20 20"
            fill={liked ? typeColor : "none"}
            stroke={liked ? typeColor : "currentColor"}
            strokeWidth="1.8">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
          </svg>
          {isAr ? "أعجبني" : "Like"}
          {likes > 0 && <span style={{ fontVariantNumeric: "lining-nums" }}>{fmt(likes)}</span>}
        </button>

        <div className="jcard-btn-sep" />

        {/* Share */}
        <div className="jcard-share-wrap" ref={shareRef}>
          <button
            className="jcard-btn"
            onClick={() => setShareOpen(o => !o)}
            aria-label={isAr ? "شارك" : "Share"}
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47A3 3 0 1015 12" />
            </svg>
            {isAr ? "شارك" : "Share"}
          </button>

          {shareOpen && (
            <div className="jcard-share-menu">
              {shareOptions.map(opt => (
                <button key={opt.label} className="jcard-share-item" onClick={opt.onClick}>
                  <span className="jcard-share-icon" style={{ background: opt.bg, fontSize: "1rem" }}>
                    {opt.icon}
                  </span>
                  {opt.label}
                </button>
              ))}
              <div className="jcard-share-divider" />
              {socialOptions.map(opt => (
                <a
                  key={opt.label}
                  className="jcard-share-item"
                  href={opt.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShareOpen(false)}
                >
                  <span
                    className="jcard-share-icon"
                    style={{ background: opt.bg, color: opt.color, fontWeight: 900, fontSize: ".8rem" }}
                  >
                    {opt.icon}
                  </span>
                  {opt.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="jcard-btn-sep" />

        {/* Source — single: direct link | multiple: dropdown | none: disabled */}
        {resolvedSources.length === 0 ? (
          <span className="jcard-btn" style={{ opacity: .35, cursor: "default" }}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            {isAr ? "المصدر" : "Source"}
          </span>
        ) : resolvedSources.length === 1 ? (
          <a href={resolvedSources[0].url} target="_blank" rel="noopener noreferrer"
            className="jcard-btn" title={resolvedSources[0].name}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            {isAr ? "المصدر" : "Source"}
          </a>
        ) : (
          /* Multiple sources — dropdown */
          <div className="jcard-share-wrap" ref={sourcesRef} style={{ position: "relative" }}>
            <button className="jcard-btn" onClick={() => setSourcesOpen(o => !o)}
              aria-label={isAr ? "المصادر" : "Sources"}>
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              {isAr ? `المصادر (${resolvedSources.length})` : `Sources (${resolvedSources.length})`}
              <svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="5 8 10 13 15 8"/>
              </svg>
            </button>
            {sourcesOpen && (
              <div className="jcard-share-menu">
                {resolvedSources.map((src, i) => (
                  <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                    className="jcard-share-item" onClick={() => setSourcesOpen(false)}>
                    <span className="jcard-share-icon" style={{ background: "#F0F4FF", fontSize: ".75rem", color: "#3B6CC4", fontWeight: 700 }}>
                      {i + 1}
                    </span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>
                      {src.name}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="jcard-btn-sep" />

        {/* Verify / Flag */}
        <button
          className="jcard-btn jcard-btn-verify"
          onClick={() => setVerifyOpen(true)}
          aria-label={isAr ? "دقق" : "Verify"}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M9 12l2 2 4-4"/>
            <path d="M10 2L3 7v6c0 5.25 4.17 7.5 7 8 2.83-.5 7-2.75 7-8V7l-7-5z"/>
          </svg>
          {isAr ? "دقق" : "Verify"}
        </button>
      </div>
      )} {/* end isEmbed ternary */}

      {/* ── Tags ─────────────────────────────────────────────────────── */}
      {tags && tags.length > 0 && !isEmbed && (
        <div className="jcard-tags">
          {tags.map(tag => (
            <Link key={tag} href={tagHref(tag, locale)} className="jcard-tag">
              {tag}
            </Link>
          ))}
        </div>
      )}

      {/* ── Verify / Flag modal ──────────────────────────────────────── */}
      {verifyOpen && (
        <div className="jflag-overlay" onClick={closeVerify}>
          <div className="jflag-modal" dir={isAr ? "rtl" : "ltr"} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="jflag-header">
              <div>
                <p className="jflag-title">{isAr ? "أبلغ عن مشكلة" : "Report an issue"}</p>
                <p className="jflag-sub">{isAr ? "ساعدنا في تحسين دقة المحتوى" : "Help us improve content accuracy"}</p>
              </div>
              <button className="jflag-close" onClick={closeVerify}>✕</button>
            </div>

            {verifyDone ? (
              /* ── Done state ── */
              <div className="jflag-done">
                <span className="jflag-done-icon">✓</span>
                <p className="jflag-done-title">{isAr ? "شكراً على ملاحظتك!" : "Thank you for your feedback!"}</p>
                <p className="jflag-done-body">{isAr ? "سيراجع فريقنا تقريرك ويتحقق من المعلومات." : "Our team will review your report and verify the information."}</p>
                <button className="jflag-btn-primary" onClick={closeVerify}>
                  {isAr ? "إغلاق" : "Close"}
                </button>
              </div>
            ) : (
              /* ── Form ── */
              <>
                {/* Reasons */}
                <p className="jflag-label">{isAr ? "سبب الإبلاغ" : "Reason for reporting"} <span style={{ color: "#E05A2B" }}>*</span></p>
                <div className="jflag-reasons">
                  {FLAG_REASONS.map(r => (
                    <label key={r} className={`jflag-reason${verifyReason === r ? " selected" : ""}`}>
                      <input
                        type="radio"
                        name="jflag-reason"
                        value={r}
                        checked={verifyReason === r}
                        onChange={() => setVerifyReason(r)}
                        style={{ display: "none" }}
                      />
                      {r}
                    </label>
                  ))}
                </div>

                {/* Name */}
                <p className="jflag-label" style={{ marginTop: 16 }}>{isAr ? "اسمك" : "Your name"} <span style={{ color: "#9BA0B8", fontSize: ".75rem" }}>({isAr ? "اختياري" : "optional"})</span></p>
                <input
                  className="jflag-input"
                  type="text"
                  placeholder={isAr ? "أدخل اسمك..." : "Enter your name..."}
                  value={verifyName}
                  onChange={e => setVerifyName(e.target.value)}
                  maxLength={80}
                />

                {/* Note */}
                <p className="jflag-label" style={{ marginTop: 12 }}>{isAr ? "ملاحظة إضافية" : "Additional note"} <span style={{ color: "#9BA0B8", fontSize: ".75rem" }}>({isAr ? "اختياري" : "optional"})</span></p>
                <textarea
                  className="jflag-textarea"
                  placeholder={isAr ? "أضف تفاصيل إضافية هنا..." : "Add more details here..."}
                  value={verifyNote}
                  onChange={e => setVerifyNote(e.target.value)}
                  maxLength={500}
                  rows={3}
                />

                {/* Footer */}
                <div className="jflag-footer">
                  <button className="jflag-btn-cancel" onClick={closeVerify}>{isAr ? "إلغاء" : "Cancel"}</button>
                  <button
                    className="jflag-btn-primary"
                    disabled={!verifyReason || verifyBusy}
                    onClick={handleVerifySubmit}
                  >
                    {verifyBusy ? (isAr ? "جارٍ الإرسال..." : "Sending...") : (isAr ? "إرسال التقرير" : "Submit report")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
