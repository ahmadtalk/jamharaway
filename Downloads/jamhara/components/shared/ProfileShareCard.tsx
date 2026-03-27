/**
 * ProfileShareCard — بطاقة المشاركة المخصصة لنوع البروفايل
 * inline styles فقط لضمان الالتقاط الصحيح بـ html-to-image
 *
 * هيكل الـ layouts:
 *   SQUARE   — هيرو (أفاتار+اسم+تاغلاين+chips) ثم محتوى (إحصاءات+خط زمني)
 *   LANDSCAPE — عمودان: أيمن=هيرو  ·  أيسر=إحصاءات+خط زمني
 *   STORY     — ثلاثة أقسام بـ space-between لملء 1920px كاملاً:
 *               أعلى=أفاتار+اسم+تاغلاين  ·  وسط=chips  ·  أسفل=إحصاءات+خط زمني
 */
"use client";

import { forwardRef } from "react";
import { CARD_DIMS, type ShareCardSize } from "./ShareCard";
import type { ProfileShareData } from "@/lib/share-card-data";

const FONT = "'Cairo', 'IBM Plex Sans Arabic', Arial, sans-serif";

const C = {
  navy:  "#373C55",
  ink:   "#1E2130",
  muted: "#6B7280",
  slate: "#EDF1F5",
  white: "#FFFFFF",
  green: "#4CB36C",
};

