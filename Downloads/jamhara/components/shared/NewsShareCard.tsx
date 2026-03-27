/**
 * NewsShareCard — بطاقة مشاركة مخصصة لنوع الخبر
 * inline styles فقط لضمان الالتقاط الصحيح بـ html-to-image
 *
 * الهيكل:
 *   SQUARE   — صورة + مصدر + عنوان + لده + نقاط رئيسية + "ما سبب أهميته"
 *   LANDSCAPE — عمودان: صورة (يمين/يسار) + محتوى
 *   STORY     — هيرو صورة كبيرة + محتوى كامل + اقتباس + ما التالي
 */
"use client";

import { forwardRef } from "react";
import { CARD_DIMS, type ShareCardSize } from "./ShareCard";

const FONT = "'Cairo', 'IBM Plex Sans Arabic', Arial, sans-serif";

const C = {
  navy:   "#373C55",
  ink:    "#1E2130",
  muted:  "#6B7280",
  slate:  "#EDF1F5",
  white:  "#FFFFFF",
  green:  "#4CB36C",
  rust:   "#E05A2B",   // لون الخبر
};

export interface NewsShareData {
  title:          string;
  lede?:          string;
  sourceName?:    string;
  keyPoints:      string[];
  whyItMatters?:  string;
  whatsNext?:     string;
  quote?:         { text: string; author: string; role?: string };
  publishedAt?:   string;
}

interface Props {
  data:     NewsShareData;
  size:     ShareCardSize;
  logoSrc?: string | null;
  imgSrc?:  string | null;
  locale?:  "ar" | "en";
}

