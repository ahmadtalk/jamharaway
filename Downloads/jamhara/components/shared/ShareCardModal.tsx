"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { toPng } from "html-to-image";
import ShareCard, { CARD_DIMS, type ShareCardSize } from "./ShareCard";
import { buildShareCardData } from "@/lib/share-card-data";
import type { PostWithRelations } from "@/lib/supabase/types";

interface Props {
  post:    PostWithRelations;
  locale:  "ar" | "en";
  onClose: () => void;
}

const SIZES: { id: ShareCardSize; label: string; icon: string; dim: string }[] = [
  { id: "square",    label: "مربع",   icon: "⬜", dim: "1080×1080" },
  { id: "landscape", label: "أفقي",   icon: "🖥",  dim: "1200×628"  },
  { id: "story",     label: "ستوري",  icon: "📱", dim: "1080×1920" },
];

const PREVIEW_W = 380;

/** يُحوّل رابطاً لـ base64 data URL (يحل مشاكل CORS وRelative paths مع html-to-image) */
async function toDataUrl(src: string): Promise<string | null> {
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const buf  = await res.arrayBuffer();
    const mime = res.headers.get("Content-Type") ?? "image/png";
    const bytes = new Uint8Array(buf);
    let bin = "";
    const chunk = 8192;
    for (let i = 0; i < bytes.length; i += chunk)
      bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
    return `data:${mime};base64,${btoa(bin)}`;
  } catch { return null; }
}

