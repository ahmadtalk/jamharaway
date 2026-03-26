export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface ChartSeries {
  name: string;
  color?: string;
  seriesType?: "bar" | "line" | "area";
  data: Array<{ x: string | number; y: number; z?: number; label?: string }>;
}

export interface ChartAnnotation {
  x: string | number;
  label: string;
  color?: string;
}

export interface StatCard {
  label: string;
  value: string | number;
  unit?: string;
}

export interface ChartConfig {
  chartType: "line" | "bar" | "area" | "pie" | "donut" | "scatter" | "radar" | "composed" | "bar-horizontal" | "bar-stacked" | "bar-100" | "area-stacked" | "treemap" | "funnel" | "radialbar";
  series: ChartSeries[];
  xAxis?: { label?: string; type?: "category" | "number" };
  yAxis?: { label?: string; unit?: string };
  annotations?: ChartAnnotation[];
  stats?: StatCard[];
  source?: string;
  sourceUrl?: string;
}

// ─── Quiz Types ───────────────────────────────────────────────────────────────
export type QuizType = "mcq" | "true_false" | "timeline" | "matching" | "guess_who" | "speed";

export interface MCQQuestion {
  type: "mcq";
  question_ar: string;
  question_en: string;
  options_ar: string[];
  options_en: string[];
  correct_index: number;
  explanation_ar: string;
  explanation_en: string;
}

export interface TrueFalseQuestion {
  type: "true_false";
  statement_ar: string;
  statement_en: string;
  is_true: boolean;
  explanation_ar: string;
  explanation_en: string;
}

export interface TimelineEvent {
  id: string;
  label_ar: string;
  label_en: string;
  order: number; // 1-based correct position
  year?: string;
}

export interface TimelineQuestion {
  type: "timeline";
  instruction_ar: string;
  instruction_en: string;
  events: TimelineEvent[];
}

export interface MatchingPair {
  id: string;
  left_ar: string;
  left_en: string;
  right_ar: string;
  right_en: string;
}

export interface MatchingQuestion {
  type: "matching";
  instruction_ar: string;
  instruction_en: string;
  pairs: MatchingPair[];
}

export interface GuessWhoQuestion {
  type: "guess_who";
  hints_ar: string[];
  hints_en: string[];
  options_ar: string[];
  options_en: string[];
  correct_index: number;
  explanation_ar: string;
  explanation_en: string;
}

export interface SpeedQuestion {
  type: "speed";
  question_ar: string;
  question_en: string;
  options_ar: string[];
  options_en: string[];
  correct_index: number;
  time_limit: number;
  explanation_ar: string;
  explanation_en: string;
}

// Backward-compat: old MCQ without type field
export interface LegacyMCQQuestion {
  question_ar: string;
  question_en: string;
  options_ar: string[];
  options_en: string[];
  correct_index: number;
  explanation_ar: string;
  explanation_en: string;
}

export type AnyQuizQuestion =
  | MCQQuestion
  | TrueFalseQuestion
  | TimelineQuestion
  | MatchingQuestion
  | GuessWhoQuestion
  | SpeedQuestion
  | LegacyMCQQuestion;

export interface QuizConfig {
  quiz_type?: QuizType;
  questions: AnyQuizQuestion[];
  difficulty?: "easy" | "medium" | "hard";
  source?: string;
  sourceUrl?: string;
}

// ─── Comparison Types ─────────────────────────────────────────────────────────

export type ComparisonType = "bars" | "matrix" | "profile" | "timeline_duel" | "stance" | "spectrum";

/** الكيان الأساسي — مشترك بين كل الأنواع */
export interface ComparisonEntity {
  name_ar: string;
  name_en: string;
  emoji?: string;
  color?: string;
  summary_ar?: string;
  summary_en?: string;
}

// ── bars ──────────────────────────────────────────────────────────────────────
export interface ComparisonDimension {
  name_ar: string;
  name_en: string;
  score_a: number;   // 0–100
  score_b: number;   // 0–100
  note_ar?: string;
  note_en?: string;
}

// ── matrix ────────────────────────────────────────────────────────────────────
/** القيمة: "yes" | "no" | "partial" | نص حر */
export interface MatrixFeature {
  name_ar: string;
  name_en: string;
  value_a: string;
  value_b: string;
  note_ar?: string;
  note_en?: string;
}

// ── profile ───────────────────────────────────────────────────────────────────
export interface ProfileStat {
  label_ar: string;
  label_en: string;
  value: string;
}

