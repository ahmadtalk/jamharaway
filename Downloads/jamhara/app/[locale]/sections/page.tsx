import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import type { Category } from "@/lib/supabase/types";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 1800;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تصنيفات جمهرة | جمهرة" : "Jamhara Categories | Jamhara",
    description: locale === "ar"
      ? "استعرض جميع أقسام ومجالات المعرفة المتاحة على منصة جمهرة"
      : "Browse all knowledge sections and categories on Jamhara",
  };
}

export default async function SectionsPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories").select("*").eq("is_active", true).order("sort_order");
  const allCats = (categories ?? []) as Category[];
  const mainCats = allCats.filter((c) => !c.parent_id);
  const totalPosts = mainCats.reduce((s, c) => s + (c.post_count ?? 0), 0);

  return (
    <div className="page-shell" style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <Header />
      <div className="page" style={{ flex: 1 }}>
        <Sidebar categories={allCats} />
        <main>
          <div style={{ paddingBottom: "3rem" }}>

            {/* Page header */}
            <div style={{ marginBottom: "1.75rem" }}>
              <h1 style={{
                fontFamily: "var(--font-cairo)", fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
                fontWeight: 900, color: "var(--ink)", marginBottom: ".4rem",
              }}>
                {isAr ? "تصنيفات جمهرة" : "Jamhara Categories"}
              </h1>
              <p style={{ color: "var(--muted)", fontSize: ".88rem", margin: 0 }}>
                {isAr
                  ? `${mainCats.length} قسماً · ${totalPosts} منشوراً`
                  : `${mainCats.length} sections · ${totalPosts} posts`}
              </p>
            </div>

            {/* Empty state */}
            {mainCats.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 24px" }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>📂</div>
                <p style={{ fontFamily: "var(--font-cairo),sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "var(--ink)", margin: "0 0 8px" }}>
                  {isAr ? "لا توجد أقسام بعد" : "No sections yet"}
                </p>
              </div>
            )}

            {/* Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem",
            }}>
              {mainCats.map((cat) => {
                const name = isAr ? cat.name_ar : (cat.name_en ?? cat.name_ar);
                const href = isAr ? `/${cat.slug}` : `/en/${cat.slug}`;
                const icon = (cat as { icon?: string | null }).icon;
                return (
                  <Link
                    key={cat.id}
                    href={href}
                    className="sec-card"
                    style={{
                      borderTop: `3px solid ${cat.color ?? "var(--green)"}`,
                      textDecoration: "none", display: "block",
                    }}
                  >
                    {/* Header */}
                    <div style={{ padding: "1rem 1rem .875rem", display: "flex", alignItems: "center", gap: 12 }}>
                      {/* أيقونة */}
                      <span style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: (cat.color ?? "#ccc") + "18",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                        fontSize: icon ? "1.35rem" : ".5rem",
                      }}>
                        {icon ? (
                          icon
                        ) : (
                          <span style={{ width: 12, height: 12, borderRadius: "50%", background: cat.color ?? "#ccc", display: "inline-block" }} />
                        )}
                      </span>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{
                          fontFamily: "var(--font-cairo)", fontSize: ".95rem",
                          fontWeight: 800, color: "var(--ink)",
                          display: "block", lineHeight: 1.2,
                        }}>
                          {name}
                        </span>
                        {isAr && cat.name_en && (
                          <span style={{ display: "block", fontSize: ".7rem", color: "var(--muted)", marginTop: 2 }}>
                            {cat.name_en}
                          </span>
                        )}
                      </div>

                      {/* عدد المنشورات */}
                      <span style={{
                        fontSize: ".75rem", fontWeight: 700,
                        padding: "3px 10px", borderRadius: 100,
                        background: (cat.color ?? "#ccc") + "15",
                        color: cat.color ?? "var(--muted)",
                        flexShrink: 0,
                      }}>
                        {cat.post_count ?? 0}
                        <span style={{ fontWeight: 400, marginInlineStart: 3, fontSize: ".68rem" }}>
                          {isAr ? "منشور" : "posts"}
                        </span>
                      </span>
                    </div>
                  </Link>
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
