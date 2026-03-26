import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import MobileNav from "@/components/layout/MobileNav";
import PostCard from "@/components/feed/PostCard";
import ArticleCard from "@/components/feed/ArticleCard";
import type { PostWithRelations, Category } from "@/lib/supabase/types";
import type { Metadata } from "next";
import ChartCard from "@/components/charts/ChartCard";
import QuizCard from "@/components/quiz/QuizCard";
import ComparisonCard from "@/components/comparison/ComparisonCard";
import RankingCard from "@/components/ranking/RankingCard";
import NumbersCard from "@/components/numbers/NumbersCard";
import ScenariosCard from "@/components/scenarios/ScenariosCard";
import TimelineCard from "@/components/timeline/TimelineCard";
import FactCheckCard from "@/components/factcheck/FactCheckCard";
import ProfileCard from "@/components/profile/ProfileCard";
import BriefingCard from "@/components/briefing/BriefingCard";
import QuotesCard from "@/components/quotes/QuotesCard";
import ExplainerCard from "@/components/explainer/ExplainerCard";
import DebateCard from "@/components/debate/DebateCard";
import GuideCard from "@/components/guide/GuideCard";
import NetworkCard from "@/components/network/NetworkCard";
import InterviewCard from "@/components/interview/InterviewCard";
import MapCard from "@/components/map/MapCard";
import { timeAgo, fmt } from "@/lib/utils";
import EmbedResizer from "@/components/embed/EmbedResizer";
import ViewTracker from "@/components/shared/ViewTracker";

export const revalidate = 3600;

function formatFullDate(dateStr: string | null, locale: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-GB", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(d);
  } catch {
    return dateStr;
  }
}

