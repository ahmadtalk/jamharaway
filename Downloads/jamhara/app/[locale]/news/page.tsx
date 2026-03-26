import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import PostCard from "@/components/feed/PostCard";
import type { PostWithRelations, Category } from "@/lib/supabase/types";
import type { Metadata } from "next";

export const revalidate = 60; // refresh every minute

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "الأخبار | جمهرة" : "News | Jamhara",
    description:
      locale === "ar"
        ? "آخر الأخبار العربية والدولية على جمهرة"
        : "Latest Arabic and international news on Jamhara",
  };
}

export default async function NewsPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const supabase = await createClient();

  const [{ data: posts }, { data: categories }] = await Promise.all([
    supabase
      .from("posts")
      .select(
        `*, type, chart_config, quiz_config, comparison_config, content_config,
         category:categories!posts_category_id_fkey(*),
         subcategory:categories!posts_subcategory_id_fkey(*),
         source:sources(*)`
      )
      .eq("status", "published")
      .eq("type", "news")
      .order("published_at", { ascending: false })
      .limit(50),
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  const allCats  = (categories ?? []) as Category[];
  const allPosts = (posts ?? []) as PostWithRelations[];

  return (
    <div className="page-shell" style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <Header />
      <div className="page" style={{ flex: 1 }}>
        <Sidebar categories={allCats} />
        <main>

          {/* ══════════════════════════════════════
              HERO — الأخبار
          ══════════════════════════════════════ */}
          <div
            className="page-hero"
            style={{
              margin: "1rem 0 1.5rem",
              borderRadius: 18,
              overflow: "hidden",
              background: "linear-gradient(135deg, #7C1A1A 0%, #C0392B 50%, #922B21 100%)",
              position: "relative",
              boxShadow: "0 8px 32px rgba(192,57,43,.3)",
            }}
          >
            {/* Background dot texture */}
            <div style={{
              position: "absolute", inset: 0, opacity: .05,
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,.8) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }} />

            {/* Glow blob */}
            <div style={{
              position: "absolute", bottom: -60, right: -60,
              width: 240, height: 240, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,100,100,.2) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{ position: "relative", padding: "1.5rem 1.6rem 1.4rem" }}>

              {/* Top label row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <span style={{
                  fontSize: ".72rem", fontWeight: 800, letterSpacing: ".06em",
                  color: "#FCA5A5",
                  background: "rgba(252,165,165,.15)", padding: "3px 12px",
                  borderRadius: 20, border: "1px solid rgba(252,165,165,.3)",
                }}>
                  {isAr ? "📰 آخر الأخبار" : "📰 LATEST NEWS"}
                </span>

                {/* Signal/live icon */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#FCA5A5",
                    boxShadow: "0 0 0 3px rgba(252,165,165,.3)",
                    animation: "pulse 2s infinite",
                    display: "inline-block",
                  }} />
                  <span style={{ fontSize: ".7rem", color: "rgba(255,255,255,.6)", fontWeight: 600 }}>
                    {isAr ? "مباشر" : "LIVE"}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 style={{
                fontFamily: "var(--font-cairo)", fontSize: "1.55rem",
                fontWeight: 800, color: "#fff", margin: "0 0 .3rem",
                lineHeight: 1.2, letterSpacing: "-.02em",
              }}>
                {isAr ? "الأخبار" : "News"}
              </h1>
              <p style={{
                fontSize: ".82rem", color: "rgba(255,255,255,.6)",
                margin: "0 0 1.2rem", lineHeight: 1.5,
              }}>
                {isAr
                  ? "أخبار موثوقة من أبرز المصادر العربية والدولية"
                  : "Trusted news from leading Arabic and international sources"}
              </p>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(0,0,0,.25)", backdropFilter: "blur(8px)",
                  borderRadius: 12, padding: "8px 16px",
                  border: "1px solid rgba(255,255,255,.12)",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#FCA5A5" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/>
                    <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/>
                  </svg>
                  <div>
                    <p style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                      {allPosts.length}
                    </p>
                    <p style={{ margin: 0, fontSize: ".68rem", color: "rgba(255,255,255,.55)" }}>
                      {isAr ? "خبر متاح" : "news available"}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(0,0,0,.25)", backdropFilter: "blur(8px)",
                  borderRadius: 12, padding: "8px 16px",
                  border: "1px solid rgba(255,255,255,.12)",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#FCA5A5" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <div>
                    <p style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                      15
                    </p>
                    <p style={{ margin: 0, fontSize: ".68rem", color: "rgba(255,255,255,.55)" }}>
                      {isAr ? "دقيقة تحديث" : "min refresh"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {allPosts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "4rem 1rem",
                color: "var(--muted)",
              }}
            >
              <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>📭</p>
              <p>{isAr ? "لا توجد أخبار بعد" : "No news yet"}</p>
            </div>
          ) : (
            <div className="feed">
              {allPosts.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          )}
        </main>
        <RightPanel locale={locale} />
      </div>
      <Footer locale={locale} />
      <MobileNav />
    </div>
  );
}