const NewsShareCard = forwardRef<HTMLDivElement, Props>(
  function NewsShareCard({ data, size, logoSrc, imgSrc, locale = "ar" }, ref) {
    const [w, h] = CARD_DIMS[size];
    const isL  = size === "landscape";
    const isS  = size === "story";
    const isAr = locale !== "en";

    // ── أحجام per format ──────────────────────────────────────
    const padH     = isL ? 48 : isS ? 80 : 60;
    const padV     = isL ? 26 : isS ? 52 : 44;
    const logoH    = isL ? 44 : isS ? 62 : 52;
    const sloganFS = isL ? 15 : isS ? 22 : 18;
    const ftSz     = isL ? 16 : isS ? 22 : 18;
    const titleFS  = isL ? 28 : isS ? 52 : 40;
    const ledeFS   = isL ? 17 : isS ? 29 : 22;
    const ptFS     = isL ? 15 : isS ? 26 : 20;
    const boxFS    = isL ? 14 : isS ? 25 : 19;
    const dotSz    = isL ? 10 : isS ? 16 : 13;
    const secGap   = isL ? 14 : isS ? 28 : 20;

    const maxPts = isL ? 3 : isS ? 5 : 4;
    const pts    = data.keyPoints.slice(0, maxPts);

    // ── Header ────────────────────────────────────────────────
    const LogoEl = () => logoSrc ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoSrc} alt="جمهرة"
        style={{ height: logoH, width: "auto", objectFit: "contain", display: "block" }} />
    ) : (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: logoH, height: logoH, background: C.green, borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: Math.round(logoH * 0.55), fontWeight: 900, color: C.white, fontFamily: FONT,
        }}>ج</div>
        <span style={{ fontSize: Math.round(logoH * 0.6), fontWeight: 800, color: C.white, fontFamily: FONT }}>
          جمهرة
        </span>
      </div>
    );

    const SloganEl = () => (
      <span style={{
        fontSize: sloganFS, fontWeight: 500,
        color: "rgba(255,255,255,.75)",
        fontFamily: FONT, letterSpacing: ".01em",
        fontStyle: "italic",
      }}>
        {isAr ? "قيمة المرء ما يعرفه" : "Knowledge is your true value"}
      </span>
    );

    const Header = () => (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: `${Math.round(padV * 0.65)}px ${padH}px`,
        background: C.navy, flexShrink: 0,
      }}>
        {isAr ? <><LogoEl /><SloganEl /></> : <><SloganEl /><LogoEl /></>}
      </div>
    );

    // ── Footer ────────────────────────────────────────────────
    const Footer = () => (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: `${Math.round(padV * 0.55)}px ${padH}px`,
        background: C.slate, flexShrink: 0,
        borderTop: `4px solid ${C.rust}`,
      }}>
        <span style={{ fontSize: ftSz, fontWeight: 800, color: C.rust, fontFamily: FONT, whiteSpace: "nowrap" }}>
          jamhara.com
        </span>
        <span style={{ fontSize: Math.round(ftSz * 0.82), fontWeight: 600, color: C.muted, fontFamily: FONT, fontStyle: "italic" }}>
          {isAr ? "الخبر كاملًا في موقع جمهرة" : "Full story on Jamhara"}
        </span>
      </div>
    );

    // ── العنوان — بلا تقطيع، يظهر كاملاً ─────────────────────
    const Title = () => (
      <h2 style={{
        margin: 0, fontSize: titleFS, fontWeight: 900,
        color: C.ink, lineHeight: 1.3, fontFamily: FONT,
      }}>
        {data.title}
      </h2>
    );

    // ── اللده ─────────────────────────────────────────────────
    const Lede = ({ lines }: { lines?: number }) => data.lede ? (
      <p style={{
        margin: 0, fontSize: ledeFS, lineHeight: 1.75,
        color: C.muted, fontFamily: FONT,
        ...(lines ? { maxHeight: ledeFS * 1.75 * lines, overflow: "hidden" } : {}),
      }}>
        {data.lede}
      </p>
    ) : null;

    // ── النقاط الرئيسية ───────────────────────────────────────
    const KeyPoints = () => pts.length > 0 ? (
      <div style={{ display: "flex", flexDirection: "column", gap: isS ? 14 : 10 }}>
        {pts.map((pt, i) => (
          <div key={i} style={{ display: "flex", gap: isS ? 14 : 10, alignItems: "flex-start" }}>
            <div style={{
              width: dotSz + 14, height: dotSz + 14, flexShrink: 0,
              background: C.rust, color: C.white, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: isS ? 14 : 11, fontWeight: 800, marginTop: 2, fontFamily: FONT,
            }}>{i + 1}</div>
            <span style={{ fontSize: ptFS, lineHeight: 1.65, color: C.ink, fontFamily: FONT }}>{pt}</span>
          </div>
        ))}
      </div>
    ) : null;

    // ── ما سبب أهميته ────────────────────────────────────────
    const WhyBox = () => data.whyItMatters ? (
      <div style={{
        background: `${C.green}12`, border: `1px solid ${C.green}35`,
        borderRadius: 10, padding: isS ? "16px 20px" : "10px 14px",
      }}>
        <p style={{
          margin: "0 0 5px", fontSize: isS ? 19 : 13, fontWeight: 700,
          color: C.green, fontFamily: FONT, letterSpacing: ".02em",
        }}>
          {isAr ? "⚡ ما سبب أهميته؟" : "⚡ Why it matters"}
        </p>
        <p style={{
          margin: 0, fontSize: boxFS, lineHeight: 1.65,
          color: C.ink, fontFamily: FONT,
        }}>
          {data.whyItMatters}
        </p>
      </div>
    ) : null;

    // ── اقتباس ────────────────────────────────────────────────
    const Quote = () => data.quote ? (
      <div style={{
        borderInlineStart: `4px solid ${C.rust}`,
        paddingInlineStart: isS ? 24 : 14,
        paddingTop: isS ? 8 : 4, paddingBottom: isS ? 8 : 4,
      }}>
        <p style={{
          margin: "0 0 6px", fontSize: isS ? 26 : 17,
          lineHeight: 1.65, color: C.ink, fontFamily: FONT,
          fontStyle: "italic",
        }}>
          &ldquo;{data.quote.text}&rdquo;
        </p>
        <p style={{
          margin: 0, fontSize: isS ? 20 : 13,
          color: C.rust, fontWeight: 700, fontFamily: FONT,
        }}>
          — {data.quote.author}{data.quote.role ? ` · ${data.quote.role}` : ""}
        </p>
      </div>
    ) : null;

    // ── ما التالي ─────────────────────────────────────────────
    const WhatsNext = () => data.whatsNext ? (
      <div style={{
        background: `${C.navy}0D`, border: `1px solid ${C.navy}20`,
        borderRadius: 10, padding: isS ? "14px 20px" : "8px 12px",
      }}>
        <p style={{
          margin: "0 0 5px", fontSize: isS ? 18 : 12, fontWeight: 700,
          color: C.navy, fontFamily: FONT, letterSpacing: ".02em",
        }}>
          {isAr ? "🔮 ما التالي؟" : "🔮 What's next"}
        </p>
        <p style={{
          margin: 0, fontSize: isS ? 22 : 14, lineHeight: 1.65,
          color: C.ink, fontFamily: FONT,
        }}>
          {data.whatsNext}
        </p>
      </div>
    ) : null;

    // ═══════════════════════════════════════════════════════
    // LANDSCAPE
    // ═══════════════════════════════════════════════════════
    if (isL) {
      const imgW = imgSrc ? Math.round(w * 0.38) : 0;
      return (
        <div ref={ref} dir={isAr ? "rtl" : "ltr"} style={{
          width: w, height: h, fontFamily: FONT,
          display: "flex", flexDirection: "column", overflow: "hidden", background: C.white,
        }}>
          <Header />
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* محتوى */}
            <div style={{
              flex: 1, padding: `${padV}px ${padH}px`,
              display: "flex", flexDirection: "column", gap: secGap, overflow: "hidden",
            }}>
              <Title />
              <Lede lines={2} />
              <KeyPoints />
            </div>
            {/* صورة */}
            {imgSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imgSrc} alt="" style={{ width: imgW, flexShrink: 0, objectFit: "cover" }} />
            ) : (
              <div style={{
                width: 8, flexShrink: 0,
                background: `linear-gradient(to bottom, ${C.rust}, #c0410f)`,
              }} />
            )}
          </div>
          <Footer />
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════
    // STORY
    // ═══════════════════════════════════════════════════════
    if (isS) {
      const imgH = imgSrc ? 480 : 0;
      return (
        <div ref={ref} dir={isAr ? "rtl" : "ltr"} style={{
          width: w, height: h, fontFamily: FONT,
          display: "flex", flexDirection: "column", overflow: "hidden", background: C.white,
        }}>
          <Header />

          {/* صورة الخبر */}
          {imgSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imgSrc} alt="" style={{ width: "100%", height: imgH, flexShrink: 0, objectFit: "cover" }} />
          )}
          {/* شريط لوني بديل */}
          {!imgSrc && (
            <div style={{
              width: "100%", height: 12, flexShrink: 0,
              background: `linear-gradient(to ${isAr ? "left" : "right"}, ${C.rust}, #c0410f)`,
            }} />
          )}

          {/* المحتوى */}
          <div style={{
            flex: 1, padding: `${padV}px ${padH}px`,
            display: "flex", flexDirection: "column", gap: secGap, overflow: "hidden",
          }}>
            <Title />
            <Lede lines={3} />
            {pts.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{
                  margin: 0, fontSize: 19, fontWeight: 700,
                  color: C.rust, fontFamily: FONT, letterSpacing: ".02em",
                }}>
                  {isAr ? "أبرز التفاصيل" : "Key points"}
                </p>
                <KeyPoints />
              </div>
            )}
            <WhyBox />
            {data.quote && <Quote />}
            {data.whatsNext && <WhatsNext />}
          </div>

          <Footer />
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════
    // SQUARE
    // ═══════════════════════════════════════════════════════
    const imgH = imgSrc ? 300 : 0;
    return (
      <div ref={ref} dir={isAr ? "rtl" : "ltr"} style={{
        width: w, height: h, fontFamily: FONT,
        display: "flex", flexDirection: "column", overflow: "hidden", background: C.white,
      }}>
        <Header />

        {/* صورة الخبر */}
        {imgSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgSrc} alt="" style={{ width: "100%", height: imgH, flexShrink: 0, objectFit: "cover" }} />
        )}
        {!imgSrc && (
          <div style={{
            width: "100%", height: 10, flexShrink: 0,
            background: `linear-gradient(to ${isAr ? "left" : "right"}, ${C.rust}, #c0410f)`,
          }} />
        )}

        {/* المحتوى */}
        <div style={{
          flex: 1, padding: `${padV}px ${padH}px`,
          display: "flex", flexDirection: "column", gap: secGap, overflow: "hidden",
        }}>
          <Title />
          <Lede lines={3} />
          {pts.length > 0 && <KeyPoints />}
          <WhyBox />
        </div>

        <Footer />
      </div>
    );
  }
);

export default NewsShareCard;