export default function ShareCardModal({ post, locale, onClose }: Props) {
  const shareCardData = buildShareCardData(post, locale);
  const imageUrl = shareCardData.imageUrl ?? null;

  const [size, setSize]       = useState<ShareCardSize>("square");
  const [loading, setLoading] = useState(false);
  const [imgSrc, setImgSrc]   = useState<string | null>(null);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const cardRef               = useRef<HTMLDivElement>(null);

  // locale مُمرَّر للبطاقة لتحديد اتجاه الهيدر

  // تحميل الشعار كـ base64 عند فتح المودال
  useEffect(() => {
    toDataUrl("/logo.png").then(setLogoSrc);
  }, []);

  // تحميل صورة المنشور عبر الـ proxy لضمان عدم مشاكل CORS
  useEffect(() => {
    if (!imageUrl) { setImgSrc(null); return; }
    const proxy = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    const img = new Image();
    img.onload  = () => setImgSrc(proxy);
    img.onerror = () => setImgSrc(null);
    img.src = proxy;
  }, [imageUrl]);

  const [cardW, cardH] = CARD_DIMS[size];
  const scale    = PREVIEW_W / cardW;
  const previewH = Math.round(cardH * scale);

  // ── بناء fontEmbedCSS يدوياً ────────────────────────────────────────────────
  async function buildFontEmbedCSS(): Promise<string> {
    const TARGET_FAMILIES  = ["Cairo", "IBM Plex Sans Arabic", "Rubik"];
    const NEEDED_WEIGHTS   = new Set(["300", "400", "500", "600", "700", "800", "900"]);
    const seen = new Set<string>();
    const rules: string[]  = [];

    for (const sheet of Array.from(document.styleSheets)) {
      let cssRules: CSSRuleList | null = null;
      try { cssRules = sheet.cssRules; } catch { continue; }
      if (!cssRules) continue;

      for (const rule of Array.from(cssRules)) {
        if (!(rule instanceof CSSFontFaceRule)) continue;
        try {
          const st = rule.style;
          if (!st) continue;

          const family = (st.getPropertyValue("font-family") ?? "")
            .replace(/['"]/g, "").trim();
          if (!TARGET_FAMILIES.some(f => family.includes(f))) continue;

          const weight = (st.getPropertyValue("font-weight") ?? "400").trim();
          if (!NEEDED_WEIGHTS.has(weight)) continue;

          const src    = st.getPropertyValue("src") ?? "";
          const fStyle = (st.getPropertyValue("font-style") ?? "normal").trim();

          const match = src.match(/url\(["']?((?:\/_next\/static\/media\/|\/)[^"')]*\.woff2[^"')']*)["']?\)/);
          const url   = match?.[1]?.trim();
          if (!url) continue;

          const key = `${family}|${weight}|${fStyle}`;
          if (seen.has(key)) continue;
          seen.add(key);

          const res = await fetch(url);
          if (!res.ok) continue;
          const buf    = await res.arrayBuffer();
          const bytes  = new Uint8Array(buf);
          let bin = "";
          const chunkSize = 8192;
          for (let i = 0; i < bytes.length; i += chunkSize) {
            bin += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
          }
          const b64 = btoa(bin);

          rules.push(
            `@font-face{font-family:'${family}';font-weight:${weight};font-style:${fStyle};` +
            `src:url('data:font/woff2;base64,${b64}') format('woff2');}`
          );
        } catch { /* تجاهل هذه القاعدة */ }
      }
    }
    return rules.join("\n");
  }

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || loading) return;
    setLoading(true);
    try {
      const filename = `jamhara-${size}-${Date.now()}.png`;
      const fontEmbedCSS = await buildFontEmbedCSS();
      const png = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true,
        fontEmbedCSS: fontEmbedCSS || undefined,
      });
      const link = document.createElement("a");
      link.download = filename;
      link.href = png;
      link.click();
    } catch (e) {
      console.error("Share card capture failed:", e);
      alert("فشل توليد الصورة — حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, loading]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9998,
          background: "rgba(0,0,0,.65)", backdropFilter: "blur(3px)",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", zIndex: 9999,
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: PREVIEW_W + 48,
        maxHeight: "90vh",
        overflowY: "auto",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 20px 60px rgba(0,0,0,.3)",
        padding: 24,
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 800, fontSize: "1rem", color: "#1E2130" }}>
            📸 مشاركة كصورة
          </span>
          <button
            onClick={onClose}
            style={{
              border: "none", background: "#EDF1F5", borderRadius: 8,
              width: 32, height: 32, cursor: "pointer",
              fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
              color: "#6B7280",
            }}
          >×</button>
        </div>

        {/* Size selector */}
        <div style={{ display: "flex", gap: 8 }}>
          {SIZES.map(s => (
            <button
              key={s.id}
              onClick={() => setSize(s.id)}
              style={{
                flex: 1, border: size === s.id ? "2px solid #4CB36C" : "1px solid #DBE3EA",
                borderRadius: 10, padding: "8px 4px",
                background: size === s.id ? "#F2FAF5" : "#fff",
                cursor: "pointer", display: "flex", flexDirection: "column",
                alignItems: "center", gap: 3,
              }}
            >
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <span style={{
                fontSize: ".72rem", fontWeight: 700,
                color: size === s.id ? "#2D7A46" : "#6B7280",
              }}>{s.label}</span>
              <span style={{ fontSize: ".65rem", color: "#9CA3AF" }}>{s.dim}</span>
            </button>
          ))}
        </div>

        {/* Preview */}
        <div style={{
          width: PREVIEW_W, height: previewH,
          overflow: "hidden", borderRadius: 10,
          boxShadow: "0 2px 16px rgba(0,0,0,.12)",
          flexShrink: 0,
          overflowY: size === "story" ? "auto" : "hidden",
        }}>
          <div style={{
            transform: `scale(${scale})`,
            transformOrigin: locale === "ar" ? "top right" : "top left",
            width: cardW, height: cardH,
          }}>
            <ShareCard
              ref={cardRef}
              data={shareCardData}
              size={size}
              imgSrc={imgSrc}
              logoSrc={logoSrc}
              locale={locale}
            />
          </div>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={loading}
          style={{
            background: loading ? "#9CA3AF" : "#4CB36C",
            color: "#fff", border: "none", borderRadius: 10,
            padding: "12px 0", cursor: loading ? "not-allowed" : "pointer",
            fontSize: ".95rem", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "background .15s",
          }}
        >
          {loading ? (
            <>⏳ جاري التوليد...</>
          ) : (
            <>⬇️ تحميل PNG ({CARD_DIMS[size][0] * 2}×{CARD_DIMS[size][1] * 2})</>
          )}
        </button>

        <p style={{ margin: 0, fontSize: ".72rem", color: "#9CA3AF", textAlign: "center" }}>
          الصورة تُحفظ مباشرة على جهازك
        </p>
      </div>
    </>
  );
}
