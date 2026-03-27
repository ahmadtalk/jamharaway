/**
 * ShareCard — بطاقة المشاركة الاجتماعية الموحدة (18 نوع)
 * مصممة للالتقاط بـ html-to-image — inline styles فقط
 */
"use client";

import { forwardRef } from "react";
import type { ShareCardData } from "@/lib/share-card-data";
import ProfileShareCard from "./ProfileShareCard";
import NewsShareCard from "./NewsShareCard";

export type ShareCardSize = "square" | "landscape" | "story";

export const CARD_DIMS: Record<ShareCardSize, [number, number]> = {
  square:    [1080, 1080],
  landscape: [1200,  628],
  story:     [1080, 1920],
};

// ألوان مُثبَّتة للالتقاط الموثوق (بدون CSS vars)
const C = {
  green:     "#4CB36C",
  greenDeep: "#2D7A46",
  greenPale: "#F2FAF5",
  greenLight:"#E8F6ED",
  navy:      "#373C55",
  ink:       "#1E2130",
  muted:     "#6B7280",
  slate:     "#EDF1F5",
  white:     "#FFFFFF",
};

const FONT = "'Cairo', 'IBM Plex Sans Arabic', Arial, sans-serif";

export interface SharedShareCardProps {
  data:     ShareCardData;
  size:     ShareCardSize;
  imgSrc?:  string | null;  // blob/proxy URL — بعد حل CORS
  logoSrc?: string | null;  // base64 data URL للشعار
  locale?:  "ar" | "en";
}

