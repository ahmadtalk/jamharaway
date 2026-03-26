import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import PostCard from "@/components/feed/PostCard";
import type { PostWithRelations, Category } from "@/lib/supabase/types";
import type { Metadata } from "next";

export const revalidate = 600; // refresh every 10 min

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "الأكثر قراءة | جمهرة" : "Most Read | Jamhara",
    description:
      locale === "ar"
        ? "أكثر المنشورات قراءة على جمهرة"
        : "Most read posts on Jamhara",
  };
}

const RANK_MEDAL = ["🥇", "🥈", "🥉"];

export default async function MostReadPage({ params }: Props) {
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
      .order("view_count", { ascending: false })
      .limit(30),
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  const allCats  = (categories ?? []) as Category[];
  const allPosts = (posts ?? []) as PostWithRelations[];

  const totalViews = allPosts.reduce((sum, p) => sum + (p.view_count ?? 0), 0);
  const top3 = allPosts.slice(0, 3);

  return (
    <div className="page-shell" style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <Header />
      <div className="page" style={{ flex: 1 }}>
        <Sidebar categories={allCats} />
        <main>

          {/* ══════════════════════════════════════
              HERO — الأكثر قراءة
          ══════════════════════════════════════ */}
          <div
            className="page-hero"
            style={{
              margin: "1rem 0 1.5rem",
              borderRadius: 18,
              overflow: "hidden",
              background: "linear-gradient(135deg, #7C1A1A 0%, #B45309 50%, #92400E 100%)",
              position: "relative",
              boxShadow: "0 8px 32px rgba(180,83,9,.3)",
            }}
          >
            {/* Background noise texture */}
            <div style={{
              position: "absolute", inset: 0, opacity: .05,
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,.8) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }} />

            {/* Glow blob */}
            <div style={{
              position: "absolute", bottom: -60, right: -60,
              width: 240, height: 240, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(251,191,36,.2) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{ position: "relative", padding: "1.5rem 1.6rem 1.4rem" }}>

              {/* Top label row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <span style={{
                  fontSize: ".72rem", fontWeight: 800, letterSpacing: ".06em",
                  color: "#FCD34D",
                  background: "rgba(251,191,36,.15)", padding: "3px 12px",
                  borderRadius: 20, border: "1px solid rgba(251,191,36,.3)",
                }}>
                  {isAr ? "🏆 الأكثر تأثيراً" : "🏆 MOST IMPACTFUL"}
                </span>

                {/* Flame SVG */}
                <svg width="42" height="42" viewBox="0 0 24 24" fill="rgba(251,191,36,.2)"
                  stroke="rgba(251,191,36,.4)" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z"/>
                </svg>
              </div>

              {/* Title */}
              <h1 style={{
                fontFamily: "var(--font-cairo)", fontSize: "1.55rem",
                fontWeight: 800, color: "#fff", margin: "0 0 .3rem",
                lineHeight: 1.2, letterSpacing: "-.02em",
              }}>
                {isAr ? "الأكثر قراءة" : "Most Read"}
              </h1>
              <p style={{
                fontSize: ".82rem", color: "rgba(255,255,255,.6)",
                margin: "0 0 1.2rem", lineHeight: 1.5,
              }}>
                {isAr
                  ? "المحتوى الذي استقطب أكبر عدد من القراء على جمهرة"
                  : "Content that attracted the most readers on Jamhara"}
              </p>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: top3.length ? "1.2rem" : 0 }}>
                <div className="page-hero-stat" style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(0,0,0,.25)", backdropFilter: "blur(8px)",
                  borderRadius: 12, padding: "8px 16px",
                  border: "1px solid rgba(255,255,255,.12)",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#FCD34D" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <div>
                    <p style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                      {totalViews.toLocaleString("ar-EG")}
                    </p>
                    <p style={{ margin: 0, fontSize: ".68rem", color: "rgba(255,255,255,.55)" }}>
                      {isAr ? "مشاهدة إجمالية" : "total views"}
                    </p>
                  </div>
                </div>

                <div className="page-hero-stat" style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(0,0,0,.25)", backdropFilter: "blur(8px)",
                  borderRadius: 12, padding: "8px 16px",
                  border: "1px solid rgba(255,255,255,.12)",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#FCD34D" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                    <polyline points="16 7 22 7 22 13"/>
                  </svg>
                  <div>
                    <p style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                      {allPosts.length}
                    </p>
                    <p style={{ margin: 0, fontSize: ".68rem", color: "rgba(255,255,255,.55)" }}>
                      {isAr ? "منشور في القائمة" : "posts ranked"}
                    </p>
                  </div>
                </div>

                {top3[0]?.view_count ? (
                  <div className="page-hero-stat" style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "rgba(251,191,36,.15)", backdropFilter: "blur(8px)",
                    borderRadius: 12, padding: "8px 16px",
                    border: "1px solid rgba(251,191,36,.25)",
                  }}>
                    <span style={{ fontSize: "1.1rem" }}>🥇</span>
                    <div>
                      <p style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#FCD34D", lineHeight: 1 }}>
                        {(top3[0].view_count).toLocaleString("ar-EG")}
                      </p>
                      <p style={{ margin: 0, fontSize: ".68rem", color: "rgba(255,255,255,.55)" }}>
                        {isAr ? "مشاهدة للأول" : "views for #1"}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Top 3 mini-ranking */}
              {top3.length > 0 && (
                <div style={{
                  display: "flex", flexDirection: "column", gap: 6,
                  background: "rgba(0,0,0,.2)", borderRadius: 12, padding: "12px 14px",
                  border: "1px solid rgba(255,255,255,.1)",
                }}>
                  <p style={{ margin: "0 0 6px", fontSize: ".7rem", fontWeight: 700, color: "rgba(255,255,255,.45)", letterSpacing: ".05em" }}>
                    {isAr ? "المراكز الثلاثة الأولى" : "TOP 3"}
                  </p>
                  {top3.map((post, i) => (
                    <div key={post.id} className="rank-item" style={{
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <span style={{ fontSize: "1rem", flexShrink: 0, lineHeight: 1 }}>{RANK_MEDAL[i]}</span>
                      <p style={{
                        margin: 0, fontSize: ".78rem", fontWeight: 600,
                        color: "rgba(255,255,255,.85)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        flex: 1,
                      }}>
                        {isAr ? post.title_ar : (post.title_en ?? post.title_ar)}
                      </p>
                      {post.view_count ? (
                        <span style={{
                          fontSize: ".7rem", color: "#FCD34D", fontWeight: 700,
                          flexShrink: 0, background: "rgba(251,191,36,.12)",
                          padding: "1px 8px", borderRadius: 8,
                        }}>
                          {post.view_count.toLocaleString("ar-EG")}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
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
              <p>{isAr ? "لا توجد منشورات بعد" : "No posts yet"}</p>
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
