import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import LatestFeedClient from "@/components/feed/LatestFeedClient";
import type { PostWithRelations, Category } from "@/lib/supabase/types";
import type { Metadata } from "next";

export const revalidate = 300; // 5 min

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "أحدث المنشورات | جمهرة" : "Latest Posts | Jamhara",
    description:
      locale === "ar"
        ? "أحدث ما نُشر على جمهرة مرتباً زمنياً"
        : "Latest posts on Jamhara in chronological order",
  };
}

function timeAgo(dateStr: string, isAr: boolean): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return isAr ? "الآن" : "just now";
  if (mins < 60) return isAr ? `منذ ${mins} د` : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return isAr ? `منذ ${hrs} س` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return isAr ? `منذ ${days} يوم` : `${days}d ago`;
}

export default async function LatestPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const supabase = await createClient();

  const [{ data: posts }, { data: categories }, { count: totalCount }] = await Promise.all([
    supabase
      .from("posts")
      .select(
        `*, type, chart_config, quiz_config, comparison_config, content_config,
         category:categories!posts_category_id_fkey(*),
         subcategory:categories!posts_subcategory_id_fkey(*),
         source:sources(*)`
      )
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(20),
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "published"),
  ]);

  const allCats = (categories ?? []) as Category[];
  const initialPosts = (posts ?? []) as PostWithRelations[];
  const total = totalCount ?? initialPosts.length;
  const newestTime = initialPosts[0]?.published_at
    ? timeAgo(initialPosts[0].published_at as string, isAr)
    : null;

  // unique types in latest batch
  const typeSet = [...new Set(initialPosts.slice(0, 10).map((p) => p.type))];
  const typeEmojis: Record<string, string> = {
    article:"✍️", chart:"📈", quiz:"🎯", comparison:"⚡", ranking:"🥇",
    numbers:"🔣", scenarios:"🌀", timeline:"⏳", factcheck:"🔍", profile:"🪪",
    briefing:"🗞️", quotes:"🗣️", explainer:"💡", debate:"🏛️", guide:"🧭",
    network:"🔗", interview:"🎙️", map:"🌍",
  };

  return (
    <div className="page-shell" style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <Header />
      <div className="page" style={{ flex: 1 }}>
        <Sidebar categories={allCats} />
        <main>

          {/* ══════════════════════════════════════
              HERO — أحدث المنشورات
          ══════════════════════════════════════ */}
          <div
            className="page-hero"
            style={{
              margin: "1rem 0 1.5rem",
              borderRadius: 18,
              overflow: "hidden",
              background: "linear-gradient(135deg, var(--navy) 0%, #2D3A5A 60%, #1a3a4a 100%)",
              position: "relative",
              boxShadow: "0 8px 32px rgba(55,60,85,.22)",
            }}
          >
            {/* Background grid pattern */}
            <div style={{
              position: "absolute", inset: 0, opacity: .06,
              backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(255,255,255,.5) 28px,rgba(255,255,255,.5) 29px), repeating-linear-gradient(90deg,transparent,transparent 28px,rgba(255,255,255,.5) 28px,rgba(255,255,255,.5) 29px)",
            }} />

            {/* Glow blob */}
            <div style={{
              position: "absolute", top: -40, left: -40,
              width: 200, height: 200, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(76,179,108,.35) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{ position: "relative", padding: "1.5rem 1.6rem 1.4rem" }}>

              {/* Live badge row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="live-dot" />
                  <span style={{
                    fontSize: ".72rem", fontWeight: 800, letterSpacing: ".08em",
                    color: "#EF4444", textTransform: "uppercase",
                    background: "rgba(239,68,68,.12)", padding: "2px 10px",
                    borderRadius: 20, border: "1px solid rgba(239,68,68,.3)",
                  }}>
                    {isAr ? "مباشر" : "LIVE"}
                  </span>
                  {newestTime && (
                    <span style={{ fontSize: ".73rem", color: "rgba(255,255,255,.5)" }}>
                      {isAr ? `آخر نشر ${newestTime}` : `Last published ${newestTime}`}
                    </span>
                  )}
                </div>

                {/* Big clock SVG */}
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(255,255,255,.15)" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>

              {/* Title */}
              <h1 style={{
                fontFamily: "var(--font-cairo)", fontSize: "1.55rem",
                fontWeight: 800, color: "#fff", margin: "0 0 .3rem",
                lineHeight: 1.2, letterSpacing: "-.02em",
              }}>
                {isAr ? "أحدث المنشورات" : "Latest Posts"}
              </h1>
              <p style={{
                fontSize: ".82rem", color: "rgba(255,255,255,.6)",
                margin: "0 0 1.2rem", lineHeight: 1.5,
              }}>
                {isAr
                  ? "جميع محتوى جمهرة مرتباً من الأحدث — يتجدد كل 5 دقائق"
                  : "All Jamhara content sorted newest first — refreshed every 5 min"}
              </p>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div className="page-hero-stat" style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(255,255,255,.1)", backdropFilter: "blur(8px)",
                  borderRadius: 12, padding: "8px 16px",
                  border: "1px solid rgba(255,255,255,.15)",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(255,255,255,.7)" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <div>
                    <p style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                      {total.toLocaleString("ar-EG")}
                    </p>
                    <p style={{ margin: 0, fontSize: ".68rem", color: "rgba(255,255,255,.55)" }}>
                      {isAr ? "منشور منشور" : "published posts"}
                    </p>
                  </div>
                </div>

                <div className="page-hero-stat" style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(76,179,108,.15)", backdropFilter: "blur(8px)",
                  borderRadius: 12, padding: "8px 16px",
                  border: "1px solid rgba(76,179,108,.25)",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#4CB36C" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                  <div>
                    <p style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#4CB36C", lineHeight: 1 }}>
                      {isAr ? "كل ٥ دقائق" : "Every 5 min"}
                    </p>
                    <p style={{ margin: 0, fontSize: ".68rem", color: "rgba(255,255,255,.55)" }}>
                      {isAr ? "دورة النشر التلقائية" : "auto publishing cycle"}
                    </p>
                  </div>
                </div>

                {typeSet.length > 0 && (
                  <div className="page-hero-stat" style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "rgba(255,255,255,.07)",
                    borderRadius: 12, padding: "8px 14px",
                    border: "1px solid rgba(255,255,255,.1)",
                  }}>
                    <span style={{ fontSize: ".7rem", color: "rgba(255,255,255,.5)", marginLeft: 2 }}>
                      {isAr ? "أبرز الأنواع" : "types"}
                    </span>
                    {typeSet.slice(0, 5).map((t) => (
                      <span key={t} title={t} style={{ fontSize: ".95rem", lineHeight: 1 }}>
                        {typeEmojis[t] ?? "📄"}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {initialPosts.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "4rem 1rem", color: "var(--muted)",
            }}>
              <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>📭</p>
              <p>{isAr ? "لا توجد منشورات بعد" : "No posts yet"}</p>
            </div>
          ) : (
            <LatestFeedClient initialPosts={initialPosts} locale={locale} />
          )}
        </main>
        <RightPanel locale={locale} />
      </div>
      <Footer locale={locale} />
      <MobileNav />
    </div>
  );
}
