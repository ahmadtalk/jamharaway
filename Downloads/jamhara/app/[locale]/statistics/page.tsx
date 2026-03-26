import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import type { Category } from "@/lib/supabase/types";
import type { Metadata } from "next";

export const revalidate = 300;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "إحصائيات جمهرة | جمهرة" : "Jamhara Statistics | Jamhara",
    description: locale === "ar"
      ? "أرقام وإحصاءات شاملة حول منصة جمهرة المعرفية"
      : "Comprehensive stats about the Jamhara knowledge platform",
  };
}

// أسماء أنواع المحتوى
const TYPE_NAMES: Record<string, { ar: string; en: string; emoji: string; color: string }> = {
  article:    { ar: "مقالات",         en: "Articles",     emoji: "✍️",  color: "#3B6CC4" },
  chart:      { ar: "مخططات",        en: "Charts",       emoji: "📈",  color: "#2D7A46" },
  quiz:       { ar: "اختبارات",       en: "Quizzes",      emoji: "🎯",  color: "#7C3AED" },
  comparison: { ar: "مقارنات",        en: "Comparisons",  emoji: "⚡",  color: "#C05E1A" },
  ranking:    { ar: "تصنيفات",        en: "Rankings",     emoji: "🥇",  color: "#D97706" },
  numbers:    { ar: "أرقام",          en: "Numbers",      emoji: "🔣",  color: "#4338CA" },
  scenarios:  { ar: "سيناريوهات",    en: "Scenarios",    emoji: "🌀",  color: "#BE185D" },
  timeline:   { ar: "خط زمني",       en: "Timeline",     emoji: "⏳",  color: "#0D9488" },
  factcheck:  { ar: "تدقيق حقائق",   en: "Fact Check",   emoji: "🔍",  color: "#DC2626" },
  profile:    { ar: "بروفايل",        en: "Profiles",     emoji: "🪪",  color: "#4338CA" },
  briefing:   { ar: "موجز",           en: "Briefings",    emoji: "🗞️",  color: "#1D4ED8" },
  quotes:     { ar: "اقتباسات",       en: "Quotes",       emoji: "🗣️",  color: "#7C3AED" },
  explainer:  { ar: "أسئلة شارحة",   en: "Explainers",   emoji: "💡",  color: "#16A34A" },
  debate:     { ar: "مناظرات",        en: "Debates",      emoji: "🏛️",  color: "#C2410C" },
  guide:      { ar: "خطوات عملية",   en: "Guides",       emoji: "🧭",  color: "#0891B2" },
  network:    { ar: "خريطة الصلات",  en: "Networks",     emoji: "🔗",  color: "#9333EA" },
  interview:  { ar: "مقابلات",        en: "Interviews",   emoji: "🎙️",  color: "#D97706" },
  map:        { ar: "توزيع جغرافي",  en: "Maps",         emoji: "🌍",  color: "#059669" },
};

