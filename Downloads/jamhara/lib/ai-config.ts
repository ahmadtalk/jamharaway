/**
 * إعدادات نماذج الذكاء الاصطناعي — المصدر الوحيد للحقيقة
 * ─────────────────────────────────────────────────────────
 * ARTICLE_MODEL : Haiku  — مقالات (تم التخفيض لتوفير التكلفة)
 * CONTENT_MODEL : Haiku  — أنواع JSON الهيكلية (17 نوعاً) — أسرع وأرخص
 * EVAL_MODEL    : Haiku  — quality check خفيف
 *
 * ملاحظة Vercel Hobby: حد الدالة 60 ثانية.
 * Haiku مع web_search يكتمل في 15-25 ثانية → مناسب لجميع الأنواع.
 * للعودة لـ Sonnet: غيّر ARTICLE_MODEL إلى "claude-sonnet-4-5-20250929"
 */

/** مقالات — Haiku 4.5 (توفير التكلفة) */
export const ARTICLE_MODEL = "claude-haiku-4-5-20251001";

/** 17 نوعاً هيكلياً (chart, quiz, comparison...) — Haiku أسرع وكافٍ للـ JSON */
export const CONTENT_MODEL = "claude-haiku-4-5-20251001";

/** quality check وتقييمات خفيفة */
export const EVAL_MODEL = "claude-haiku-4-5-20251001";
