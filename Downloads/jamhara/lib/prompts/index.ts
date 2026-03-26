/**
 * lib/prompts/index.ts — مخزن البرومبتات المركزي
 * ──────────────────────────────────────────────────
 * نقطة التصدير الوحيدة لجميع بُناة البرومبتات.
 * لتعديل أي برومبت: افتح lib/prompts/types/[type].ts فقط.
 * لتعديل قواعد البحث أو المصادر: lib/prompts/shared/sources.ts
 *
 * الاستخدام في الـ routes:
 *   import { buildDebatePrompt } from "@/lib/prompts";
 *   const prompt = buildDebatePrompt({ topic, categorySlug });
 */

// ── Shared blocks (للاستخدام المباشر عند الحاجة) ─────────────────────────────
export { SOURCE_INSTRUCTION }           from "./shared/sources";
export { JAMHARA_EDITOR, DATA_ANALYST, FACT_CHECKER, EDUCATION_EXPERT } from "./shared/persona";
export { JSON_OUTPUT_RULES }            from "./shared/json-rules";

// ── Type builders ─────────────────────────────────────────────────────────────
export { buildArticlePrompt }           from "./types/article";
export type { ArticlePromptParams }     from "./types/article";

export { buildChartPrompt, buildChartTypeInstruction, CHART_LABELS } from "./types/chart";
export type { ChartPromptParams }       from "./types/chart";

export { buildQuizPrompt }              from "./types/quiz";
export type { QuizPromptParams }        from "./types/quiz";

export { buildComparisonPrompt }        from "./types/comparison";
export type { ComparisonPromptParams }  from "./types/comparison";

export { buildRankingPrompt }           from "./types/ranking";
export type { RankingPromptParams }     from "./types/ranking";

export { buildNumbersPrompt }           from "./types/numbers";
export type { NumbersPromptParams }     from "./types/numbers";

export { buildScenariosPrompt }         from "./types/scenarios";
export type { ScenariosPromptParams }   from "./types/scenarios";

export { buildTimelinePrompt }          from "./types/timeline";
export type { TimelinePromptParams }    from "./types/timeline";

export { buildFactcheckPrompt }         from "./types/factcheck";
export type { FactcheckPromptParams }   from "./types/factcheck";

export { buildProfilePrompt }           from "./types/profile";
export type { ProfilePromptParams }     from "./types/profile";

export { buildBriefingPrompt }          from "./types/briefing";
export type { BriefingPromptParams }    from "./types/briefing";

export { buildQuotesPrompt }            from "./types/quotes";
export type { QuotesPromptParams }      from "./types/quotes";

export { buildExplainerPrompt }         from "./types/explainer";
export type { ExplainerPromptParams }   from "./types/explainer";

export { buildDebatePrompt }            from "./types/debate";
export type { DebatePromptParams }      from "./types/debate";

export { buildGuidePrompt }             from "./types/guide";
export type { GuidePromptParams }       from "./types/guide";

export { buildNetworkPrompt }           from "./types/network";
export type { NetworkPromptParams }     from "./types/network";

export { buildInterviewPrompt }         from "./types/interview";
export type { InterviewPromptParams }   from "./types/interview";

export { buildMapPrompt }               from "./types/map";
export type { MapPromptParams }         from "./types/map";