export interface ProfileEntity extends ComparisonEntity {
  subtitle_ar?: string;
  subtitle_en?: string;
  stats: ProfileStat[];          // 4–6 إحصاءات
  highlight_ar?: string;         // إنجاز بارز
  highlight_en?: string;
  tags_ar?: string[];
  tags_en?: string[];
}

// ── timeline_duel ─────────────────────────────────────────────────────────────
export interface TimelineDuelPoint {
  label: string;       // السنة أو الفترة
  value_a: number;
  value_b: number;
}

// ── stance ────────────────────────────────────────────────────────────────────
export interface StanceTopic {
  topic_ar: string;
  topic_en: string;
  stance_a_ar: string;
  stance_a_en: string;
  stance_b_ar: string;
  stance_b_en: string;
}

// ── spectrum ──────────────────────────────────────────────────────────────────
export interface SpectrumAxis {
  name_ar: string;
  name_en: string;
  min_label_ar: string;
  min_label_en: string;
  max_label_ar: string;
  max_label_en: string;
  position_a: number;   // 0–100
  position_b: number;   // 0–100
  note_ar?: string;
  note_en?: string;
}

// ── Unified config ────────────────────────────────────────────────────────────
export interface ComparisonConfig {
  comparison_type?: ComparisonType;     // defaults to "bars"
  entity_a: ComparisonEntity | ProfileEntity;
  entity_b: ComparisonEntity | ProfileEntity;
  // bars
  dimensions?: ComparisonDimension[];
  // matrix
  features?: MatrixFeature[];
  // timeline_duel
  unit_ar?: string;
  unit_en?: string;
  data_points?: TimelineDuelPoint[];
  // stance
  topics?: StanceTopic[];
  // spectrum
  axes?: SpectrumAxis[];
  // shared
  source?: string;
  sourceUrl?: string;
}

// ─── Ranking Types ────────────────────────────────────────────────────────────

export interface RankingItem {
  rank: number;
  name_ar: string;
  name_en: string;
  value: string | number;
  unit_ar?: string;
  unit_en?: string;
  note_ar?: string;
  note_en?: string;
  emoji?: string;
  change?: "up" | "down" | "same";
  change_amount?: number;
}

export interface RankingConfig {
  metric_ar: string;
  metric_en: string;
  items: RankingItem[];       // 5–20 عنصر
  source?: string;
  sourceUrl?: string;
}

// ─── Numbers Types ────────────────────────────────────────────────────────────

export interface NumberStat {
  number: string;             // الرقم البارز: "4.8 مليار" أو "92%"
  label_ar: string;
  label_en: string;
  context_ar?: string;        // جملة سياق واحدة
  context_en?: string;
  icon?: string;              // emoji
  color?: string;             // hex لون اختياري
}

export interface NumbersConfig {
  stats: NumberStat[];        // 5–10 إحصاءات
  source?: string;
  sourceUrl?: string;
}

// ─── Scenarios Types ──────────────────────────────────────────────────────────

export type ScenarioTone = "optimistic" | "realistic" | "pessimistic";

export interface ScenarioItem {
  tone: ScenarioTone;
  title_ar: string;
  title_en: string;
  probability?: string;       // "30%" اختياري
  conditions_ar: string[];    // شروط التحقق
  conditions_en: string[];
  outcome_ar: string;         // جملة النتيجة
  outcome_en: string;
}

export interface ScenariosConfig {
  question_ar: string;        // "ماذا سيحدث إذا..."
  question_en: string;
  horizon_ar?: string;        // "خلال 5 سنوات"
  horizon_en?: string;
  scenarios: ScenarioItem[];  // 3 سيناريوهات بالضبط
  source?: string;
  sourceUrl?: string;
}

// ─── Timeline Post Types ───────────────────────────────────────────────────────
// (مختلف عن TimelineEvent الخاص بالاختبارات)

export type TimelineEventType = "milestone" | "crisis" | "innovation" | "discovery" | "default";

export interface TimelinePostEvent {
  year: string;
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  type?: TimelineEventType;
  emoji?: string;
}

export interface TimelinePostConfig {
  events: TimelinePostEvent[];  // 8–15 حدث
  source?: string;
  sourceUrl?: string;
}

// ─── Fact Check Types ─────────────────────────────────────────────────────────

export type FactVerdict = "true" | "false" | "misleading" | "partial" | "unverified";

export interface FactCheckClaim {
  claim_ar: string;
  claim_en: string;
  verdict: FactVerdict;
  explanation_ar: string;
  explanation_en: string;
  sources?: string[];
}

