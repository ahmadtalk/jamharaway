"use client";

import { useLocale } from "next-intl";
import type { PostWithRelations } from "@/lib/supabase/types";
import { timeAgo } from "@/lib/utils";
import ArticleCard from "./ArticleCard";
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
import NewsCard from "@/components/news/NewsCard";

interface Props {
  post: PostWithRelations;
  index?: number;
}

export default function PostCard({ post, index = 0 }: Props) {
  const locale = useLocale() as "ar" | "en";

  const title    = locale === "ar" ? post.title_ar : (post.title_en || post.title_ar);
  const body     = locale === "ar" ? post.body_ar  : (post.body_en  || post.body_ar);
  const timeStr  = timeAgo(post.published_at, locale);

  // Build shared category props
  const parentCat = post.category
    ? {
        name_ar: post.category.name_ar,
        name_en: post.category.name_en,
        slug: post.category.slug,
        color: post.category.color,
      }
    : undefined;

  const subCat = post.subcategory
    ? {
        name_ar: post.subcategory.name_ar,
        name_en: post.subcategory.name_en,
        slug: post.subcategory.slug,
      }
    : undefined;

  // Legacy props for backward compat
  const categoryName  = post.category ? (locale === "ar" ? post.category.name_ar : post.category.name_en) : undefined;
  const categorySlug  = post.category?.slug;
  const categoryColor = post.category?.color;

  // Shared base props for all non-article cards
  const sharedProps = {
    id: post.id,
    title,
    body: body ?? "",
    categoryName,
    categorySlug,
    categoryColor,
    likeCount: post.like_count,
    publishedAt: post.published_at,
    locale,
    timeAgoStr: timeStr,
    isDetail: false as const,
    parentCat,
    subCat,
    tags: post.tags ?? [],
  };

  // ── Chart ────────────────────────────────────────────────────────────────
  if (post.type === "chart" && post.chart_config) {
    return (
      <ChartCard
        {...sharedProps}
        config={post.chart_config}
        body={locale === "en" && post.body_en ? post.body_en : post.body_ar}
      />
    );
  }

  // ── Quiz ─────────────────────────────────────────────────────────────────
  if (post.type === "quiz" && (post as any).quiz_config) {
    return (
      <QuizCard
        {...sharedProps}
        config={(post as any).quiz_config}
      />
    );
  }

  // ── Comparison ───────────────────────────────────────────────────────────
  if (post.type === "comparison" && (post as any).comparison_config) {
    return (
      <ComparisonCard
        {...sharedProps}
        config={(post as any).comparison_config}
      />
    );
  }

  // ── New content types ────────────────────────────────────────────────────
  const cc = (post as any).content_config;

  if (post.type === "ranking"   && cc) return <RankingCard   {...sharedProps} config={cc} />;
  if (post.type === "numbers"   && cc) return <NumbersCard   {...sharedProps} config={cc} />;
  if (post.type === "scenarios" && cc) return <ScenariosCard {...sharedProps} config={cc} />;
  if (post.type === "timeline"  && cc) return <TimelineCard  {...sharedProps} config={cc} />;
  if (post.type === "factcheck" && cc) return <FactCheckCard {...sharedProps} config={cc} />;
  if (post.type === "profile"   && cc) return <ProfileCard   {...sharedProps} config={cc} />;
  if (post.type === "briefing"  && cc) return <BriefingCard  {...sharedProps} config={cc} />;
  if (post.type === "quotes"    && cc) return <QuotesCard    {...sharedProps} config={cc} />;
  if (post.type === "explainer" && cc) return <ExplainerCard {...sharedProps} config={cc} />;
  if (post.type === "debate"    && cc) return <DebateCard    {...sharedProps} config={cc} />;
  if (post.type === "guide"     && cc) return <GuideCard     {...sharedProps} config={cc} />;
  if (post.type === "network"   && cc) return <NetworkCard   {...sharedProps} config={cc} />;
  if (post.type === "interview" && cc) return <InterviewCard {...sharedProps} config={cc} />;
  if (post.type === "map"       && cc) return <MapCard       {...sharedProps} config={cc} />;

  // ── News ─────────────────────────────────────────────────────────────────
  if (post.type === "news") return <NewsCard post={post} locale={locale} timeAgoStr={timeStr} isDetail={false} index={index} />;

  // ── Article (default) ────────────────────────────────────────────────────
  return (
    <ArticleCard
      post={post}
      locale={locale}
      timeAgoStr={timeStr}
      isDetail={false}
      index={index}
    />
  );
}
