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

  const allCats = (categories ?? []) as Category[];
  const allPosts = (posts ?? []) as PostWithRelations[];

  return (
    <div className="page-shell">
      <Header />
      <div className="main-wrap">
        <Sidebar categories={allCats} />
        <main className="main-col">
          {/* Page heading */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "1.25rem 0 1rem",
              borderBottom: "2px solid var(--slate3)",
              marginBottom: "1rem",
            }}
          >
            <span style={{ fontSize: "1.4rem" }}>🔥</span>
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-cairo)",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--ink)",
                  margin: 0,
                }}
              >
                {isAr ? "الأكثر قراءة" : "Most Read"}
              </h1>
              <p
                style={{
                  fontSize: ".78rem",
                  color: "var(--muted)",
                  margin: "2px 0 0",
                }}
              >
                {isAr
                  ? `أكثر ${allPosts.length} منشوراً قراءة على جمهرة`
                  : `Top ${allPosts.length} most-read posts on Jamhara`}
              </p>
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
