"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const locale = useLocale();
  const pathname = usePathname();
  const base = locale === "en" ? "/en" : "";

  const items = [
    {
      href: base || "/",
      label: locale === "ar" ? "الرئيسية" : "Home",
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h3a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h3a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
      active: pathname === "/" || pathname === "/en",
    },
    {
      href: `${base}/search`,
      label: locale === "ar" ? "بحث" : "Search",
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="8.5" cy="8.5" r="5.5" />
          <path strokeLinecap="round" d="M15 15l-3-3" />
        </svg>
      ),
      active: pathname.includes("/search"),
    },
    {
      href: `${base}/our-dna`,
      label: locale === "ar" ? "أقسام" : "Sections",
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      ),
      active: false,
    },
  ];

  return (
    <nav className="mobile-nav" aria-label="تنقل سريع">
      <div className="mobile-nav-inner">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`mnav-item ${item.active ? "active" : ""}`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
