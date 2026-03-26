/**
 * PROMPT: interview — مقابلة صحفية محاكاة
 * ──────────────────────────────────────────
 * VERSION : 1.0
 * UPDATED : مارس 2026
 * OUTPUT  : { title_ar, title_en, body_ar, body_en, content_config{ interviewee_ar/en, role_ar/en, date, context_ar/en, qa[], source } }
 * NOTE    : مقابلة محاكاة تستند إلى مواقف موثقة — ليست اقتباسات حرفية
 * CHANGE LOG:
 *   v1.0 — استخراج من generate-interview/route.ts
 */

import { SOURCE_INSTRUCTION } from "../shared/sources";

export interface InterviewPromptParams {
  topic: string;
  categoryName: string;
}

export function buildInterviewPrompt({ topic, categoryName }: InterviewPromptParams): string {
  return `أنت محرر صحفي في منصة "جمهرة". أنشئ مقابلة صحفية محاكاة واقعية مع: ${topic}

ملاحظة: هذه مقابلة محاكاة صحفية تستند إلى مواقف ورؤى شخصية أو مؤسسية موثقة ومعروفة.

أرجع JSON بهذا الهيكل:
{
  "title_ar": "عنوان المقابلة",
  "title_en": "Interview Title",
  "body_ar": "سياق المقابلة وأهميتها — 2-3 جمل",
  "body_en": "Interview context and importance — 2-3 sentences",
  "content_config": {
    "interviewee_ar": "اسم الشخصية",
    "interviewee_en": "Person Name",
    "role_ar": "المنصب والمؤسسة",
    "role_en": "Title and Institution",
    "date": "2025",
    "context_ar": "جملة واحدة تشرح سبب المقابلة وراهنيتها",
    "context_en": "One sentence on why this interview matters now",
    "qa": [
      {
        "question_ar": "سؤال صحفي محوري؟",
        "question_en": "Key journalistic question?",
        "answer_ar": "إجابة واقعية تعكس مواقف الشخصية المعروفة — 3-4 جمل",
        "answer_en": "Realistic answer reflecting known positions — 3-4 sentences"
      }
    ],
    "source": "المصدر",
    "sourceUrl": "https://رابط-حقيقي"
  }
}

قواعد: 6-8 أسئلة وأجوبة، أسئلة جريئة ومتنوعة (سياسية/شخصية/مستقبلية)، إجابات تعكس مواقف حقيقية موثقة، أسلوب صحفي احترافي.
أرجع JSON فقط.${SOURCE_INSTRUCTION}`;
}
