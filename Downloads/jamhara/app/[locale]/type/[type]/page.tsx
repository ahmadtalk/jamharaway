import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import PostCard from "@/components/feed/PostCard";
import type { PostWithRelations, Category } from "@/lib/supabase/types";
import type { Metadata } from "next";

export const revalidate = 600;

// ── بيانات كل نوع ─────────────────────────────────────────────────────────────
const TYPE_INFO: Record<string, {
  nameAr: string; nameEn: string;
  icon: string;
  descAr: string; descEn: string;
  color: string;
}> = {
  article:    { nameAr: "مقالات",          nameEn: "Articles",     icon: "✍️",  color: "#3B6CC4", descAr: "مقالات تحريرية معمّقة حول أبرز القضايا",       descEn: "In-depth editorial articles on key topics" },
  chart:      { nameAr: "مخططات بيانية",   nameEn: "Charts",       icon: "📈",  color: "#2D7A46", descAr: "تصورات بيانية تشرح البيانات والأرقام",          descEn: "Visual charts explaining data and numbers" },
  quiz:       { nameAr: "اختبارات",         nameEn: "Quizzes",      icon: "🎯",  color: "#7C3AED", descAr: "اختبارات تفاعلية تختبر معرفتك",                 descEn: "Interactive quizzes to test your knowledge" },
  comparison: { nameAr: "مقارنات",          nameEn: "Comparisons",  icon: "⚡",  color: "#C05E1A", descAr: "مقارنات موضوعية بين الأشخاص والأفكار والظواهر",  descEn: "Objective comparisons between persons, ideas, and phenomena" },
  ranking:    { nameAr: "تصنيفات",          nameEn: "Rankings",     icon: "🥇",  color: "#D97706", descAr: "قوائم مرتبة بأهم الشخصيات والأحداث والمفاهيم",   descEn: "Ranked lists of key figures, events, and concepts" },
  numbers:    { nameAr: "أرقام",            nameEn: "Numbers",      icon: "🔣",  color: "#4338CA", descAr: "إنفوغرافيك رقمي يبرز الإحصاءات الأبرز",          descEn: "Numeric infographics highlighting key statistics" },
  scenarios:  { nameAr: "سيناريوهات",      nameEn: "Scenarios",    icon: "🌀",  color: "#BE185D", descAr: "تحليل السيناريوهات الممكنة لقضايا معقدة",         descEn: "Analysis of possible scenarios for complex issues" },
  timeline:   { nameAr: "خط زمني",         nameEn: "Timeline",     icon: "⏳",  color: "#0D9488", descAr: "تسلسل تاريخي للأحداث والتطورات",                descEn: "Historical sequence of events and developments" },
  factcheck:  { nameAr: "تدقيق حقائق",     nameEn: "Fact Check",   icon: "🔍",  color: "#DC2626", descAr: "فحص موضوعي لصحة الادعاءات والمعلومات المتداولة",  descEn: "Objective fact-checking of claims and circulating information" },
  profile:    { nameAr: "بروفايل",          nameEn: "Profiles",     icon: "🪪",  color: "#4338CA", descAr: "تعريف صحفي ثري بالشخصيات والمنظمات",             descEn: "Rich journalistic profiles of people and organizations" },
  briefing:   { nameAr: "موجز",             nameEn: "Briefings",    icon: "🗞️",  color: "#1D4ED8", descAr: "ملخص تنفيذي بأبرز النقاط حول قضية ما",           descEn: "Executive summaries of key points on an issue" },
  quotes:     { nameAr: "اقتباسات",         nameEn: "Quotes",       icon: "🗣️",  color: "#7C3AED", descAr: "أبرز ما قيل حول قضايا الساعة",                   descEn: "Notable quotes on current issues" },
  explainer:  { nameAr: "أسئلة شارحة",     nameEn: "Explainers",   icon: "💡",  color: "#16A34A", descAr: "أسئلة وأجوبة تشرح الموضوعات المعقدة",            descEn: "Q&A format explaining complex topics" },
  debate:     { nameAr: "مناظرات",          nameEn: "Debates",      icon: "🏛️",  color: "#C2410C", descAr: "عرض حجج التأييد والمعارضة حول قضايا خلافية",     descEn: "Pro/con arguments on controversial issues" },
  guide:      { nameAr: "خطوات عملية",      nameEn: "Guides",       icon: "🧭",  color: "#0891B2", descAr: "أدلة مرقّمة قابلة للتطبيق خطوة بخطوة",           descEn: "Numbered step-by-step actionable guides" },
  network:    { nameAr: "خريطة الصلات",     nameEn: "Networks",     icon: "🔗",  color: "#9333EA", descAr: "شبكة العلاقات بين الأطراف الرئيسية",             descEn: "Relationship maps between key entities" },
  interview:  { nameAr: "مقابلات",          nameEn: "Interviews",   icon: "🎙️",  color: "#D97706", descAr: "حوار صحفي أسلوب سؤال وجواب",                     descEn: "Journalistic Q&A interviews" },
  map:        { nameAr: "توزيع جغرافي",     nameEn: "Maps",         icon: "🌍",  color: "#059669", descAr: "مقارنة بيانات عبر الدول والمناطق",                descEn: "Data comparison across countries and regions" },
};

