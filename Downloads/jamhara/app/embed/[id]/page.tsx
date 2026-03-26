import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { PostWithRelations, Category } from "@/lib/supabase/types";
import type { Metadata } from "next";
import { timeAgo } from "@/lib/utils";

import { EmbedProvider }       from "@/components/embed/EmbedProvider";
import BaseTarget               from "@/components/embed/BaseTarget";
import EmbedHeightReporter      from "@/components/embed/EmbedHeightReporter";

import ArticleCard    from "@/components/feed/ArticleCard";
import ChartCard      from "@/components/charts/ChartCard";
import QuizCard       from "@/components/quiz/QuizCard";
import ComparisonCard from "@/components/comparison/ComparisonCard";
import RankingCard    from "@/components/ranking/RankingCard";
import NumbersCard    from "@/components/numbers/NumbersCard";
import ScenariosCard  from "@/components/scenarios/ScenariosCard";
import TimelineCard   from "@/components/timeline/TimelineCard";
import FactCheckCard  from "@/components/factcheck/FactCheckCard";

export const revalidate = 3600;

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ locale?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts").select("title_ar, title_en").eq("id", id).single();
  return { title: data?.title_ar ?? "جمهرة" };
}

export default async function EmbedPage({ params, searchParams }: Props) {
  const { id }         = await params;
  const { locale: lp } = await searchParams;
  const locale         = (lp === "en" ? "en" : "ar") as "ar" | "en";
  const isAr           = locale === "ar";

  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select(`
      *,
      type, chart_config, quiz_config, comparison_config, content_config,
      category:categories!posts_category_id_fkey(*),
      subcategory:categories!posts_subcategory_id_fkey(*),
      source:sources(*)
    `)
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (!post) notFound();

  const p        = post as PostWithRelations;
  const category = p.category as Category | null | undefined;
  const title    = isAr ? p.title_ar : (p.title_en || p.title_ar);
  const body     = isAr ? p.body_ar  : (p.body_en  || p.body_ar);
  const timeStr  = timeAgo(p.published_at, locale);

  const parentCat = category
    ? { name_ar: category.name_ar, name_en: category.name_en, slug: category.slug, color: category.color }
    : undefined;
  const subCat = p.subcategory
    ? { name_ar: p.subcategory.name_ar, name_en: p.subcategory.name_en, slug: p.subcategory.slug }
    : undefined;

  const shared = {
    id: p.id, title, body: body ?? "",
    categoryName:  category ? (isAr ? category.name_ar : category.name_en) : undefined,
    categorySlug:  category?.slug,
    categoryColor: category?.color,
    likeCount:   p.like_count,
    publishedAt: p.published_at,
    locale, timeAgoStr: timeStr,
    isDetail: true as const,
    parentCat, subCat,
  };

  let card: React.ReactNode;

  if (p.type === "chart" && p.chart_config) {
    card = <ChartCard {...shared} config={p.chart_config} />;
  } else if (p.type === "quiz" && (p as any).quiz_config) {
    card = <QuizCard {...shared} config={(p as any).quiz_config} isDetail={true} />;
  } else if (p.type === "comparison" && (p as any).comparison_config) {
    card = <ComparisonCard {...shared} config={(p as any).comparison_config} isDetail={true} />;
  } else if (p.type === "ranking"   && (p as any).content_config) {
    card = <RankingCard   {...shared} config={(p as any).content_config} isDetail={true} />;
  } else if (p.type === "numbers"   && (p as any).content_config) {
    card = <NumbersCard   {...shared} config={(p as any).content_config} isDetail={true} />;
  } else if (p.type === "scenarios" && (p as any).content_config) {
    card = <ScenariosCard {...shared} config={(p as any).content_config} />;
  } else if (p.type === "timeline"  && (p as any).content_config) {
    card = <TimelineCard  {...shared} config={(p as any).content_config} isDetail={true} />;
  } else if (p.type === "factcheck" && (p as any).content_config) {
    card = <FactCheckCard {...shared} config={(p as any).content_config} isDetail={true} />;
  } else {
    card = <ArticleCard post={p} locale={locale} timeAgoStr={timeStr} isDetail={true} index={0} />;
  }

  return (
    <EmbedProvider>
      <BaseTarget />
      <EmbedHeightReporter />

      {/* Reset any globals.css constraints that could clip content */}
      <style>{`
        html, body {
          overflow: visible !important;
          height: auto !important;
          min-height: 0 !important;
          background: #fff !important;
        }
        .jcard {
          overflow: visible !important;
          margin-bottom: 0 !important;
        }
      `}</style>

      <div dir={isAr ? "rtl" : "ltr"}>
        {card}
      </div>
    </EmbedProvider>
  );
}
