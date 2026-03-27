/**
 * PuppeteerShareButton — زر مشاركة احترافي عبر Puppeteer
 * ─────────────────────────────────────────────────────────
 * معزول تماماً عن ShareButton/ShareCardModal الحاليين
 * يستدعي /api/share-image ويُحمّل PNG عالي الجودة مباشرة
 */
"use client";

import { useState } from "react";

interface Props {
  postId: string;
  locale: "ar" | "en";
}

const SIZES = [
  { key: "square",    labelAr: "مربع",  labelEn: "Square",    icon: "⬛", dims: "1080×1080" },
  { key: "landscape", labelAr: "أفقي",  labelEn: "Landscape", icon: "▬",  dims: "1200×628"  },
  { key: "story",     labelAr: "ستوري", labelEn: "Story",     icon: "▮",  dims: "1080×1920" },
] as const;

type Size = typeof SIZES[number]["key"];

export default function PuppeteerShareButton({ postId, locale }: Props) {
  const isAr = locale === "ar";
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState<Size | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  async function download(size: Size) {
    if (loading) return;
    setLoading(size);
    setError(null);
    try {
      const url = `/api/share-image?id=${postId}&size=${size}&locale=${locale}`;
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href     = href;
      a.download = `jamhara-${size}.png`;
      a.click();
      URL.revokeObjectURL(href);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ غير معروف");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* الزر الرئيسي */}
      <button
        onClick={() => { setOpen(o => !o); setError(null); }}
        style={{
          display:     "flex",
          alignItems:  "center",
          gap:         6,
          padding:     "7px 14px",
          borderRadius: 20,
          border:      "1.5px solid #4CB36C",
          background:  open ? "#4CB36C" : "transparent",
          color:       open ? "#fff" : "#4CB36C",
          fontSize:    ".8rem",
          fontWeight:  700,
          cursor:      "pointer",
          transition:  "all .15s",
          fontFamily:  "var(--font-cairo, sans-serif)",
        }}
      >
        <span>🖼️</span>
        <span>{isAr ? "صورة احترافية" : "Pro image"}</span>
      </button>

      {/* قائمة الأحجام */}
      {open && (
        <div style={{
          position:   "absolute",
          top:        "calc(100% + 8px)",
          [isAr ? "right" : "left"]: 0,
          background: "#fff",
          border:     "1px solid #E8EBF0",
          borderRadius: 12,
          boxShadow:  "0 8px 24px rgba(0,0,0,.12)",
          padding:    "8px",
          zIndex:     200,
          minWidth:   200,
          display:    "flex",
          flexDirection: "column",
          gap:        4,
        }}>
          <div style={{
            fontSize: ".68rem", fontWeight: 700, color: "#6B7280",
            letterSpacing: ".06em", textTransform: "uppercase",
            padding: "2px 8px 6px",
          }}>
            {isAr ? "اختر الحجم" : "Choose size"}
          </div>

          {SIZES.map(s => (
            <button
              key={s.key}
              onClick={() => download(s.key)}
              disabled={!!loading}
              style={{
                display:       "flex",
                alignItems:    "center",
                justifyContent:"space-between",
                padding:       "9px 12px",
                borderRadius:  8,
                border:        "none",
                background:    loading === s.key ? "#F2FAF5" : "transparent",
                cursor:        loading ? "wait" : "pointer",
                textAlign:     isAr ? "right" : "left",
                width:         "100%",
                transition:    "background .12s",
                fontFamily:    "var(--font-cairo, sans-serif)",
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#F7F9FB"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = loading === s.key ? "#F2FAF5" : "transparent"; }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "1rem" }}>{s.icon}</span>
                <span style={{ fontSize: ".85rem", fontWeight: 600, color: "#1E2130" }}>
                  {isAr ? s.labelAr : s.labelEn}
                </span>
              </span>
              <span style={{ fontSize: ".72rem", color: "#6B7280" }}>
                {loading === s.key
                  ? (isAr ? "⏳ جارٍ التوليد..." : "⏳ Generating...")
                  : s.dims}
              </span>
            </button>
          ))}

          {error && (
            <div style={{
              margin: "4px 8px 2px",
              padding: "7px 10px",
              background: "#FEF2F2",
              borderRadius: 7,
              fontSize: ".75rem",
              color: "#DC2626",
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{
            margin: "4px 8px 2px",
            fontSize: ".68rem",
            color: "#9CA3AF",
            textAlign: "center",
          }}>
            {isAr ? "📸 دقة 2× — PNG عالي الجودة" : "📸 2× resolution — high quality PNG"}
          </div>
        </div>
      )}

      {/* إغلاق بالنقر خارج */}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 199 }}
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