const ShareCard = forwardRef<HTMLDivElement, SharedShareCardProps>(
  function ShareCard({ data, size, imgSrc, logoSrc, locale = "ar" }, ref) {
    // ── تفويض لبطاقات متخصصة حسب نوع المحتوى ────────────────────────────────
    if (data.profileData) {
      return (
        <ProfileShareCard
          ref={ref}
          data={data.profileData}
          size={size}
          logoSrc={logoSrc}
          imgSrc={imgSrc}
          locale={locale}
        />
      );
    }

    if (data.newsData) {
      return (
        <NewsShareCard
          ref={ref}
          data={data.newsData}
          size={size}
          logoSrc={logoSrc}
          imgSrc={imgSrc}
          locale={locale}
        />
      );
    }

    const [w, h] = CARD_DIMS[size];
    const isLandscape = size === "landscape";
    const isStory     = size === "story";

    const items = (data.items ?? []).slice(0, isLandscape ? 3 : isStory ? 5 : 4);
    const { typeColor, typeEmoji, typeLabel } = data;

    const titleSize = isLandscape ? 30 : isStory ? 54 : 40;
    const bodySize  = isLandscape ? 18 : isStory ? 28 : 22;
    const ptSize    = isLandscape ? 17 : isStory ? 26 : 20;
    const padH      = isLandscape ? 48 : isStory ? 80 : 64;
    const padV      = isLandscape ? 28 : isStory ? 56 : 48;
    const dotSize   = isLandscape ? 24 : isStory ? 32 : 26;

    // ── Header ─────────────────────────────────────────────
    const logoH = isLandscape ? 44 : isStory ? 64 : 54;
    const Header = () => (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: `${padV * 0.65}px ${padH}px`,
        background: C.navy, flexShrink: 0,
      }}>
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoSrc}
            alt="جمهرة"
            style={{ height: logoH, width: "auto", objectFit: "contain", display: "block" }}
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: logoH, height: logoH,
              background: C.green, borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: logoH * 0.55, fontWeight: 900, color: C.white, fontFamily: FONT,
            }}>ج</div>
            <span style={{ fontSize: logoH * 0.6, fontWeight: 800, color: C.white, fontFamily: FONT }}>
              جمهرة
            </span>
          </div>
        )}
        {/* شارة النوع */}
        <span style={{
          fontSize: isLandscape ? 15 : isStory ? 22 : 18,
          fontWeight: 700, fontFamily: FONT,
          background: typeColor + "30",
          color: typeColor,
          padding: isLandscape ? "4px 12px" : "6px 16px",
          borderRadius: 20,
          border: `1px solid ${typeColor}50`,
        }}>
          {typeEmoji} {typeLabel}
        </span>
      </div>
    );

    // ── Footer ─────────────────────────────────────────────
    const ftSize = isLandscape ? 15 : isStory ? 22 : 18;
    const Footer = () => (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "flex-end",
        padding: `${padV * 0.55}px ${padH}px`,
        background: C.slate, flexShrink: 0,
        borderTop: `4px solid ${C.green}`,
      }}>
        <span style={{
          fontSize: ftSize + 1, fontWeight: 800,
          color: C.green, fontFamily: FONT, whiteSpace: "nowrap",
        }}>jamhara.com</span>
      </div>
    );

    // ── Items List ─────────────────────────────────────────
    const ItemsList = () => (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: "flex", gap: isStory ? 14 : 10, alignItems: "flex-start",
            padding: `${isStory ? 14 : 10}px 0`,
            borderBottom: i < items.length - 1 ? `1px solid ${C.slate}` : "none",
          }}>
            <div style={{
              width: dotSize, height: dotSize, flexShrink: 0,
              background: typeColor, color: C.white, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: isLandscape ? 11 : isStory ? 14 : 12, fontWeight: 700,
              marginTop: 3, fontFamily: FONT,
            }}>{i + 1}</div>
            <span style={{ fontSize: ptSize, lineHeight: 1.65, color: C.ink, fontFamily: FONT }}>{item}</span>
          </div>
        ))}
      </div>
    );

    // ═══════════════════════════════════════════════════════
    // LANDSCAPE — two-column
    // ═══════════════════════════════════════════════════════
    if (isLandscape) {
      const imgW = imgSrc ? Math.round(w * 0.42) : 0;
      return (
        <div ref={ref} dir="rtl" style={{
          width: w, height: h, fontFamily: FONT,
          display: "flex", flexDirection: "column", overflow: "hidden", background: C.white,
        }}>
          <Header />
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* محتوى */}
            <div style={{
              flex: 1, padding: `${padV}px ${padH}px`,
              display: "flex", flexDirection: "column", gap: 18, overflow: "hidden",
            }}>
              <h2 style={{
                margin: 0, fontSize: titleSize, fontWeight: 900,
                color: C.ink, lineHeight: 1.35, fontFamily: FONT,
              }}>{data.title}</h2>
              {data.lede && (
                <p style={{
                  margin: 0, fontSize: bodySize, lineHeight: 1.75,
                  color: C.muted, fontFamily: FONT,
                }}>{data.lede}</p>
              )}
              {items.length > 0 && <ItemsList />}
            </div>
            {/* صورة */}
            {imgSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imgSrc} alt="" style={{
                width: imgW, flexShrink: 0, objectFit: "cover",
              }} />
            )}
            {!imgSrc && (
              <div style={{
                width: 8, flexShrink: 0,
                background: `linear-gradient(to bottom, ${C.green}, ${C.greenDeep})`,
              }} />
            )}
          </div>
          <Footer />
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════
    // SQUARE + STORY — vertical
    // ═══════════════════════════════════════════════════════
    const imgH = isStory ? 520 : 340;

    return (
      <div ref={ref} dir="rtl" style={{
        width: w, height: h, fontFamily: FONT,
        display: "flex", flexDirection: "column", overflow: "hidden", background: C.white,
      }}>
        <Header />

        {imgSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgSrc} alt="" style={{
            width: "100%", height: imgH, flexShrink: 0, objectFit: "cover",
          }} />
        )}
        {!imgSrc && (
          <div style={{
            width: "100%", height: isStory ? 10 : 8, flexShrink: 0,
            background: `linear-gradient(to right, ${typeColor}, ${C.greenDeep})`,
          }} />
        )}

        <div style={{
          flex: 1, padding: `${padV}px ${padH}px`,
          display: "flex", flexDirection: "column", gap: isStory ? 30 : 20,
          overflow: "hidden",
        }}>
          <h2 style={{
            margin: 0, fontSize: titleSize, fontWeight: 900,
            color: C.ink, lineHeight: 1.35, fontFamily: FONT,
          }}>{data.title}</h2>

          {data.lede && (
            <p style={{
              margin: 0, fontSize: bodySize, lineHeight: 1.8,
              color: C.muted, fontFamily: FONT,
            }}>{data.lede}</p>
          )}

          {items.length > 0 && <ItemsList />}
        </div>

        <Footer />
      </div>
    );
  }
);

export default ShareCard;
