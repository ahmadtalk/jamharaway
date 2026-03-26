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

export const revalidate = 1800;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jamhara.vercel.app";
const SITE_NAME_AR = "جمهرة";
const SITE_NAME_EN = "Jamhara";

type Props = { params: Promise<{ locale: string; category: string }> };

// ── مساعد لبناء وصف SEO تلقائي ──────────────────────────────────────────────
function buildDescription(cat: { name_ar: string; name_en: string | null; post_count: number }, locale: string): string {
  const isAr = locale === "ar";
  const name = isAr ? cat.name_ar : (cat.name_en ?? cat.name_ar);
  const count = cat.post_count ?? 0;
  if (isAr) {
    return `استعرض ${count} منشوراً في قسم "${name}" على منصة جمهرة — مقالات وتحليلات ومخططات بيانية واختبارات تفاعلية موثوقة باللغة العربية.`;
  }
  return `Browse ${count} posts in the "${name}" section on Jamhara — trusted Arabic articles, analyses, charts, and quizzes.`;
}

// ── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug, locale } = await params;
  const supabase = await createClient();
  const { data: cat } = await supabase
    .from("categories")
    .select("name_ar, name_en, slug, color, post_count")
    .eq("slug", slug)
    .single();

  if (!cat) return { title: "404 | " + SITE_NAME_AR };

  const isAr = locale === "ar";
  const name = isAr ? cat.name_ar : (cat.name_en ?? cat.name_ar);
  const siteName = isAr ? SITE_NAME_AR : SITE_NAME_EN;
  const title = `${name} | ${siteName}`;
  const description = buildDescription(cat, locale);
  const canonicalUrl = isAr
    ? `${SITE_URL}/${slug}`
    : `${SITE_URL}/en/${slug}`;
  const alternateAr = `${SITE_URL}/${slug}`;
  const alternateEn = `${SITE_URL}/en/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: { ar: alternateAr, en: alternateEn },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      locale: isAr ? "ar_SA" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "@jamharacom",
    },
    robots: { index: true, follow: true },
  };
}

// ── JSON-LD ───────────────────────────────────────────────────────────────────
function buildJsonLd(
  cat: { name_ar: string; name_en: string | null; slug: string; post_count: number },
  locale: string,
  posts: { id: string; title_ar: string; title_en: string | null; published_at: string }[]
) {
  const isAr = locale === "ar";
  const name = isAr ? cat.name_ar : (cat.name_en ?? cat.name_ar);
  const siteName = isAr ? SITE_NAME_AR : SITE_NAME_EN;
  const baseUrl = isAr ? SITE_URL : `${SITE_URL}/en`;
  const catUrl = `${baseUrl}/${cat.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description: buildDescription(cat, locale),
    url: catUrl,
    inLanguage: isAr ? "ar" : "en",
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
      sameAs: [
        "https://x.com/jamharacom",
        "https://instagram.com/jamharacom",
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: cat.post_count ?? 0,
      itemListElement: posts.slice(0, 10).map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE_URL}/p/${p.id}`,
        name: isAr ? p.title_ar : (p.title_en ?? p.title_ar),
        datePublished: p.published_at,
      })),
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function CategoryPage({ params }: Props) {
  const { category: slug, locale } = await params;
  const supabase = await createClient();

  const [{ data: cat }, { data: categories }] = await Promise.all([
    supabase.from("categories").select("*").eq("slug", slug).single(),
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
  ]);

  if (!cat) notFound();
  const allCats = (categories ?? []) as Category[];

  const { data: posts } = await supabase
    .from("posts")
    .select(
      `*, type, chart_config, quiz_config, comparison_config, content_config,
       category:categories!posts_category_id_fkey(*),
       subcategory:categories!posts_subcategory_id_fkey(*),
       source:sources(*)`
    )
    .eq("status", "published")
    .eq("category_id", cat.id)
    .order("published_at", { ascending: false })
    .limit(30);

  const isAr = locale === "ar";
  const catName = isAr ? cat.name_ar : (cat.name_en ?? cat.name_ar);
  const typedPosts = (posts ?? []) as PostWithRelations[];
  const jsonLd = buildJsonLd(cat, locale, typedPosts);

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="page-shell" style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
        <Header />
        <div className="page" style={{ flex: 1 }}>
          <Sidebar categories={allCats} />
          <main>
            <div className="feed">
              {/* ── Category header ── */}
              <div style={{
                background: "var(--white)", border: "1px solid var(--slate2)",
                borderRadius: 14, padding: "1.25rem 1.25rem .875rem",
                borderTop: `3px solid ${cat.color ?? "var(--green)"}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    width: 12, height: 12, borderRadius: "50%",
                    background: cat.color ?? "var(--green)", flexShrink: 0,
                  }} />
                  {/* h1 — مهم لـ SEO */}
                  <h1 style={{
                    fontFamily: "var(--font-cairo)", fontSize: "1.2rem",
                    fontWeight: 800, color: "var(--ink)", margin: 0, flex: 1,
                  }}>
                    {catName}
                  </h1>
                  <span style={{
                    fontSize: ".78rem", color: "var(--muted)",
                    background: "var(--slate3)", padding: "2px 10px", borderRadius: 100,
                  }}>
                    {typedPosts.length} {isAr ? "منشور" : "posts"}
                  </span>
                </div>
                {/* وصف مختصر — يُحسّن الـ SEO On-Page */}
                <p style={{
                  fontSize: ".8rem", color: "var(--muted)",
                  margin: "8px 0 0", lineHeight: 1.6,
                }}>
                  {isAr
                    ? `أحدث المقالات والتحليلات في قسم ${catName} على جمهرة`
                    : `Latest articles and analyses in the ${catName} section on Jamhara`}
                </p>
              </div>

              {/* ── Posts ── */}
              {typedPosts.length === 0 ? (
                <div style={{
                  background: "var(--white)", border: "1px solid var(--slate2)",
                  borderRadius: 14, textAlign: "center", padding: "60px 20px",
                  color: "var(--muted)",
                }}>
                  <div style={{ fontSize: "2rem", marginBottom: 12 }}>📭</div>
                  <p style={{ fontFamily: "var(--font-cairo)", fontWeight: 700, color: "var(--ink)" }}>
                    {isAr ? "لا توجد منشورات بعد" : "No posts yet"}
                  </p>
                  <p style={{ fontSize: ".85rem", marginTop: 8 }}>
                    {isAr ? "سيُضاف محتوى هذا القسم قريبًا" : "Content coming soon"}
                  </p>
                </div>
              ) : (
                typedPosts.map((post, i) => (
                  <PostCard key={post.id} post={post} index={i} />
                ))
              )}
            </div>
          </main>
          <RightPanel locale={locale} />
        </div>
        <Footer locale={locale} />
        <MobileNav />
      </div>
    </>
  );
}
