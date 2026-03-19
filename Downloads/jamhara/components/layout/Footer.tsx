import Link from "next/link";
import Image from "next/image";

interface Props { locale: string; }

export default function Footer({ locale }: Props) {
  const isAr = locale === "ar";
  const base = isAr ? "" : "/en";
  const year = new Date().getFullYear();

  const quickLinks = [
    { href: `${base}/`, label: isAr ? "الرئيسية" : "Home" },
    { href: `${base}/most-read`, label: isAr ? "الأكثر قراءة" : "Most Read" },
    { href: `${base}/about`, label: isAr ? "من نحن" : "About" },
    { href: `${base}/contact`, label: isAr ? "اتصل بنا" : "Contact" },
  ];

  const legalLinks = [
    { href: `${base}/terms`, label: isAr ? "شروط الخدمة" : "Terms" },
    { href: `${base}/privacy`, label: isAr ? "الخصوصية" : "Privacy" },
    { href: `${base}/cookies`, label: isAr ? "سياسة الكوكيز" : "Cookies" },
  ];

  const tagline = isAr
    ? "منصة معرفية عربية توفر محتوى موثوقاً ومنظماً في العلوم والثقافة والفكر"
    : "An Arabic knowledge platform delivering curated, reliable content across science and culture.";

  return (
    <footer style={{
      background: "var(--navy)",
      color: "rgba(255,255,255,.5)",
      marginTop: "auto",
    }}>
      {/* Main footer body */}
      <div style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "2.5rem clamp(.75rem, 2vw, 1.25rem) 2rem",
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        gap: "2rem 3rem",
        alignItems: "start",
      }}>

        {/* Brand column */}
        <div>
          {/* Logo */}
          <Link href={isAr ? "/" : "/en"} style={{ display: "inline-block", marginBottom: "1rem" }}>
            <Image
              src="/logo.png"
              alt="جمهرة"
              width={110}
              height={40}
              style={{ height: 40, width: "auto", objectFit: "contain", opacity: .9, filter: "brightness(0) invert(1)" }}
            />
          </Link>
          {/* Tagline */}
          <p style={{
            fontSize: ".8rem",
            lineHeight: 1.7,
            color: "rgba(255,255,255,.42)",
            maxWidth: 320,
            margin: 0,
          }}>
            {tagline}
          </p>
          {/* Slogan */}
          <p style={{
            marginTop: ".75rem",
            fontSize: ".75rem",
            fontFamily: "var(--font-cairo), 'Cairo', sans-serif",
            fontWeight: 600,
            color: "rgba(255,255,255,.28)",
            letterSpacing: ".04em",
          }}>
            {isAr ? "قيمة المرء ما يعرفه" : "Knowledge is your true value"}
          </p>
        </div>

        {/* Quick links */}
        <div>
          <p className="footer-section-title">{isAr ? "روابط سريعة" : "Quick Links"}</p>
          <nav style={{ display: "flex", flexDirection: "column", gap: ".45rem" }}>
            {quickLinks.map((l) => (
              <Link key={l.href} href={l.href} className="footer-link">{l.label}</Link>
            ))}
          </nav>
        </div>

        {/* Legal links */}
        <div>
          <p className="footer-section-title">{isAr ? "قانوني" : "Legal"}</p>
          <nav style={{ display: "flex", flexDirection: "column", gap: ".45rem" }}>
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className="footer-link">{l.label}</Link>
            ))}
          </nav>
        </div>

      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,.07)",
        padding: ".9rem clamp(.75rem, 2vw, 1.25rem)",
      }}>
        <div style={{
          maxWidth: 1180,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}>
          <span className="footer-copy">
            © {year} {isAr ? "جمهرة — جميع الحقوق محفوظة" : "Jamhara — All rights reserved"}
          </span>
          <span className="footer-copy" style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="11" height="11" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: .5 }}>
              <circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5"/>
            </svg>
            {isAr ? "مُحدَّث يوميًا" : "Updated daily"}
          </span>
        </div>
      </div>
    </footer>
  );
}