function hxa(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

interface Props {
  data:     ProfileShareData;
  size:     ShareCardSize;
  logoSrc?: string | null;
  imgSrc?:  string | null;
  locale?:  "ar" | "en";
}

const ProfileShareCard = forwardRef<HTMLDivElement, Props>(
  function ProfileShareCard({ data, size, logoSrc, imgSrc, locale = "ar" }, ref) {
    const [w, h] = CARD_DIMS[size];
    const isL = size === "landscape";
    const isS = size === "story";
    const ac  = data.avatarColor || C.navy;
    const displayName = data.knownAs || data.fullName;

    // ── أحجام per format ──────────────────────────────────────────
    const padH = isL ? 48 : isS ? 80 : 64;
    const padV = isL ? 28 : isS ? 56 : 48;

    const logoH     = isL ? 44  : isS ? 64  : 54;
    const sloganFS  = isL ? 15  : isS ? 22  : 19;   // حجم السلوغن في الهيدر
    const ftSz      = isL ? 16  : isS ? 23  : 19;
    const avsz      = isL ? 96  : isS ? 260 : 160;  // أكبر للستوري
    const nameFS    = isL ? 28  : isS ? 58  : 44;
    const tagFS     = isL ? 16  : isS ? 28  : 21;
    const chipFS    = isL ? 14  : isS ? 22  : 17;
    const statNumFS = isL ? 26  : isS ? 48  : 36;
    const statLbFS  = isL ? 12  : isS ? 18  : 14;
    const statIcFS  = isL ? 20  : isS ? 30  : 22;
    const tlEvFS    = isL ? 15  : isS ? 25  : 19;
    const tlYrFS    = isL ? 12  : isS ? 18  : 15;
    const tlDotSz   = isL ? 10  : isS ? 14  : 12;
    const tlYrW     = isL ? 40  : isS ? 54  : 48;
    const tlGap     = isL ? 14  : isS ? 24  : 16;
    const secGap    = isL ? 18  : isS ? 36  : 24;

    const maxFacts = isL ? 3 : isS ? 5 : 4;
    const maxStats = isL ? 4 : isS ? 4 : 4;
    const maxTl    = isL ? 3 : isS ? 5 : 4;

    const facts = data.quickFacts.slice(0, maxFacts);
    const stats = data.stats.slice(0, maxStats);
    const tl    = data.timelineItems.slice(0, maxTl);

    // ── Header ─────────────────────────────────────────────────────
    // عربي (RTL): الشعار يمين ← أول عنصر | السلوغن يسار ← ثاني عنصر
    // إنجليزي (LTR): السلوغن يسار ← أول عنصر | الشعار يمين ← ثاني عنصر
    const isAr = locale !== "en";

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
        {/* عربي: شعار (يمين) ثم سلوغن (يسار) | إنجليزي: سلوغن (يسار) ثم شعار (يمين) */}
        {isAr ? <><LogoEl /><SloganEl /></> : <><SloganEl /><LogoEl /></>}
      </div>
    );

    // ── Footer ───────────────────────────────────────────────────
    // RTL: الأول (يمين) = شعار+موقع | الثاني (يسار) = نص دعوة
    const Footer = () => (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: `${Math.round(padV * 0.55)}px ${padH}px`,
        background: C.slate, flexShrink: 0,
        borderTop: `4px solid ${ac}`,
      }}>
        {/* يمين — jamhara.com */}
        <span style={{
          fontSize: ftSz, fontWeight: 800, color: ac,
          fontFamily: FONT, whiteSpace: "nowrap",
        }}>jamhara.com</span>

        {/* يسار/يمين — دعوة للمتابعة */}
        <span style={{
          fontSize: Math.round(ftSz * 0.82), fontWeight: 600,
          color: C.muted, fontFamily: FONT,
          fontStyle: "italic",
        }}>
          {isAr ? "البروفايل كاملًا في موقع جمهرة" : "Full profile on Jamhara"}
        </span>
      </div>
    );

    // ── Avatar ───────────────────────────────────────────────────
    const AvatarEl = () => (
      <div style={{
        width: avsz, height: avsz, borderRadius: "50%",
        border: `${isS ? 7 : isL ? 3 : 4}px solid ${ac}`,
        background: imgSrc ? "transparent" : hxa(ac, 0.1),
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, overflow: "hidden",
        boxShadow: `0 0 0 ${isS ? 12 : isL ? 4 : 6}px ${hxa(ac, 0.18)}`,
      }}>
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgSrc} alt={displayName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: Math.round(avsz * 0.44), lineHeight: 1 }}>
            {data.avatarEmoji}
          </span>
        )}
      </div>
    );

    // ── Stats grid ───────────────────────────────────────────────
    const StatsGrid = ({ cols }: { cols: number }) =>
      stats.length === 0 ? null : (
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(stats.length, cols)}, 1fr)`,
          gap: isS ? 14 : isL ? 8 : 10,
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: hxa(ac, 0.06),
              border: `1px solid ${hxa(ac, 0.2)}`,
              borderRadius: isS ? 16 : 10,
              padding: isS ? "18px 10px" : isL ? "10px 8px" : "14px 10px",
              textAlign: "center",
            }}>
              {s.icon && (
                <div style={{ fontSize: statIcFS, marginBottom: isS ? 6 : 4 }}>{s.icon}</div>
              )}
              <div style={{
                fontFamily: FONT, fontWeight: 900,
                fontSize: statNumFS, color: ac, lineHeight: 1.1,
              }}>
                {s.value}
                {s.unit && (
                  <span style={{ fontSize: Math.round(statNumFS * 0.4), fontWeight: 600, color: C.muted, marginRight: 2 }}>
                    {s.unit}
                  </span>
                )}
              </div>
              <div style={{ fontSize: statLbFS, color: C.muted, marginTop: isS ? 6 : 3, fontFamily: FONT, lineHeight: 1.3 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      );

    // ── Quick facts chips ─────────────────────────────────────────
    const FactsRow = ({ center = false }: { center?: boolean }) =>
      facts.length === 0 ? null : (
        <div style={{
          display: "flex", flexWrap: "wrap", gap: isS ? 10 : 7,
          justifyContent: center ? "center" : "flex-start",
        }}>
          {facts.map((f, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: isS ? 8 : 5,
              fontSize: chipFS,
              background: C.white,
              border: `1.5px solid ${hxa(ac, 0.28)}`,
              borderRadius: 30,
              padding: isS ? "8px 18px" : isL ? "4px 12px" : "5px 14px",
              fontFamily: FONT,
              boxShadow: `0 1px 4px ${hxa(ac, 0.1)}`,
            }}>
              <span>{f.icon}</span>
              <span style={{ color: C.muted, fontSize: Math.round(chipFS * 0.82) }}>{f.label}:</span>
              <span style={{ fontWeight: 700, color: C.ink }}>{f.value}</span>
            </span>
          ))}
        </div>
      );

    // ── Timeline ─────────────────────────────────────────────────
    const Timeline = () =>
      tl.length === 0 ? null : (
        <div>
          <div style={{
            fontSize: isS ? 17 : isL ? 12 : 14,
            fontWeight: 800, color: C.muted,
            marginBottom: isS ? 18 : 10,
            letterSpacing: ".07em", fontFamily: FONT, textTransform: "uppercase",
          }}>
            المسار الزمني
          </div>
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute",
              top: 8, bottom: 8,
              insetInlineStart: tlYrW + Math.round(tlDotSz / 2),
              width: 2,
              background: hxa(ac, 0.22),
              borderRadius: 2,
            }} />
            {tl.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start",
                marginBottom: i < tl.length - 1 ? tlGap : 0,
                position: "relative",
              }}>
                <div style={{
                  flexShrink: 0, width: tlYrW,
                  fontSize: tlYrFS, fontWeight: 800,
                  color: item.dotColor, textAlign: "center",
                  paddingTop: 1, fontFamily: FONT,
                }}>
                  {item.year}
                </div>
                <div style={{
                  flexShrink: 0,
                  width: tlDotSz, height: tlDotSz, borderRadius: "50%",
                  background: item.dotColor,
                  marginTop: isS ? 4 : 3, marginInlineEnd: 12,
                  border: "2px solid #fff",
                  boxShadow: `0 0 0 2px ${item.dotColor}`,
                  zIndex: 1,
                }} />
                <p style={{
                  fontSize: tlEvFS, color: C.ink,
                  lineHeight: 1.5, margin: 0,
                  fontWeight: 500, fontFamily: FONT,
                  flex: 1,
                }}>
                  {item.event}
                </p>
              </div>
            ))}
          </div>
        </div>
      );

    // ══════════════════════════════════════════════════════════════
    // LANDSCAPE — عمودان
    // ══════════════════════════════════════════════════════════════
    if (isL) {
      return (
        <div ref={ref} dir={isAr ? "rtl" : "ltr"} style={{
          width: w, height: h, fontFamily: FONT,
          display: "flex", flexDirection: "column",
          overflow: "hidden", background: C.white,
        }}>
          <Header />
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* العمود الأيمن (أول في RTL): الأفاتار + الاسم + التاغلاين + الحقائق */}
            <div style={{
              width: 400, flexShrink: 0,
              background: `linear-gradient(145deg, ${hxa(ac, 0.1)} 0%, ${hxa(ac, 0.03)} 100%)`,
              borderInlineEnd: `1.5px solid ${hxa(ac, 0.14)}`,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 12, overflow: "hidden",
              padding: `${padV}px ${Math.round(padH * 0.65)}px`,
            }}>
              <AvatarEl />
              <div style={{ textAlign: "center", width: "100%" }}>
                <h2 style={{
                  margin: 0, fontSize: nameFS, fontWeight: 900,
                  color: C.ink, lineHeight: 1.3, fontFamily: FONT,
                }}>
                  {displayName}
                </h2>
                {data.tagline && (
                  <p style={{
                    margin: "5px 0 0", fontSize: tagFS,
                    fontWeight: 600, color: ac,
                    fontFamily: FONT, lineHeight: 1.4,
                    // حد أقصى سطرين في اللاندسكيب
                    overflow: "hidden",
                    maxHeight: tagFS * 1.4 * 2,
                  }}>
                    {data.tagline}
                  </p>
                )}
              </div>
              <div style={{ width: "100%", display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                {facts.map((f, i) => (
                  <span key={i} style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: chipFS,
                    background: C.white,
                    border: `1.5px solid ${hxa(ac, 0.28)}`,
                    borderRadius: 30,
                    padding: "4px 12px",
                    fontFamily: FONT,
                  }}>
                    <span>{f.icon}</span>
                    <span style={{ color: C.muted, fontSize: Math.round(chipFS * 0.82) }}>{f.label}:</span>
                    <span style={{ fontWeight: 700, color: C.ink }}>{f.value}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* العمود الأيسر (ثاني في RTL): الإحصاءات + الخط الزمني */}
            <div style={{
              flex: 1,
              padding: `${padV}px ${padH}px`,
              display: "flex", flexDirection: "column",
              gap: secGap, overflow: "hidden",
            }}>
              <StatsGrid cols={2} />
              <Timeline />
            </div>
          </div>
          <Footer />
        </div>
      );
    }

    // ══════════════════════════════════════════════════════════════
    // STORY — ثلاثة أقسام موزّعة لملء 1920px بالكامل
    // ══════════════════════════════════════════════════════════════
    if (isS) {
      return (
        <div ref={ref} dir={isAr ? "rtl" : "ltr"} style={{
          width: w, height: h, fontFamily: FONT,
          display: "flex", flexDirection: "column",
          overflow: "hidden", background: C.white,
        }}>
          <Header />

          {/* الجسم: flex:1 مع space-between لتوزيع المحتوى */}
          <div style={{
            flex: 1,
            background: `linear-gradient(180deg, ${hxa(ac, 0.1)} 0%, ${hxa(ac, 0.03)} 45%, transparent 75%)`,
            display: "flex", flexDirection: "column",
            justifyContent: "space-between",
            paddingTop: padV,
            paddingBottom: padV,
            paddingLeft: padH, paddingRight: padH,
          }}>
            {/* القسم الأول: الأفاتار + الاسم + التاغلاين */}
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 20,
            }}>
              {/* هالة + أفاتار */}
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{
                  position: "absolute",
                  width: avsz * 1.6, height: avsz * 1.6, borderRadius: "50%",
                  background: `radial-gradient(circle, ${hxa(ac, 0.15)} 0%, transparent 70%)`,
                }} />
                <AvatarEl />
              </div>
              <div style={{ textAlign: "center" }}>
                <h2 style={{
                  margin: 0, fontSize: nameFS, fontWeight: 900,
                  color: C.ink, lineHeight: 1.25, fontFamily: FONT,
                }}>
                  {displayName}
                </h2>
                {data.tagline && (
                  <p style={{
                    margin: "12px 0 0", fontSize: tagFS, fontWeight: 600,
                    color: ac, fontFamily: FONT, lineHeight: 1.5,
                  }}>
                    {data.tagline}
                  </p>
                )}
              </div>
            </div>

            {/* القسم الثاني: الحقائق السريعة (وسط البطاقة) */}
            <FactsRow center />

            {/* القسم الثالث: الإحصاءات + الخط الزمني */}
            <div style={{ display: "flex", flexDirection: "column", gap: secGap }}>
              <StatsGrid cols={Math.min(stats.length, 4)} />
              <Timeline />
            </div>
          </div>

          <Footer />
        </div>
      );
    }

    // ══════════════════════════════════════════════════════════════
    // SQUARE — هيرو ثم محتوى
    // ══════════════════════════════════════════════════════════════
    return (
      <div ref={ref} dir={isAr ? "rtl" : "ltr"} style={{
        width: w, height: h, fontFamily: FONT,
        display: "flex", flexDirection: "column",
        overflow: "hidden", background: C.white,
      }}>
        <Header />

        {/* هيرو: تدرج لوني + أفاتار مركزي */}
        <div style={{
          background: `linear-gradient(180deg, ${hxa(ac, 0.11)} 0%, ${hxa(ac, 0.04)} 55%, transparent 100%)`,
          display: "flex", flexDirection: "column", alignItems: "center",
          paddingTop: padV,
          paddingBottom: Math.round(padV * 0.55),
          paddingLeft: padH, paddingRight: padH,
          gap: 14, flexShrink: 0,
        }}>
          {/* هالة + أفاتار */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{
              position: "absolute",
              width: avsz * 1.65, height: avsz * 1.65, borderRadius: "50%",
              background: `radial-gradient(circle, ${hxa(ac, 0.13)} 0%, transparent 70%)`,
            }} />
            <AvatarEl />
          </div>
          <div style={{ textAlign: "center" }}>
            <h2 style={{
              margin: 0, fontSize: nameFS, fontWeight: 900,
              color: C.ink, lineHeight: 1.25, fontFamily: FONT,
            }}>
              {displayName}
            </h2>
            {data.tagline && (
              <p style={{
                margin: "8px 0 0", fontSize: tagFS, fontWeight: 600,
                color: ac, fontFamily: FONT, lineHeight: 1.5,
              }}>
                {data.tagline}
              </p>
            )}
          </div>
          <FactsRow />
        </div>

        {/* المحتوى: الإحصاءات + الخط الزمني */}
        <div style={{
          flex: 1,
          paddingTop: Math.round(padV * 0.72),
          paddingBottom: padV,
          paddingLeft: padH, paddingRight: padH,
          display: "flex", flexDirection: "column",
          gap: secGap, overflow: "hidden",
        }}>
          <StatsGrid cols={Math.min(stats.length, 4)} />
          <Timeline />
        </div>

        <Footer />
      </div>
    );
  }
);

export default ProfileShareCard;