export interface FactCheckConfig {
  claims: FactCheckClaim[];   // 4–8 ادعاءات
  source?: string;
  sourceUrl?: string;
}

// ─── Profile Post Types ────────────────────────────────────────────────────────

export type ProfileSubjectType = "person" | "organization" | "country" | "movement" | "other";

export interface ProfilePostQuickFact {
  icon: string;
  label_ar: string;
  label_en: string;
  value_ar: string;
  value_en: string;
}

export interface ProfilePostStat {
  icon?: string;
  label_ar: string;
  label_en: string;
  value: string;
  unit?: string;
}

export interface ProfilePostTimelineItem {
  year: string;
  event_ar: string;
  event_en: string;
  type?: "milestone" | "award" | "crisis" | "founding" | "death" | "other";
}

export interface ProfilePostSection {
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
}

export interface ProfilePostConfig {
  subject_type: ProfileSubjectType;
  full_name_ar: string;
  full_name_en: string;
  known_as_ar?: string;
  known_as_en?: string;
  tagline_ar?: string;
  tagline_en?: string;
  avatar_emoji: string;
  avatar_color: string;
  image_url?: string;
  quick_facts: ProfilePostQuickFact[];
  stats?: ProfilePostStat[];
  timeline?: ProfilePostTimelineItem[];
  sections?: ProfilePostSection[];
  tags_ar?: string[];
  tags_en?: string[];
  source?: string;
  sourceUrl?: string;
}

// ─── Briefing Types ────────────────────────────────────────────────────────
export interface BriefingKeyPoint {
  text_ar: string;
  text_en: string;
  icon?: string;
}
export interface BriefingFeaturedQuote {
  text_ar: string;
  text_en: string;
  author_ar: string;
  author_en: string;
  role_ar?: string;
  role_en?: string;
}
export interface BriefingKeyNumber {
  value: string;
  label_ar: string;
  label_en: string;
  icon?: string;
}
export interface BriefingConfig {
  key_points: BriefingKeyPoint[];       // 5-7 نقاط
  featured_quote?: BriefingFeaturedQuote;
  key_numbers?: BriefingKeyNumber[];    // 3-4 أرقام
  bottom_line_ar?: string;
  bottom_line_en?: string;
  source?: string;
  sourceUrl?: string;
}

// ─── Quotes Types ──────────────────────────────────────────────────────────
export type QuoteSentiment = "positive" | "negative" | "neutral" | "warning";
export interface QuoteItem {
  text_ar: string;
  text_en: string;
  author_ar: string;
  author_en: string;
  role_ar?: string;
  role_en?: string;
  date?: string;
  sentiment?: QuoteSentiment;
}
export interface QuotesConfig {
  topic_ar: string;
  topic_en: string;
  quotes: QuoteItem[];                  // 5-8 اقتباسات
  source?: string;
  sourceUrl?: string;
}

// ─── Explainer Types ───────────────────────────────────────────────────────
export interface ExplainerQuestion {
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
  icon?: string;
}
export interface ExplainerConfig {
  intro_ar?: string;
  intro_en?: string;
  questions: ExplainerQuestion[];       // 6-10 أسئلة
  source?: string;
  sourceUrl?: string;
}

// ─── Debate Types ──────────────────────────────────────────────────────────
export interface DebateArgument {
  point_ar: string;
  point_en: string;
}
export interface DebateSide {
  label_ar: string;
  label_en: string;
  emoji?: string;
  color?: string;
  arguments: DebateArgument[];          // 4-5 حجج
  summary_ar?: string;
  summary_en?: string;
}
export interface DebateConfig {
  question_ar: string;
  question_en: string;
  side_a: DebateSide;
  side_b: DebateSide;
  verdict_ar?: string;
  verdict_en?: string;
  source?: string;
  sourceUrl?: string;
}

// ─── Guide Types ────────────────────────────────────────────────────────────

export interface GuideStep {
  step: number;
  icon?: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  duration_ar?: string;
  duration_en?: string;
  warning_ar?: string;
  warning_en?: string;
}

export interface GuideConfig {
  goal_ar: string;
  goal_en: string;
  difficulty?: "easy" | "medium" | "hard";
  total_duration_ar?: string;
  total_duration_en?: string;
  steps: GuideStep[];
  source?: string;
  sourceUrl?: string;
}

// ─── Network Types ───────────────────────────────────────────────────────────

