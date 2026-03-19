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
        جمهرة — المعرفة الموثوقة · يوميًا
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

            {/* Language switcher */}
            <Link href={altHref} className="hdr-lang">
              {locale === "ar" ? "EN" : "عر"}
            </Link>
          </div>

        </div>
      </header>

      {/* Search modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
