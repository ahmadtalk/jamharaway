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

          {/* Social icons */}
          <div className="footer-social-row">
            <a href="https://x.com/jamharacom" target="_blank" rel="noopener noreferrer" className="footer-social" aria-label="X">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://instagram.com/jamharacom" target="_blank" rel="noopener noreferrer" className="footer-social" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="https://youtube.com/@jamharacom" target="_blank" rel="noopener noreferrer" className="footer-social" aria-label="YouTube">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="4"/><polygon points="10,9 15.5,12 10,15" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="https://linkedin.com/company/jamharacom" target="_blank" rel="noopener noreferrer" className="footer-social" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="4"/><line x1="8" y1="11" x2="8" y2="17"/><line x1="8" y1="8" x2="8" y2="8.5" strokeWidth="2.5"/><path d="M12 17v-4.5a2 2 0 0 1 4 0V17"/><line x1="12" y1="11" x2="12" y2="17"/></svg>
            </a>
            <a href="https://threads.net/@jamharacom" target="_blank" rel="noopener noreferrer" className="footer-social" aria-label="Threads">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.312-.883-2.378-.888h-.014c-.803 0-1.535.199-2.18.592-.622.379-1.102.937-1.427 1.656l-1.911-.752c.467-1.073 1.187-1.963 2.14-2.647.991-.711 2.194-1.086 3.484-1.086h.02c3.307.016 5.257 2.058 5.488 5.538.137.033.273.067.408.104 1.154.313 2.079.926 2.67 1.77.942 1.331 1.084 3.186.38 4.956-.88 2.205-2.785 3.613-5.332 3.763-.257.015-.511.023-.764.023zm.95-8.826c-.183 0-.367.009-.549.022-1.037.063-1.834.37-2.302.856-.407.42-.587.958-.55 1.461.03.583.309 1.079.787 1.408.527.349 1.241.507 2.039.468.862-.047 1.552-.33 2.052-.842.47-.48.769-1.13.907-1.97l.006-.036a15.43 15.43 0 0 0-2.39-.367z"/></svg>
            </a>
            <a href="https://tiktok.com/@jamharacom" target="_blank" rel="noopener noreferrer" className="footer-social" aria-label="TikTok">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.79a4.85 4.85 0 0 1-1.01-.1z"/></svg>
            </a>
          </div>
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
