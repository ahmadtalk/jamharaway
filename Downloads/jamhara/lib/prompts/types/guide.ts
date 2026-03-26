/**
 * PROMPT: guide — دليل عملي خطوة بخطوة
 * ─────────────────────────────────────────
 * VERSION : 1.0
 * UPDATED : مارس 2026
 * OUTPUT  : { title_ar, title_en, body_ar, body_en, content_config{ goal_ar/en, difficulty, total_duration_ar/en, steps[], source } }
 * CHANGE LOG:
 *   v1.0 — استخراج من generate-guide/route.ts
 */

import { SOURCE_INSTRUCTION } from "../shared/sources";

export interface GuidePromptParams {
  /** الموضوع — يُستخدم اسم التصنيف بالعربية كما في الـ route الأصلي */
  topic: string;
  categoryName: string;
}

export function buildGuidePrompt({ topic, categoryName }: GuidePromptParams): string {
  return `أنت محرر في منصة "جمهرة". اكتب دليلاً عملياً خطوة بخطوة حول: ${topic}

أرجع JSON بهذا الهيكل بالضبط:
{
  "title_ar": "عنوان الدليل بالعربية",
  "title_en": "Guide Title in English",
  "body_ar": "مقدمة موجزة تشرح الهدف من الدليل — جملتان أو ثلاث",
  "body_en": "Brief intro explaining the guide goal — 2-3 sentences",
  "content_config": {
    "goal_ar": "ما ستتعلمه أو تحققه بعد اتباع هذه الخطوات",
    "goal_en": "What you will learn or achieve after following these steps",
    "difficulty": "easy|medium|hard",
    "total_duration_ar": "الوقت الإجمالي المقدّر مثل: 30 دقيقة",
    "total_duration_en": "Estimated total time e.g.: 30 minutes",
    "steps": [
      {
        "step": 1,
        "icon": "إيموجي يمثل الخطوة",
        "title_ar": "عنوان الخطوة",
        "title_en": "Step Title",
        "description_ar": "وصف واضح وعملي للخطوة — 2-3 جمل",
        "description_en": "Clear practical description — 2-3 sentences",
        "duration_ar": "5 دقائق",
        "duration_en": "5 minutes",
        "warning_ar": "تحذير مهم إن وجد — وإلا اتركه فارغاً",
        "warning_en": "Important warning if any — otherwise leave empty"
      }
    ],
    "source": "اسم المصدر الرسمي إن وجد",
    "sourceUrl": "https://رابط-حقيقي"
  }
}

قواعد: 5-9 خطوات، كل خطوة عملية وقابلة للتنفيذ، icon مناسب لكل خطوة، difficulty مناسبة للموضوع.
أرجع JSON فقط بدون أي نص إضافي.${SOURCE_INSTRUCTION}`;
}
