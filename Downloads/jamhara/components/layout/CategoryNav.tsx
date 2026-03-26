"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import type { Category } from "@/lib/supabase/types";

interface Props {
  categories: Category[];
}

export default function CategoryNav({ categories }: Props) {
  const locale = useLocale();
  const pathname = usePathname();

  // Main categories only (no parent)
  const main = categories.filter((c) => !c.parent_id).sort((a, b) => a.sort_order - b.sort_order);

  function catHref(slug: string) {
    return locale === "en" ? `/en/${slug}` : `/${slug}`;
  }

  function isActive(slug: string) {
    return pathname.includes(`/${slug}`);
  }

  return (
    <nav className="cat-nav-wrap" aria-label="أقسام المعرفة">
      <div className="cat-nav">
        <Link
          href={locale === "en" ? "/en" : "/"}
          className={`cat-nav-item ${pathname === "/" || pathname === "/en" ? "active" : ""}`}
        >
          {locale === "ar" ? "الكل" : "All"}
        </Link>
        {main.map((cat) => (
          <Link
            key={cat.id}
            href={catHref(cat.slug)}
            className={`cat-nav-item ${isActive(cat.slug) ? "active" : ""}`}
            style={isActive(cat.slug) ? { color: cat.color, borderBottomColor: cat.color } : {}}
          >
            {locale === "ar" ? cat.name_ar : cat.name_en}
          </Link>
        ))}
      </div>
    </nav>
  );
}
