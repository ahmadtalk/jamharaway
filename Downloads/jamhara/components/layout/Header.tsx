"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useState } from "react";
import Image from "next/image";
import SearchModal from "@/components/search/SearchModal";

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [logoError, setLogoError] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const altHref = locale === "ar" ? "/en" : "/";

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-inner">
          {/* Slogan — center-ish (RTL: start side) */}
          <span className="topbar-slogan">
            {locale === "ar" ? "قيمة المرء ما يعرفه" : "Knowledge is your true value"}
          </span>
          {/* Nav links + social icons */}
          <nav className="topbar-links">
            {/* Social icons */}
            <a href="https://x.com/jamharacom" target="_blank" rel="noopener noreferrer" className="topbar-social" aria-label="X">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://instagram.com/jamharacom" target="_blank" rel="noopener noreferrer" className="topbar-social" aria-label="Instagram">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="https://youtube.com/@jamharacom" target="_blank" rel="noopener noreferrer" className="topbar-social" aria-label="YouTube">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="4"/><polygon points="10,9 15.5,12 10,15" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="https://tiktok.com/@jamharacom" target="_blank" rel="noopener noreferrer" className="topbar-social" aria-label="TikTok">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.79a4.85 4.85 0 0 1-1.01-.1z"/></svg>
            </a>
            <span style={{ color: "rgba(255,255,255,.2)", fontSize: ".6rem", margin: "0 2px" }}>|</span>
            <Link href={locale === "en" ? "/en/about" : "/about"} className="topbar-link">
              {locale === "ar" ? "من نحن" : "About"}
            </Link>
            <span style={{ color: "rgba(255,255,255,.3)", fontSize: ".65rem" }}>|</span>
            <Link href={locale === "en" ? "/en/contact" : "/contact"} className="topbar-link">
              {locale === "ar" ? "اتصل بنا" : "Contact"}
            </Link>
          </nav>
        </div>
      </div>

      {/* Main header */}
      <header className="hdr">
        <div className="hdr-inner">

          {/* Logo */}
          <Link href={locale === "en" ? "/en" : "/"} className="hdr-logo" aria-label="جمهرة — الرئيسية">
            {!logoError ? (
              <Image
                src="/logo.png"
                alt="جمهرة"
                width={184}
                height={68}
                priority
                onError={() => setLogoError(true)}
                style={{ height: 68, width: "auto", objectFit: "contain" }}
              />
            ) : (
              <div className="hdr-logo-fallback">
                <div className="hdr-logo-icon">ج</div>
                <span className="hdr-logo-name">{locale === "ar" ? "جمهرة" : "Jamhara"}</span>
              </div>
            )}
          </Link>

          {/* Right side: search icon + language switcher */}
          <div className="hdr-right" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>

            {/* Search icon button */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label={locale === "ar" ? "بحث" : "Search"}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "6px 8px",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.72)",
                transition: "color 0.18s, background 0.18s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.72)";
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              <svg
                width={20}
                height={20}
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.9}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="8.5" cy="8.5" r="5.5" />
                <path d="M15.5 15.5l-3.2-3.2" />
              </svg>
            </button>

            {/* Language switcher — globe icon */}
            <Link href={altHref} className="hdr-lang" aria-label={locale === "ar" ? "English" : "العربية"} title={locale === "ar" ? "English" : "العربية"}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </Link>
          </div>

        </div>
      </header>

      {/* Search modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
