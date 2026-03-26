import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import PostCard from "@/components/feed/PostCard";
import Link from "next/link";
import type { PostWithRelations, Category } from "@/lib/supabase/types";
import type { Metadata } from "next";

export const revalidate = 600;

// أنواع المحتوى المتقدمة (كل ما عدا article, chart, quiz, comparison, profile, numbers)
const ADVANCED_TYPES = [
  "ranking", "scenarios", "timeline", "factcheck",
  "briefing", "quotes", "explainer", "debate",
  "guide", "network", "interview", "map",
] as const;

// بيانات العرض لكل نوع
const TYPE_META: Record<string, { nameAr: string; nameEn: string; icon: string; color: string }> = {
  ranking:   { nameAr: "تصنيفات",       nameEn: "Rankings",    icon: "🥇",  color: "#D97706" },
  scenarios: { nameAr: "سيناريوهات",   nameEn: "Scenarios",   icon: "🌀",  color: "#BE185D" },
  timeline:  { nameAr: "خط زمني",      nameEn: "Timeline",    icon: "⏳",  color: "#0D9488" },
  factcheck: { nameAr: "تدقيق حقائق",  nameEn: "Fact Check",  icon: "🔍",  color: "#DC2626" },
  briefing:  { nameAr: "موجز",          nameEn: "Briefings",   icon: "🗞️",  color: "#1D4ED8" },
  quotes:    { nameAr: "اقتباسات",      nameEn: "Quotes",      icon: "🗣️",  color: "#7C3AED" },
  explainer: { nameAr: "أسئلة شارحة",  nameEn: "Explainers",  icon: "💡",  color: "#16A34A" },
  debate:    { nameAr: "مناظرات",       nameEn: "Debates",     icon: "🏛️",  color: "#C2410C" },
  guide:     { nameAr: "خطوات عملية",   nameEn: "Guides",      icon: "🧭",  color: "#0891B2" },
  network:   { nameAr: "خريطة الصلات",  nameEn: "Networks",    icon: "🔗",  color: "#9333EA" },
  interview: { nameAr: "مقابلات",       nameEn: "Interviews",  icon: "🎙️",  color: "#D97706" },
  map:       { nameAr: "توزيع جغرافي",  nameEn: "Maps",        icon: "🌍",  color: "#059669" },
};

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "محتوى متقدم | جمهرة" : "Advanced Content | Jamhara",
    description:
      locale === "ar"
        ? "اكتشف قوالب المحتوى المتقدمة: تصنيفات، سيناريوهات، خطوط زمنية، مناظرات، خرائط صلات والمزيد"
        : "Explore advanced content formats: rankings, scenarios, timelines, debates, network maps and more",
  };
}

export default async function AdvancedPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const supabase = await createClient();

  const [{ data: posts, count: trueTotal }, { data: categories }, ...typeCounts] = await Promise.all([
    supabase
      .from("posts")
      .select(
        `*, type, chart_config, quiz_config, comparison_config, content_config,
         category:categories!posts_category_id_fkey(*),
         subcategory:categories!posts_subcategory_id_fkey(*),
         source:sources(*)`,
        { count: "exact" }
      )
      .eq("status", "published")
      .in("type", [...ADVANCED_TYPES])
      .order("published_at", { ascending: false })
      .limit(200),
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
    // عدد حقيقي لكل نوع من DB
    ...ADVANCED_TYPES.map((t) =>
      supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("status", "published")
        .eq("type", t)
    ),
  ]);

  const allCats = (categories ?? []) as Category[];
  const allPosts = (posts ?? []) as PostWithRelations[];

  // عدد حقيقي لكل نوع (من DB مباشرة)
  const trueByTypeCount = ADVANCED_TYPES.reduce((acc, t, i) => {
    acc[t] = (typeCounts[i] as { count: number | null }).count ?? 0;
    return acc;
  }, {} as Record<string, number>);

  const totalCount = trueTotal ?? allPosts.length;

  return (
    <div className="page-shell" style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <Header />
      <div className="page" style={{ flex: 1 }}>
        <Sidebar categories={allCats} />
        <main>

          {/* ── Page header ── */}
          <div style={{
            background: "var(--white)",
            border: "1px solid var(--slate2)",
            borderRadius: 14,
            padding: "1.25rem 1.25rem 1rem",
            borderTop: "3px solid #6366F1",
            marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.6rem" }}>⚡</span>
              <div style={{ flex: 1 }}>
                <h1 style={{
                  fontFamily: "var(--font-cairo)", fontSize: "1.2rem",
                  fontWeight: 800, color: "var(--ink)", margin: 0,
                }}>
                  {isAr ? "محتوى متقدم" : "Advanced Content"}
                </h1>
                <p style={{ fontSize: ".8rem", color: "var(--muted)", margin: "3px 0 0", lineHeight: 1.5 }}>
                  {isAr
                    ? "قوالب إخبارية ثرية: تصنيفات، سيناريوهات، مناظرات، خرائط صلات، مقابلات والمزيد"
                    : "Rich journalistic formats: rankings, scenarios, debates, networks, interviews and more"}
                </p>
              </div>
              <span style={{
                fontSize: ".78rem", color: "#6366F1",
                background: "#6366F114", border: "1px solid #6366F130",
                padding: "2px 10px", borderRadius: 100, fontWeight: 600, flexShrink: 0,
              }}>
                {totalCount} {isAr ? "منشور" : "posts"}
              </span>
            </div>

            {/* أزرار تصفية سريعة */}
            <div style={{
              display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14,
            }}>
              {ADVANCED_TYPES.filter((t) => trueByTypeCount[t] > 0).map((t) => {
                const m = TYPE_META[t];
                return (
                  <Link
                    key={t}
                    href={isAr ? `/type/${t}` : `/en/type/${t}`}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "3px 10px", borderRadius: 100, fontSize: ".73rem", fontWeight: 600,
                      background: m.color + "14", color: m.color,
                      border: `1px solid ${m.color}30`,
                      textDecoration: "none",
                    }}
                  >
                    <span>{m.icon}</span>
                    {isAr ? m.nameAr : m.nameEn}
                    <span style={{
                      background: m.color + "22", borderRadius: 100,
                      padding: "0 5px", fontSize: ".65rem",
                    }}>
                      {trueByTypeCount[t]}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── Feed مختلط ── */}
          {allPosts.length === 0 ? (
            <div style={{
              background: "var(--white)", border: "1px solid var(--slate2)",
              borderRadius: 14, textAlign: "center", padding: "60px 20px", color: "var(--muted)",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>📭</div>
              <p style={{ fontFamily: "var(--font-cairo)", fontWeight: 700, color: "var(--ink)" }}>
                {isAr ? "لا توجد منشورات بعد" : "No posts yet"}
              </p>
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
