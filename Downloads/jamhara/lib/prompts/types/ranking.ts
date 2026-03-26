/**
 * PROMPT: ranking — قائمة ترتيب وتصنيف
 * ────────────────────────────────────────
 * VERSION : 1.0
 * UPDATED : مارس 2026
 * OUTPUT  : { title_ar, title_en, body_ar, body_en, content_config{ metric_ar, metric_en, items[], source, sourceUrl } }
 * CHANGE LOG:
 *   v1.0 — استخراج من generate-ranking/route.ts
 */

import { SOURCE_INSTRUCTION } from "../shared/sources";

export interface RankingPromptParams {
  /** الموضوع الفعّال */
  topic: string;
  /** slug التصنيف كما هو في الـ route الأصلي */
  categorySlug: string;
}

export function buildRankingPrompt({ topic, categorySlug }: RankingPromptParams): string {
  return `أنت محرر في منصة "جمهرة". أنشئ قائمة ترتيب وتصنيف عن: ${topic} (قسم: ${categorySlug})

أرجع JSON صالحاً فقط — بدون أي نص قبله أو بعده:
{
  "title_ar": "العنوان بالعربية — مثال: أقوى 10 اقتصادات عربية",
  "title_en": "Title in English",
  "body_ar": "تحليل مختصر 2-3 جمل نص عادي",
  "body_en": "Short analysis 2-3 sentences plain text",
  "content_config": {
    "metric_ar": "معيار التصنيف — مثال: الناتج المحلي الإجمالي",
    "metric_en": "Ranking metric — e.g. GDP",
    "items": [
      {
        "rank": 1,
        "name_ar": "الاسم بالعربية",
        "name_en": "Name in English",
        "value": "2.1",
        "unit_ar": "تريليون دولار",
        "unit_en": "trillion USD",
        "note_ar": "ملاحظة قصيرة اختيارية",
        "note_en": "optional short note",
        "emoji": "🇺🇸",
        "change": "up",
        "change_amount": 2
      }
    ],
    "source": "اسم المصدر",
    "sourceUrl": "https://رابط-حقيقي-من-نتائج-البحث"
  }
}

القواعد:
- 8 إلى 15 عنصراً في القائمة
- change: "up" أو "down" أو "same" — واقعي
- value: رقم حقيقي أو نص
- نص بدون HTML${SOURCE_INSTRUCTION}`;
}
