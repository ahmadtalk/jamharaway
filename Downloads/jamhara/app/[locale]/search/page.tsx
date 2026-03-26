import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import PostCard from "@/components/feed/PostCard";
import type { PostWithRelations, Category } from "@/lib/supabase/types";
import type { Metadata } from "next";

export const revalidate = 0;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  return {
    title: query
      ? locale === "ar"
        ? `نتائج البحث: "${query}" — جمهرة`
        : `Search: "${query}" — Jamhara`
      : locale === "ar"
      ? "بحث — جمهرة"
      : "Search — Jamhara",
  };
}

const PAGE_SIZE = 12;

async function getData(q: string, page: number) {
  const supabase = await createClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const [{ data: posts, count }, { data: categories }] = await Promise.all([
    q.length >= 2
      ? supabase
          .from("posts")
          .select(
            `*, type, chart_config, quiz_config, comparison_config, content_config,
             category:categories!posts_category_id_fkey(*),
             subcategory:categories!posts_subcategory_id_fkey(*),
             source:sources(*)`,
            { count: "exact" }
          )
          .eq("status", "published")
          .or(
            `title_ar.ilike.%${q}%,title_en.ilike.%${q}%,body_ar.ilike.%${q}%,body_en.ilike.%${q}%`
          )
          .order("published_at", { ascending: false })
          .range(from, to)
      : { data: [], count: 0 },
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  return {
    posts: (posts ?? []) as PostWithRelations[],
    categories: (categories ?? []) as Category[],
    total: count ?? 0,
  };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q, page: pageStr } = await searchParams;
  const query = q?.trim() ?? "";
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const isAr = locale === "ar";

  const { posts, categories, total } = await getData(query, page);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildPageHref = (p: number) => {
    const base = locale === "en" ? "/en/search" : "/search";
    return `${base}?q=${encodeURIComponent(query)}&page=${p}`;
  };

  return (
    <div className="page-shell" style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <Header />

      <div className="page" style={{ flex: 1 }}>
        <Sidebar categories={categories} />

        <main>
          <div className="feed">

            {/* Search header card */}
            <div style={{
              background: "var(--white)",
              border: "1px solid var(--slate2)",
              borderRadius: 14,
              padding: "1.25rem 1.25rem 1rem",
              borderTop: "3px solid var(--primary, #2563eb)",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                direction: isAr ? "rtl" : "ltr",
              }}>
                <span style={{ fontSize: "1.25rem" }}>🔍</span>
                <h1 style={{
                  fontFamily: isAr ? "var(--font-cairo, Cairo, sans-serif)" : "inherit",
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  color: "var(--ink)",
                  margin: 0,
                }}>
                  {isAr ? "نتائج البحث" : "Search Results"}
                </h1>
                {query && (
                  <span style={{
                    marginInlineStart: "auto",
                    fontSize: ".78rem",
                    color: "var(--muted)",
                    background: "var(--slate3)",
                    padding: "2px 10px",
                    borderRadius: 100,
                  }}>
                    {total} {isAr ? "نتيجة" : "results"}
                  </span>
                )}
              </div>

              {/* Results count summary */}
              {query && (
                <p style={{
                  marginTop: 8,
                  marginBottom: 0,
                  fontSize: ".88rem",
                  color: "var(--muted)",
                  direction: isAr ? "rtl" : "ltr",
                  fontFamily: isAr ? "var(--font-cairo, Cairo, sans-serif)" : "inherit",
                }}>
                  {isAr
                    ? total > 0
                      ? `${total} نتيجة لـ "${query}"`
                      : `لا توجد نتائج لـ "${query}"`
                    : total > 0
                      ? `${total} result${total !== 1 ? "s" : ""} for "${query}"`
                      : `No results for "${query}"`}
                </p>
              )}
            </div>

            {/* No query state */}
            {!query && (
              <div style={{
                background: "var(--white)",
                border: "1px solid var(--slate2)",
                borderRadius: 14,
                textAlign: "center",
                padding: "60px 20px",
                direction: isAr ? "rtl" : "ltr",
              }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🔎</div>
                <p style={{
                  fontFamily: isAr ? "var(--font-cairo, Cairo, sans-serif)" : "inherit",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "var(--ink)",
                  margin: "0 0 8px",
                }}>
                  {isAr ? "ابدأ البحث" : "Start searching"}
                </p>
                <p style={{ fontSize: ".875rem", color: "var(--muted)", margin: 0 }}>
                  {isAr
                    ? "ابحث في المقالات، المخططات، الاختبارات وأكثر"
                    : "Search through articles, charts, quizzes and more"}
                </p>
              </div>
            )}

            {/* Results */}
            {query && posts.length > 0 && posts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}

            {/* Empty results state */}
            {query && posts.length === 0 && (
              <div style={{
                background: "var(--white)",
                border: "1px solid var(--slate2)",
                borderRadius: 14,
                textAlign: "center",
                padding: "60px 20px",
                direction: isAr ? "rtl" : "ltr",
              }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🌫️</div>
                <p style={{
                  fontFamily: isAr ? "var(--font-cairo, Cairo, sans-serif)" : "inherit",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "var(--ink)",
                  margin: "0 0 8px",
                }}>
                  {isAr ? "لا توجد نتائج" : "No results found"}
                </p>
                <p style={{ fontSize: ".875rem", color: "var(--muted)", margin: "0 0 20px" }}>
                  {isAr
                    ? `لم نجد أي منشورات تطابق "${query}"`
                    : `No posts matched "${query}"`}
                </p>
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  justifyContent: "center",
                }}>
                  <p style={{ fontSize: ".8rem", color: "var(--muted)", width: "100%", margin: "0 0 8px" }}>
                    {isAr ? "اقتراحات:" : "Suggestions:"}
                  </p>
                  {(isAr
                    ? ["الاقتصاد", "التاريخ", "التكنولوجيا", "العلوم", "الثقافة"]
                    : ["Economy", "History", "Technology", "Science", "Culture"]
                  ).map((s) => (
                    <a
                      key={s}
                      href={`${locale === "en" ? "/en" : ""}/search?q=${encodeURIComponent(s)}`}
                      style={{
                        padding: "5px 14px",
                        borderRadius: 100,
                        border: "1px solid var(--slate2)",
                        fontSize: ".8rem",
                        color: "var(--muted)",
                        textDecoration: "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--slate3)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                    >
                      {s}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Pagination */}
            {query && totalPages > 1 && (
              <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                padding: "8px 0 4px",
                direction: "ltr",
              }}>
                {page > 1 && (
                  <a
                    href={buildPageHref(page - 1)}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 8,
                      border: "1px solid var(--slate2)",
                      background: "var(--white)",
                      fontSize: ".85rem",
                      color: "var(--ink)",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    ← {isAr ? "السابق" : "Prev"}
                  </a>
                )}

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const p = start + i;
                  if (p > totalPages) return null;
                  const active = p === page;
                  return (
                    <a
                      key={p}
                      href={buildPageHref(p)}
                      style={{
                        padding: "7px 13px",
                        borderRadius: 8,
                        border: active ? "none" : "1px solid var(--slate2)",
                        background: active ? "var(--primary, #2563eb)" : "var(--white)",
                        color: active ? "#fff" : "var(--ink)",
                        fontSize: ".85rem",
                        textDecoration: "none",
                        fontWeight: active ? 700 : 500,
                      }}
                    >
                      {p}
                    </a>
                  );
                })}

                {page < totalPages && (
                  <a
                    href={buildPageHref(page + 1)}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 8,
                      border: "1px solid var(--slate2)",
                      background: "var(--white)",
                      fontSize: ".85rem",
                      color: "var(--ink)",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    {isAr ? "التالي" : "Next"} →
                  </a>
                )}
              </div>
            )}

          </div>
        </main>

        <RightPanel locale={locale} />
      </div>

      <Footer locale={locale} />
      <MobileNav />
    </div>
  );
}