export type NetworkRelationType = "ally" | "rival" | "partner" | "client" | "parent" | "subsidiary" | "competitor" | "neutral" | "other";

export interface NetworkNode {
  name_ar: string;
  name_en: string;
  emoji?: string;
  role_ar?: string;
  role_en?: string;
  relation_type: NetworkRelationType;
  relation_label_ar: string;
  relation_label_en: string;
  strength?: "strong" | "medium" | "weak";
  description_ar?: string;
  description_en?: string;
}

export interface NetworkConfig {
  center_ar: string;
  center_en: string;
  center_emoji?: string;
  center_role_ar?: string;
  center_role_en?: string;
  nodes: NetworkNode[];
  source?: string;
  sourceUrl?: string;
}

// ─── Interview Types ─────────────────────────────────────────────────────────

export interface InterviewQA {
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
}

export interface InterviewConfig {
  interviewee_ar: string;
  interviewee_en: string;
  role_ar?: string;
  role_en?: string;
  date?: string;
  context_ar?: string;
  context_en?: string;
  qa: InterviewQA[];
  source?: string;
  sourceUrl?: string;
}

// ─── Map (Geographic) Types ──────────────────────────────────────────────────

export interface MapRegion {
  name_ar: string;
  name_en: string;
  flag?: string;
  value?: string;
  unit_ar?: string;
  unit_en?: string;
  highlight?: boolean;
  note_ar?: string;
  note_en?: string;
}

export interface MapConfig {
  topic_ar: string;
  topic_en: string;
  metric_ar?: string;
  metric_en?: string;
  regions: MapRegion[];
  insight_ar?: string;
  insight_en?: string;
  source?: string;
  sourceUrl?: string;
}

// ─── News Types ───────────────────────────────────────────────────────────────
export interface NewsConfig {
  source_name?: string;
  source_url?: string;
  gnews_url?: string;
  gnews_published_at?: string;
  image_url?: string;
}

// ─── Unified content_config (for all 10 new types) ───────────────────────────
export type ContentConfig =
  | RankingConfig
  | NumbersConfig
  | ScenariosConfig
  | TimelinePostConfig
  | FactCheckConfig
  | ProfilePostConfig
  | BriefingConfig
  | QuotesConfig
  | ExplainerConfig
  | DebateConfig
  | GuideConfig
  | NetworkConfig
  | InterviewConfig
  | MapConfig
  | NewsConfig;

// ─── Database ─────────────────────────────────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name_ar: string;
          name_en: string;
          slug: string;
          parent_id: string | null;
          color: string;
          icon: string | null;
          post_count: number;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["categories"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      sources: {
        Row: {
          id: string;
          name: string;
          domain: string;
          badge_letter: string;
          badge_color: string;
          reliability_score: number;
          language: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sources"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["sources"]["Insert"]>;
      };
      posts: {
        Row: {
          id: string;
          title_ar: string;
          title_en: string | null;
          body_ar: string;
          body_en: string | null;
          slug: string | null;
          category_id: string | null;
          subcategory_id: string | null;
          source_id: string | null;
          image_url: string | null;
          status: "draft" | "published" | "flagged";
          quality_score: number;
          hash_fingerprint: string | null;
          like_count: number;
          share_count: number;
          view_count: number;
          reading_time: number;
          is_featured: boolean;
          search_vector: string | null;
          created_at: string;
          published_at: string;
          type: "article" | "chart" | "quiz" | "comparison" | "ranking" | "numbers" | "scenarios" | "timeline" | "factcheck" | "profile" | "briefing" | "quotes" | "explainer" | "debate" | "guide" | "network" | "interview" | "map" | "news";
          chart_config: ChartConfig | null;
          quiz_config: QuizConfig | null;
          comparison_config: ComparisonConfig | null;
          content_config: ContentConfig | null;
        };
        Insert: Omit<Database["public"]["Tables"]["posts"]["Row"], "id" | "created_at" | "search_vector">;
        Update: Partial<Database["public"]["Tables"]["posts"]["Insert"]>;
      };
      post_interactions: {
        Row: {
          id: string;
          post_id: string;
          session_id: string;
          action: "like" | "share" | "view";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["post_interactions"]["Row"], "id" | "created_at">;
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Source = Database["public"]["Tables"]["sources"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type PostInteraction = Database["public"]["Tables"]["post_interactions"]["Row"];

export type PostWithRelations = Post & {
  category: Category | null;
  subcategory: Category | null;
  source: Source | null;
};
