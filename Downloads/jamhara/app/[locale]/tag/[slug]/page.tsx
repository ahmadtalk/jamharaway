import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import PostCard from "@/components/feed/PostCard";
import { slugToTag } from "@/lib/tags";
import type { PostWithRelations, Category } from "@/lib/supabase/types";
import type { Metadata } from "next";

export const revalidate = 300;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const tag = slugToTag(slug);
  return {
    title: locale === "ar" ? `${tag} | جمهرة` : `${tag} | Jamhara`,
    description:
      locale === "ar"
        ? `جميع المنشورات المتعلقة بـ "${tag}" على جمهرة`
        : `All posts about "${tag}" on Jamhara`,
    keywords: [tag],
  };
}

export default async function TagPage({ params }: Props) {
  const { locale, slug } = await params;
  const isAr = locale === "ar";
  const tag = slugToTag(slug);
  const supabase = await createClient();

  const [{ data: posts }, { data: categories }] = await Promise.all([
    supabase
      .from("posts")
      .select(
        `*, type, chart_config, quiz_config, comparison_config, content_config, tags, tags_en,
         category:categories!posts_category_id_fkey(*),
         subcategory:categories!posts_subcategory_id_fkey(*),
         source:sources(*)`
      )
      .eq("status", "published")
      .contains(isAr ? "tags" : "tags_en", [tag])
      .order("published_at", { ascending: false })
      .limit(50),
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
  ]);

  const allCats  = (categories ?? []) as Category[];
  const allPosts = (posts ?? []) as PostWithRelations[];

  return (
    <div className="page-shell" style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <Header />
      <div className="page" style={{ flex: 1 }}>
        <Sidebar categories={allCats} />
        <main>

          {/* HERO */}
          <div style={{
            margin: "1rem 0 1.5rem",
            borderRadius: 18,
            background: "linear-gradient(135deg, var(--navy) 0%, #2D7A46 100%)",
            padding: "1.4rem 1.6rem",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(45,122,70,.25)",
          }}>
            <div style={{
              position: "absolute", inset: 0, opacity: .04,
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,.9) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }} />
            <div style={{ position: "relative" }}>
              <span style={{
                display: "inline-block",
                fontSize: ".7rem", fontWeight: 800, letterSpacing: ".07em",
                color: "#86EFAC", background: "rgba(134,239,172,.12)",
                padding: "3px 12px", borderRadius: 20,
                border: "1px solid rgba(134,239,172,.25)",
                marginBottom: "1rem",
              }}>
                {isAr ? "🏷️ وسم" : "🏷️ TAG"}
              </span>
              <h1 style={{
                fontFamily: "var(--font-cairo)", fontSize: "1.7rem",
                fontWeight: 800, color: "#fff", margin: "0 0 .35rem",
                lineHeight: 1.2,
              }}>
                {tag}
              </h1>
              <p style={{ fontSize: ".82rem", color: "rgba(255,255,255,.55)", margin: 0 }}>
                {isAr
                  ? `${allPosts.length} منشور مرتبط بهذا الوسم`
                  : `${allPosts.length} posts tagged with this keyword`}
              </p>
            </div>
          </div>

          {allPosts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--muted)" }}>
              <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>🏷️</p>
              <p>{isAr ? "لا توجد منشورات بهذا الوسم بعد" : "No posts with this tag yet"}</p>
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
