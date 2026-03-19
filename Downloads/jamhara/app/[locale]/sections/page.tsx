import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import type { Category } from "@/lib/supabase/types";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "الأقسام | جمهرة" : "Sections | Jamhara" };
}

export default async function SectionsPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories").select("*").eq("is_active", true).order("sort_order");
  const allCats = (categories ?? []) as Category[];
  const mainCats = allCats.filter((c) => !c.parent_id);

  return (
    <div className="page-shell">
      <Header />
      <div className="main-wrap">
        <Sidebar categories={allCats} />
        <main className="main-col">
      <div style={{ padding: "2rem 0 5rem" }}>
        {/* Page title */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{
            fontFamily: "var(--font-cairo)", fontSize: "clamp(1.5rem, 3vw, 2rem)",
            fontWeight: 900, color: "var(--ink)", marginBottom: ".5rem",
          }}>
            {isAr ? "أقسام جمهرة المعرفية" : "Jamhara Knowledge Sections"}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>
            {isAr
              ? `${mainCats.length} قسماً رئيسياً · ${allCats.filter(c => c.parent_id).length} تخصصاً فرعياً`
              : `${mainCats.length} main sections · ${allCats.filter(c => c.parent_id).length} subspecialties`}
          </p>
        </div>

        {/* Categories grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1rem",
        }}>
          {mainCats.map((cat) => {
            const subs = allCats.filter((c) => c.parent_id === cat.id);
            const href = isAr ? `/${cat.slug}` : `/en/${cat.slug}`;
            return (
              <div key={cat.id} className="sec-card" style={{ borderTop: `3px solid ${cat.color}` }}>
                {/* Header */}
                <div style={{ padding: "1rem 1rem .75rem", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: cat.color + "18", display: "flex",
                    alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: cat.color }} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={href} className="sec-card-title">
                      {isAr ? cat.name_ar : cat.name_en}
                    </Link>
                    {isAr && (
                      <span style={{ display: "block", fontSize: ".72rem", color: "var(--muted)" }}>{cat.name_en}</span>
                    )}
                  </div>
                  {cat.post_count > 0 && (
                    <span style={{
                      fontSize: ".7rem", fontWeight: 600, padding: "2px 8px",
                      borderRadius: 100, background: cat.color + "14", color: cat.color,
                      flexShrink: 0,
                    }}>{cat.post_count}</span>
                  )}
                </div>

                {/* Subcategories */}
                {subs.length > 0 && (
                  <div style={{
                    padding: ".5rem 1rem .875rem",
                    borderTop: "1px solid var(--slate3)",
                    display: "flex", flexWrap: "wrap", gap: 5,
                  }}>
                    {subs.map((sub) => (
                      <span key={sub.id} style={{
                        fontSize: ".72rem", color: "var(--muted2)", padding: "2px 8px",
                        borderRadius: 100, background: "var(--slate3)",
                      }}>
                        {isAr ? sub.name_ar : sub.name_en}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
        </main>
        <RightPanel locale={locale} />
      </div>
      <Footer locale={locale} />
      <MobileNav />
    </div>
  );
}
