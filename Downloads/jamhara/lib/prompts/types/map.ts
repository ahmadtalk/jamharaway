/**
 * PROMPT: map — توزيع جغرافي مقارن
 * ─────────────────────────────────────
 * VERSION : 1.0
 * UPDATED : مارس 2026
 * OUTPUT  : { title_ar, title_en, body_ar, body_en, content_config{ topic_ar/en, metric_ar/en, regions[], insight_ar/en, source } }
 * NOTE    : highlight: true → دولة واحدة على الأقل مميزة بحدود خضراء
 * CHANGE LOG:
 *   v1.0 — استخراج من generate-map/route.ts
 */

import { SOURCE_INSTRUCTION } from "../shared/sources";

export interface MapPromptParams {
  topic: string;
  categoryName: string;
}

export function buildMapPrompt({ topic, categoryName }: MapPromptParams): string {
  return `أنت محرر بيانات في منصة "جمهرة". أنشئ توزيعاً جغرافياً مقارناً حول: ${topic}

أرجع JSON بهذا الهيكل:
{
  "title_ar": "عنوان التوزيع الجغرافي",
  "title_en": "Geographic Distribution Title",
  "body_ar": "مقدمة موجزة تشرح البيانات وأهميتها — 2-3 جمل",
  "body_en": "Brief intro explaining the data — 2-3 sentences",
  "content_config": {
    "topic_ar": "الموضوع الذي تُقارن فيه الدول",
    "topic_en": "The topic being compared across countries",
    "metric_ar": "المقياس مثل: نسبة الفقر، عدد الإصابات، حجم الاستثمار",
    "metric_en": "The metric e.g.: poverty rate, cases, investment size",
    "regions": [
      {
        "name_ar": "اسم الدولة أو المنطقة",
        "name_en": "Country or Region Name",
        "flag": "🏳️ إيموجي علم الدولة",
        "value": "القيمة الرقمية أو النصية",
        "unit_ar": "الوحدة مثل: %",
        "unit_en": "Unit e.g.: %",
        "highlight": true,
        "note_ar": "ملاحظة مختصرة اختيارية",
        "note_en": "Optional short note"
      }
    ],
    "insight_ar": "الاستنتاج الرئيسي من هذه البيانات الجغرافية — جملة واحدة قوية",
    "insight_en": "Main insight from this geographic data — one powerful sentence",
    "source": "اسم المصدر الرسمي",
    "sourceUrl": "https://رابط-حقيقي"
  }
}

قواعد: 6-12 دولة أو منطقة، دولة واحدة على الأقل مميزة (highlight: true)، بيانات حقيقية وحديثة، أرقام دقيقة وموثوقة، ترتيب منطقي (تنازلي أو إقليمي).
أرجع JSON فقط.${SOURCE_INSTRUCTION}`;
}