const VALID_TYPES = Object.keys(TYPE_INFO);

type Props = { params: Promise<{ locale: string; type: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, type } = await params;
  const info = TYPE_INFO[type];
  if (!info) return { title: "404" };
  const name = locale === "ar" ? info.nameAr : info.nameEn;
  return {
    title: locale === "ar" ? `${name} | جمهرة` : `${name} | Jamhara`,
  };
}

export default async function TypePage({ params }: Props) {
  const { locale, type } = await params;

  if (!VALID_TYPES.includes(type)) notFound();

  const info = TYPE_INFO[type];
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
      .eq("type", type)
      .order("published_at", { ascending: false })
      .limit(30),
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
  ]);

  const allCats = (categories ?? []) as Category[];
  const typePosts = (posts ?? []) as PostWithRelations[];
  const name = isAr ? info.nameAr : info.nameEn;
  const desc = isAr ? info.descAr : info.descEn;

  return (
    <div className="page-shell" style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <Header />
      <div className="page" style={{ flex: 1 }}>
        <Sidebar categories={allCats} />
        <main>
          {/* Type header */}
          <div style={{
            background: "var(--white)",
            border: "1px solid var(--slate2)",
            borderRadius: 14,
            padding: "1.25rem 1.25rem .875rem",
            borderTop: `3px solid ${info.color}`,
            marginBottom: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.6rem" }}>{info.icon}</span>
              <h1 style={{
                fontFamily: "var(--font-cairo)", fontSize: "1.2rem",
                fontWeight: 800, color: "var(--ink)", margin: 0, flex: 1,
              }}>
                {name}
              </h1>
              <span style={{
                fontSize: ".78rem", color: info.color,
                background: info.color + "14",
                border: `1px solid ${info.color}30`,
                padding: "2px 10px", borderRadius: 100, fontWeight: 600,
              }}>
                {typePosts.length} {isAr ? "منشور" : "posts"}
              </span>
            </div>
            <p style={{
              fontSize: ".82rem", color: "var(--muted)",
              margin: "8px 0 0", lineHeight: 1.6,
            }}>
              {desc}
            </p>
          </div>

          {/* Feed */}
          {typePosts.length === 0 ? (
            <div style={{
              background: "var(--white)", border: "1px solid var(--slate2)",
              borderRadius: 14, textAlign: "center", padding: "60px 20px",
              color: "var(--muted)",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>📭</div>
              <p style={{ fontFamily: "var(--font-cairo)", fontWeight: 700, color: "var(--ink)" }}>
                {isAr ? "لا توجد منشورات بعد" : "No posts yet"}
              </p>
            </div>
          ) : (
            <div className="feed">
              {typePosts.map((post, i) => (
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