function fmt(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export default async function StatisticsPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const supabase = await createClient();

  // جلب جميع البيانات
  const [
    { data: posts },
    { data: categories },
    { data: topPosts },
  ] = await Promise.all([
    supabase.from("posts").select("type, published_at, category_id").eq("status", "published"),
    supabase.from("categories").select("*").eq("is_active", true).is("parent_id", null).order("sort_order"),
    supabase.from("posts")
      .select("id, title_ar, title_en, type, view_count, published_at")
      .eq("status", "published")
      .order("view_count", { ascending: false })
      .limit(10),
  ]);

  const allPosts = posts ?? [];
  const allCats = (categories ?? []) as Category[];

  // إحصاءات عامة
  const totalPosts = allPosts.length;
  const totalSections = allCats.length;

  // توزيع حسب النوع
  const typeCounts: Record<string, number> = {};
  for (const p of allPosts) {
    typeCounts[p.type ?? "article"] = (typeCounts[p.type ?? "article"] ?? 0) + 1;
  }
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  const maxTypeCount = sortedTypes[0]?.[1] ?? 1;

  // توزيع حسب التصنيف
  const catCountMap: Record<string, number> = {};
  for (const p of allPosts) {
    if (p.category_id) catCountMap[p.category_id] = (catCountMap[p.category_id] ?? 0) + 1;
  }

  // المنشورات هذا الشهر
  const now = Date.now();
  const month = allPosts.filter(p => p.published_at && now - new Date(p.published_at).getTime() < 30 * 86400000).length;

  // البطاقات الإحصائية الرئيسية
  const MAIN_STATS = [
    { numAr: fmt(totalPosts),       numEn: fmt(totalPosts),       labelAr: "إجمالي المنشورات", labelEn: "Total Posts",   color: "#2D7A46", bg: "#E8F6ED", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" },
    { numAr: String(totalSections), numEn: String(totalSections), labelAr: "التصنيفات",         labelEn: "Sections",       color: "#7C3AED", bg: "#F5F3FF", icon: "M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
    { numAr: String(month),         numEn: String(month),         labelAr: "منشورات هذا الشهر", labelEn: "This Month",     color: "#0891B2", bg: "#E0F7FA", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  ];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jamhara.vercel.app";

  return (
    <div className="page-shell" style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <Header />

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: isAr ? "إحصائيات جمهرة" : "Jamhara Statistics",
        url: `${siteUrl}${isAr ? "" : "/en"}/statistics`,
        publisher: { "@type": "Organization", name: isAr ? "جمهرة" : "Jamhara", url: siteUrl },
      })}} />

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
                {isAr ? "📊 إحصائيات جمهرة" : "📊 Jamhara Statistics"}
              </h1>
              <p style={{ color: "var(--muted)", fontSize: ".88rem", margin: 0 }}>
                {isAr ? "أرقام شاملة حول المحتوى والتفاعل على المنصة" : "Comprehensive platform content and engagement numbers"}
              </p>
            </div>

            {/* ── البطاقات الرئيسية ── */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12, marginBottom: 28,
            }}>
              {MAIN_STATS.map((s) => (
                <div key={s.labelAr} style={{
                  background: "#fff", border: "1px solid var(--slate2)",
                  borderRadius: 14, padding: "1.1rem 1rem",
                  display: "flex", flexDirection: "column", gap: 10,
                }}>
                  <span style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: s.bg, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill={s.color}>
                      <path d={s.icon} />
                    </svg>
                  </span>
                  <div>
                    <div style={{
                      fontFamily: "var(--font-cairo)", fontWeight: 900,
                      fontSize: "1.75rem", color: s.color, lineHeight: 1,
                    }}>
                      {isAr ? s.numAr : s.numEn}
                    </div>
                    <div style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: 4, fontWeight: 600 }}>
                      {isAr ? s.labelAr : s.labelEn}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── توزيع أنواع المحتوى ── */}
            <div style={{
              background: "#fff", border: "1px solid var(--slate2)",
              borderRadius: 14, padding: "1.25rem", marginBottom: 20,
            }}>
              <h2 style={{
                fontFamily: "var(--font-cairo)", fontSize: ".95rem",
                fontWeight: 800, color: "var(--ink)", margin: "0 0 1rem",
              }}>
                {isAr ? "توزيع المحتوى حسب النوع" : "Content by Type"}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sortedTypes.map(([type, count]) => {
                  const info = TYPE_NAMES[type];
                  const pct = Math.round((count / maxTypeCount) * 100);
                  return (
                    <Link
                      key={type}
                      href={isAr ? `/type/${type}` : `/en/type/${type}`}
                      style={{ textDecoration: "none" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{
                          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                          background: (info?.color ?? "#4CB36C") + "15",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: ".9rem",
                        }}>
                          {info?.emoji ?? "📄"}
                        </span>
                        <span style={{ width: 86, flexShrink: 0, fontSize: ".78rem", color: "var(--ink)", fontWeight: 600 }}>
                          {isAr ? (info?.ar ?? type) : (info?.en ?? type)}
                        </span>
                        <div style={{ flex: 1, height: 7, borderRadius: 100, background: "var(--slate3)", overflow: "hidden" }}>
                          <div style={{
                            width: `${pct}%`, height: "100%", borderRadius: 100,
                            background: info?.color ?? "var(--green)",
                            transition: "width .4s ease",
                          }} />
                        </div>
                        <span style={{ width: 28, textAlign: "start", fontSize: ".78rem", color: "var(--muted)", fontWeight: 700, flexShrink: 0 }}>
                          {count}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ── توزيع حسب التصنيف ── */}
            <div style={{
              background: "#fff", border: "1px solid var(--slate2)",
              borderRadius: 14, padding: "1.25rem", marginBottom: 20,
            }}>
              <h2 style={{
                fontFamily: "var(--font-cairo)", fontSize: ".95rem",
                fontWeight: 800, color: "var(--ink)", margin: "0 0 1rem",
              }}>
                {isAr ? "المنشورات حسب التصنيف" : "Posts by Category"}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {allCats.filter(c => (catCountMap[c.id] ?? 0) > 0).sort((a, b) => (catCountMap[b.id] ?? 0) - (catCountMap[a.id] ?? 0)).map((cat) => {
                  const count = catCountMap[cat.id] ?? 0;
                  const maxCat = Math.max(...allCats.map(c => catCountMap[c.id] ?? 0));
                  const pct = Math.round((count / maxCat) * 100);
                  const icon = (cat as { icon?: string | null }).icon;
                  return (
                    <Link
                      key={cat.id}
                      href={isAr ? `/${cat.slug}` : `/en/${cat.slug}`}
                      style={{ textDecoration: "none" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 22, flexShrink: 0, fontSize: ".95rem", textAlign: "center" }}>
                          {icon || "📂"}
                        </span>
                        <span style={{ width: 100, flexShrink: 0, fontSize: ".78rem", color: "var(--ink)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {isAr ? cat.name_ar : (cat.name_en ?? cat.name_ar)}
                        </span>
                        <div style={{ flex: 1, height: 8, borderRadius: 100, background: "var(--slate3)", overflow: "hidden" }}>
                          <div style={{
                            width: `${pct}%`, height: "100%", borderRadius: 100,
                            background: cat.color ?? "var(--green)",
                          }} />
                        </div>
                        <span style={{ width: 28, fontSize: ".78rem", color: "var(--muted)", fontWeight: 700, flexShrink: 0 }}>
                          {count}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ── أكثر المنشورات مشاهدة ── */}
            {topPosts && topPosts.length > 0 && (
              <div style={{
                background: "#fff", border: "1px solid var(--slate2)",
                borderRadius: 14, padding: "1.25rem",
              }}>
                <h2 style={{
                  fontFamily: "var(--font-cairo)", fontSize: ".95rem",
                  fontWeight: 800, color: "var(--ink)", margin: "0 0 1rem",
                }}>
                  {isAr ? "🔥 الأكثر مشاهدة" : "🔥 Most Viewed"}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {topPosts.map((post, i) => (
                    <Link
                      key={post.id}
                      href={isAr ? `/p/${post.id}` : `/en/p/${post.id}`}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 0",
                        borderBottom: i < topPosts.length - 1 ? "1px solid var(--slate3)" : "none",
                        textDecoration: "none",
                      }}
                    >
                      <span style={{
                        width: 24, height: 24, borderRadius: "50%",
                        background: i < 3 ? ["#E8534A","#E07B2A","#C9A820"][i] : "var(--slate3)",
                        color: i < 3 ? "#fff" : "var(--muted)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: ".72rem", fontWeight: 800, flexShrink: 0,
                      }}>
                        {i + 1}
                      </span>
                      <span style={{
                        flex: 1, fontSize: ".82rem", color: "var(--ink)", fontWeight: 500,
                        display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {isAr ? post.title_ar : (post.title_en ?? post.title_ar)}
                      </span>
                      <span style={{
                        fontSize: ".72rem", color: "var(--muted)", flexShrink: 0,
                        display: "flex", alignItems: "center", gap: 3,
                      }}>
                        <svg width="11" height="11" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M1 10S4 4 10 4s9 6 9 6-3 6-9 6-9-6-9-6z"/>
                          <circle cx="10" cy="10" r="2.5"/>
                        </svg>
                        {fmt(post.view_count ?? 0)}
                      </span>
                    </Link>
                  ))}
                </div>
                <div style={{ marginTop: 12, textAlign: "center" }}>
                  <Link
                    href={isAr ? "/most-read" : "/en/most-read"}
                    style={{ fontSize: ".78rem", color: "var(--green-deep)", fontWeight: 700, textDecoration: "none" }}
                  >
                    {isAr ? "عرض كل الأكثر قراءة ←" : "View All Most Read →"}
                  </Link>
                </div>
              </div>
            )}

            {/* نشرة هذا الشهر */}
            <div style={{
              marginTop: 20,
              background: "linear-gradient(135deg, var(--green-light), #fff)",
              border: "1px solid var(--green-light)",
              borderRadius: 14, padding: "1.25rem",
              display: "flex", alignItems: "center", gap: 16,
            }}>
              <span style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: "var(--green-light)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="22" height="22" viewBox="0 0 20 20" fill="var(--green-deep)">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </span>
              <div>
                <div style={{ fontFamily: "var(--font-cairo)", fontWeight: 800, color: "var(--ink)", fontSize: ".95rem" }}>
                  {isAr ? `${month} منشوراً خلال الـ 30 يوماً الماضية` : `${month} posts in the last 30 days`}
                </div>
                <div style={{ fontSize: ".78rem", color: "var(--muted)", marginTop: 2 }}>
                  {isAr ? `إجمالي ${totalPosts} منشور على المنصة` : `${totalPosts} total posts on the platform`}
                </div>
              </div>
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
