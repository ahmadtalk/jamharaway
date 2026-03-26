import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import PostCard from "@/components/feed/PostCard";
import HomeHero from "@/components/feed/HomeHero";
import type { PostWithRelations, Category } from "@/lib/supabase/types";
import type { Metadata } from "next";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "جمهرة | المعرفة الموثوقة" : "Jamhara | Reliable Knowledge",
  };
}

async function getData() {
  const supabase = await createClient();
  const [{ data: posts }, { data: categories }, { count }] = await Promise.all([
    supabase
      .from("posts")
      .select(`*, type, chart_config, quiz_config, comparison_config, content_config, category:categories!posts_category_id_fkey(*), subcategory:categories!posts_subcategory_id_fkey(*), source:sources(*)`)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(20),
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
  ]);
  return {
    posts:      (posts ?? []) as PostWithRelations[],
    categories: (categories ?? []) as Category[],
    totalPosts: count ?? 0,
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { posts, categories, totalPosts } = await getData();
  const lastPublishedAt = (posts[0]?.published_at as string | null | undefined) ?? null;

  return (
    <div className="page-shell" style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <Header />

      <div className="page" style={{ flex: 1 }}>
        <Sidebar categories={categories} />

        <main>
          <HomeHero
            totalPosts={totalPosts}
            lastPublishedAt={lastPublishedAt}
            locale={locale}
          />

          <div className="feed">
            {posts.length === 0 ? (
              <EmptyFeed locale={locale} />
            ) : (
              posts.map((post, i) => (
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
  );
}

function EmptyFeed({ locale }: { locale: string }) {
  return (
    <div style={{ background: "var(--white)", borderRadius: 14, border: "1px solid var(--slate2)", textAlign: "center", padding: "80px 20px", color: "var(--muted)" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>📚</div>
      <p style={{ fontFamily: "var(--font-cairo)", fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)" }}>
        {locale === "ar" ? "المنشورات قادمة قريبًا" : "Posts coming soon"}
      </p>
      <p style={{ fontSize: ".875rem", marginTop: 8 }}>
        {locale === "ar" ? "نعمل على تجميع أفضل المعرفة الموثوقة" : "We're curating the best reliable knowledge"}
      </p>
    </div>
  );
}