function calcReadingTime(text: string | null, locale: string): string {
  if (!text) return "—";
  const words = text.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return locale === "ar" ? `${mins} دق` : `${mins} min`;
}

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts").select("title_ar, title_en, body_ar, body_en, image_url").eq("id", id).single();
  if (!post) return { title: "404" };
  const title = locale === "ar" ? post.title_ar : (post.title_en || post.title_ar);
  const description = (locale === "ar" ? post.body_ar : (post.body_en || post.body_ar))?.slice(0, 160);
  const postUrl = `https://jamhara.vercel.app${locale === "en" ? "/en" : ""}/p/${id}`;
  return {
    title, description,
    openGraph: { title, description, images: post.image_url ? [post.image_url] : [], type: "article" },
    alternates: {
      types: { "application/json+oembed": `https://jamhara.vercel.app/api/oembed?url=${encodeURIComponent(postUrl)}` },
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { id, locale } = await params;
  const supabase = await createClient();
  const isAr = locale === "ar";

  const [{ data: post }, { data: categories }] = await Promise.all([
    supabase.from("posts")
      .select("*, type, chart_config, quiz_config, category:categories!posts_category_id_fkey(*), subcategory:categories!posts_subcategory_id_fkey(*), source:sources(*)")
      .eq("id", id).eq("status", "published").single(),
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
  ]);

  if (!post) notFound();
  const p = post as PostWithRelations;
  const allCats = (categories ?? []) as Category[];
  const title = isAr ? p.title_ar : (p.title_en || p.title_ar);
  const body  = isAr ? p.body_ar  : (p.body_en  || p.body_ar);
  const category = p.category as Category | null | undefined;

  // Shared category props for JCardShell-based cards
  const parentCatProp = category
    ? { name_ar: category.name_ar, name_en: category.name_en, slug: category.slug, color: category.color }
    : undefined;
  const subCatProp = p.subcategory
    ? { name_ar: p.subcategory.name_ar, name_en: p.subcategory.name_en, slug: p.subcategory.slug }
    : undefined;

  // Quiz post
  if (p.type === "quiz" && (p as any).quiz_config) {
    const { data: relatedQuiz } = await supabase
      .from("posts")
      .select("*, type, chart_config, quiz_config, category:categories!posts_category_id_fkey(*), subcategory:categories!posts_subcategory_id_fkey(*), source:sources(*)")
      .eq("status", "published").eq("category_id", p.category_id ?? "").neq("id", id)
      .order("published_at", { ascending: false }).limit(3);


    return (
      <div className="page-shell">
        <EmbedResizer />
        <ViewTracker postId={id} />
        <Header />
        <div className="page">
          <Sidebar categories={allCats} />
          <main>
            <QuizCard
              id={p.id}
              title={title}
              config={(p as any).quiz_config}
              categoryName={category ? (isAr ? category.name_ar : category.name_en) : undefined}
              categorySlug={category?.slug}
              categoryColor={category?.color}
              likeCount={p.like_count}
              publishedAt={p.published_at}
              locale={locale as "ar" | "en"}
              timeAgoStr={timeAgo(p.published_at, locale as "ar" | "en")}
              isDetail={true}
              parentCat={parentCatProp}
              subCat={subCatProp}
            />
            {relatedQuiz && relatedQuiz.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="feed-hdr" style={{ marginBottom: 12 }}>
                  <span className="feed-hdr-title">{isAr ? "منشورات ذات صلة" : "Related Posts"}</span>
                </div>
                <div className="feed">
                  {(relatedQuiz as PostWithRelations[]).map((rp, i) => (
                    <PostCard key={rp.id} post={rp} index={i} />
                  ))}
                </div>
              </div>
            )}
          </main>
          <RightPanel locale={locale} />
        </div>
        <MobileNav />
      </div>
    );
  }

  // Comparison post
  if (p.type === "comparison" && (p as any).comparison_config) {
    const { data: relatedComp } = await supabase
      .from("posts")
      .select("*, type, chart_config, quiz_config, comparison_config, category:categories!posts_category_id_fkey(*), subcategory:categories!posts_subcategory_id_fkey(*), source:sources(*)")
      .eq("status", "published").eq("category_id", p.category_id ?? "").neq("id", id)
      .order("published_at", { ascending: false }).limit(3);


    return (
      <div className="page-shell">
        <EmbedResizer />
        <ViewTracker postId={id} />
        <Header />
        <div className="page">
          <Sidebar categories={allCats} />
          <main>
            <ComparisonCard
              id={p.id}
              title={title}
              body={body ?? ""}
              config={(p as any).comparison_config}
              categoryName={category ? (isAr ? category.name_ar : category.name_en) : undefined}
              categorySlug={category?.slug}
              categoryColor={category?.color}
              likeCount={p.like_count}
              publishedAt={p.published_at}
              locale={locale as "ar" | "en"}
              timeAgoStr={timeAgo(p.published_at, locale as "ar" | "en")}
              isDetail={true}
              parentCat={parentCatProp}
              subCat={subCatProp}
            />
            {relatedComp && relatedComp.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="feed-hdr" style={{ marginBottom: 12 }}>
                  <span className="feed-hdr-title">{isAr ? "منشورات ذات صلة" : "Related Posts"}</span>
                </div>
                <div className="feed">
                  {(relatedComp as PostWithRelations[]).map((rp, i) => (
                    <PostCard key={rp.id} post={rp} index={i} />
                  ))}
                </div>
              </div>
            )}
          </main>
          <RightPanel locale={locale} />
        </div>
        <MobileNav />
      </div>
    );
  }

  // ── New content types (ranking, numbers, scenarios, timeline, factcheck, profile) ──
  const newTypes = ["ranking","numbers","scenarios","timeline","factcheck","profile","briefing","quotes","explainer","debate","guide","network","interview","map"] as const;
  if (newTypes.includes(p.type as typeof newTypes[number]) && (p as any).content_config) {
    const cc = (p as any).content_config;
    const { data: relatedNew } = await supabase
      .from("posts")
      .select("*, type, chart_config, quiz_config, comparison_config, content_config, category:categories!posts_category_id_fkey(*), subcategory:categories!posts_subcategory_id_fkey(*), source:sources(*)")
      .eq("status","published").eq("category_id", p.category_id ?? "").neq("id", id)
      .order("published_at",{ ascending:false }).limit(3);


    const sharedProps = {
      id:p.id, title, body:body??"",
      categoryName: category ? (isAr ? category.name_ar : category.name_en) : undefined,
      categorySlug: category?.slug, categoryColor: category?.color,
      likeCount: p.like_count, publishedAt: p.published_at,
      locale: locale as "ar"|"en",
      timeAgoStr: timeAgo(p.published_at, locale as "ar"|"en"),
      isDetail: true,
      parentCat: parentCatProp,
      subCat: subCatProp,
    };

    const CardComponent =
      p.type === "ranking"   ? <RankingCard   {...sharedProps} config={cc}/> :
      p.type === "numbers"   ? <NumbersCard   {...sharedProps} config={cc}/> :
      p.type === "scenarios" ? <ScenariosCard {...sharedProps} config={cc}/> :
      p.type === "timeline"  ? <TimelineCard  {...sharedProps} config={cc}/> :
      p.type === "profile"   ? <ProfileCard   {...sharedProps} config={cc}/> :
      p.type === "briefing"  ? <BriefingCard  {...sharedProps} config={cc}/> :
      p.type === "quotes"    ? <QuotesCard    {...sharedProps} config={cc}/> :
      p.type === "explainer" ? <ExplainerCard {...sharedProps} config={cc}/> :
      p.type === "debate"    ? <DebateCard    {...sharedProps} config={cc}/> :
      p.type === "guide"     ? <GuideCard     {...sharedProps} config={cc}/> :
      p.type === "network"   ? <NetworkCard   {...sharedProps} config={cc}/> :
      p.type === "interview" ? <InterviewCard {...sharedProps} config={cc}/> :
      p.type === "map"       ? <MapCard       {...sharedProps} config={cc}/> :
                               <FactCheckCard {...sharedProps} config={cc}/>;

    return (
      <div className="page-shell">
        <EmbedResizer />
        <ViewTracker postId={id} />
        <Header />
        <div className="page">
          <Sidebar categories={allCats} />
          <main>
            {CardComponent}
            {relatedNew && relatedNew.length > 0 && (
              <div style={{ marginTop:16 }}>
                <div className="feed-hdr" style={{ marginBottom:12 }}>
                  <span className="feed-hdr-title">{isAr?"منشورات ذات صلة":"Related Posts"}</span>
                </div>
                <div className="feed">
                  {(relatedNew as PostWithRelations[]).map((rp,i) => (
                    <PostCard key={rp.id} post={rp} index={i}/>
                  ))}
                </div>
              </div>
            )}
          </main>
          <RightPanel locale={locale}/>
        </div>
        <MobileNav/>
      </div>
    );
  }

  // Chart post — use ChartCard for consistent display
  if (p.type === "chart" && p.chart_config) {
    const { data: relatedChart } = await supabase
      .from("posts")
      .select("*, type, chart_config, quiz_config, category:categories!posts_category_id_fkey(*), subcategory:categories!posts_subcategory_id_fkey(*), source:sources(*)")
      .eq("status", "published").eq("category_id", p.category_id ?? "").neq("id", id)
      .order("published_at", { ascending: false }).limit(3);


    return (
      <div className="page-shell">
        <EmbedResizer />
        <ViewTracker postId={id} />
        <Header />
        <div className="page">
          <Sidebar categories={allCats} />
          <main>
            <ChartCard
              id={p.id}
              title={title}
              config={p.chart_config}
              categoryName={category ? (isAr ? category.name_ar : category.name_en) : undefined}
              categorySlug={category?.slug}
              categoryColor={category?.color}
              likeCount={p.like_count}
              publishedAt={p.published_at}
              locale={locale as "ar" | "en"}
              timeAgoStr={timeAgo(p.published_at, locale as "ar" | "en")}
              isDetail={true}
              body={body}
              parentCat={parentCatProp}
              subCat={subCatProp}
            />
            {relatedChart && relatedChart.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="feed-hdr" style={{ marginBottom: 12 }}>
                  <span className="feed-hdr-title">{isAr ? "منشورات ذات صلة" : "Related Posts"}</span>
                </div>
                <div className="feed">
                  {(relatedChart as PostWithRelations[]).map((rp, i) => (
                    <PostCard key={rp.id} post={rp} index={i} />
                  ))}
                </div>
              </div>
            )}
          </main>
          <RightPanel locale={locale} />
        </div>
        <MobileNav />
      </div>
    );
  }

  const { data: related } = await supabase
    .from("posts")
    .select("*, type, chart_config, quiz_config, category:categories!posts_category_id_fkey(*), subcategory:categories!posts_subcategory_id_fkey(*), source:sources(*)")
    .eq("status", "published").eq("category_id", p.category_id ?? "").neq("id", id)
    .order("published_at", { ascending: false }).limit(3);


  return (
    <div className="page-shell">
      <EmbedResizer />
      <ViewTracker postId={id} />
      <Header />
      <div className="page">
        <Sidebar categories={allCats} />
        <main>
          {/* Article card — same JCardShell as in the feed */}
          <ArticleCard
            post={p}
            locale={locale as "ar" | "en"}
            timeAgoStr={timeAgo(p.published_at, locale as "ar" | "en")}
            isDetail={true}
            index={0}
          />

          {/* ── Analytics / Insights Box ─────────────────────────── */}
          <div style={{
            marginTop: 10,
            padding: "1rem 1.25rem",
            background: "var(--slate3, #f5f5f5)",
            borderRadius: 12,
            border: "1px solid var(--slate2, #e8e8e8)",
          }}>
            <p style={{
              fontSize: ".68rem", fontWeight: 700, color: "var(--muted)",
              letterSpacing: ".06em", textTransform: "uppercase", marginBottom: ".85rem",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M2 10h3l3-7 4 14 3-7h3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isAr ? "إحصاءات المنشور" : "Post Analytics"}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: ".6rem .75rem" }}>

              {/* Published at */}
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontSize: ".62rem", color: "var(--muted2)", fontWeight: 500 }}>
                  {isAr ? "تاريخ النشر" : "Published"}
                </span>
                <span style={{ fontSize: ".8rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1.3 }}>
                  {formatFullDate(p.published_at, locale)}
                </span>
              </div>

              {/* Views */}
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontSize: ".62rem", color: "var(--muted2)", fontWeight: 500 }}>
                  {isAr ? "مشاهدات" : "Views"}
                </span>
                <span style={{ fontSize: ".9rem", fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M1 10S4 4 10 4s9 6 9 6-3 6-9 6-9-6-9-6z"/>
                    <circle cx="10" cy="10" r="2.5"/>
                  </svg>
                  {fmt(p.view_count ?? 0)}
                </span>
              </div>

              {/* Likes */}
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontSize: ".62rem", color: "var(--muted2)", fontWeight: 500 }}>
                  {isAr ? "إعجابات" : "Likes"}
                </span>
                <span style={{ fontSize: ".9rem", fontWeight: 700, color: "var(--rust, #C0392B)", display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" stroke="none">
                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
                  </svg>
                  {fmt(p.like_count ?? 0)}
                </span>
              </div>

              {/* Shares */}
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontSize: ".62rem", color: "var(--muted2)", fontWeight: 500 }}>
                  {isAr ? "مشاركات" : "Shares"}
                </span>
                <span style={{ fontSize: ".9rem", fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47A3 3 0 1015 12"/>
                  </svg>
                  {fmt(p.share_count ?? 0)}
                </span>
              </div>

              {/* Reading time */}
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontSize: ".62rem", color: "var(--muted2)", fontWeight: 500 }}>
                  {isAr ? "وقت القراءة" : "Read time"}
                </span>
                <span style={{ fontSize: ".9rem", fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5" strokeLinecap="round"/>
                  </svg>
                  {calcReadingTime(isAr ? p.body_ar : (p.body_en ?? p.body_ar), locale)}
                </span>
              </div>

            </div>
          </div>
          {/* ──────────────────────────────────────────────────────── */}

          {/* Related posts */}
          {related && related.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="feed-hdr" style={{ marginBottom: 12 }}>
                <span className="feed-hdr-title">{isAr ? "منشورات ذات صلة" : "Related Posts"}</span>
              </div>
              <div className="feed">
                {(related as PostWithRelations[]).map((rp, i) => (
                  <PostCard key={rp.id} post={rp} index={i} />
                ))}
              </div>
            </div>
          )}
        </main>
        <RightPanel locale={locale} />
      </div>
      <MobileNav />
    </div>
  );
}
