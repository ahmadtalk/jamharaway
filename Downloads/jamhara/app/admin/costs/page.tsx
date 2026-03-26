import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { CostsPageClient } from "@/components/admin/CostsPageClient";

export const dynamic = "force-dynamic";

// ── Pricing constants ─────────────────────────────────────────────────────────
// Claude Haiku 4.5
const HAIKU_INPUT_PER_M  = 0.80;   // $0.80 per million input tokens
const HAIKU_OUTPUT_PER_M = 4.00;   // $4.00 per million output tokens
// Anthropic web_search_20250305 built-in tool
const WEB_SEARCH_PRICE   = 0.01;   // $0.01 per search call
const AVG_SEARCHES_PER_NON_ARTICLE = 2; // conservative avg (max_uses: 3)
// Replicate Flux Schnell
const REPLICATE_PER_IMAGE = 0.003; // ~$0.003 per image
// Token estimates per post type
const ARTICLE_INPUT  = 700;   // generation + quality check
const ARTICLE_OUTPUT = 650;
const OTHER_INPUT    = 1200;  // more complex prompts + search results
const OTHER_OUTPUT   = 900;

function estimateCost(
  articles: number,
  nonArticles: number,
  images: number
) {
  const articleTokenCost =
    ((articles * ARTICLE_INPUT  * HAIKU_INPUT_PER_M) +
     (articles * ARTICLE_OUTPUT * HAIKU_OUTPUT_PER_M)) / 1_000_000;

  const otherTokenCost =
    ((nonArticles * OTHER_INPUT  * HAIKU_INPUT_PER_M) +
     (nonArticles * OTHER_OUTPUT * HAIKU_OUTPUT_PER_M)) / 1_000_000;

  const webSearchCost =
    nonArticles * AVG_SEARCHES_PER_NON_ARTICLE * WEB_SEARCH_PRICE;

  const replicateCost = images * REPLICATE_PER_IMAGE;

  return { articleTokenCost, otherTokenCost, webSearchCost, replicateCost };
}

export default async function CostsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // ── Posts breakdown ──────────────────────────────────────────────────────
  const { data: postsData } = await supabase
    .from("posts")
    .select("type, image_url, created_at")
    .eq("status", "published");

  const posts = postsData ?? [];
  const articlePosts   = posts.filter((p) => p.type === "article").length;
  const nonArticlePosts = posts.filter((p) => p.type !== "article").length;
  const postsWithImages = posts.filter((p) => p.image_url).length;
  const totalPosts = posts.length;

  // ── Generation jobs ──────────────────────────────────────────────────────
  const { data: jobsData } = await supabase
    .from("generation_jobs")
    .select("status, cost_usd, created_at, posts_generated");

  const jobs = jobsData ?? [];
  const totalJobs   = jobs.filter((j) => j.status === "done").length;
  const totalFailed = jobs.filter((j) => j.status === "failed").length;
  const trackedCost = jobs.reduce((s, j) => s + (j.cost_usd ?? 0), 0);

  // ── Cost estimation ──────────────────────────────────────────────────────
  const costs = estimateCost(articlePosts, nonArticlePosts, postsWithImages);
  const estimatedTotal =
    costs.articleTokenCost + costs.otherTokenCost +
    costs.webSearchCost    + costs.replicateCost;

  // For tracked jobs (cost_usd > 0), use actual; rest estimated
  // Note: tracked cost only covers article token cost (that's what we track)
  const anthropicEstimated = costs.articleTokenCost + costs.otherTokenCost;
  const totalEstimated     = estimatedTotal;

  // ── This month ────────────────────────────────────────────────────────────
  const monthStart = new Date();
  monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

  const thisMonthPosts = posts.filter((p) => new Date(p.created_at) >= monthStart).length;
  const thisMonthArticles    = posts.filter((p) => p.type === "article"  && new Date(p.created_at) >= monthStart).length;
  const thisMonthNonArticles = posts.filter((p) => p.type !== "article"  && new Date(p.created_at) >= monthStart).length;
  const thisMonthImages      = posts.filter((p) => p.image_url && new Date(p.created_at) >= monthStart).length;

  const monthCosts = estimateCost(thisMonthArticles, thisMonthNonArticles, thisMonthImages);
  const thisMonthCost = monthCosts.articleTokenCost + monthCosts.otherTokenCost +
                        monthCosts.webSearchCost + monthCosts.replicateCost;

  // ── Daily breakdown (last 30 days) ────────────────────────────────────────
  const dailyMap: Record<string, { articles: number; others: number; images: number }> = {};
  const since30 = new Date(); since30.setDate(since30.getDate() - 29);

  posts.filter((p) => new Date(p.created_at) >= since30).forEach((p) => {
    const day = p.created_at.slice(0, 10);
    if (!dailyMap[day]) dailyMap[day] = { articles: 0, others: 0, images: 0 };
    if (p.type === "article") dailyMap[day].articles++;
    else dailyMap[day].others++;
    if (p.image_url) dailyMap[day].images++;
  });

  const dailyData: { date: string; anthropic: number; webSearch: number; replicate: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const day = dailyMap[key] ?? { articles: 0, others: 0, images: 0 };
    const dc = estimateCost(day.articles, day.others, day.images);
    dailyData.push({
      date: key.slice(5),
      anthropic : Math.round((dc.articleTokenCost + dc.otherTokenCost) * 10000) / 10000,
      webSearch : Math.round(dc.webSearchCost * 10000) / 10000,
      replicate : Math.round(dc.replicateCost * 10000) / 10000,
    });
  }

  return (
    <AdminShell title="التكاليف" userEmail={user.email}>
      <CostsPageClient
        totalPosts={totalPosts}
        articlePosts={articlePosts}
        nonArticlePosts={nonArticlePosts}
        postsWithImages={postsWithImages}
        totalJobs={totalJobs}
        totalFailed={totalFailed}
        trackedCost={trackedCost}
        totalEstimated={totalEstimated}
        anthropicEstimated={anthropicEstimated}
        webSearchEstimated={costs.webSearchCost}
        replicateEstimated={costs.replicateCost}
        thisMonthCost={thisMonthCost}
        thisMonthPosts={thisMonthPosts}
        dailyData={dailyData}
      />
    </AdminShell>
  );
}
