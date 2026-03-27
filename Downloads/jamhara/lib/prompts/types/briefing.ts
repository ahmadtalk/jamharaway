/**
 * PROMPT: briefing — موجز صحفي تنفيذي
 * ───────────────────────────────────────
 * VERSION : 1.0
 * UPDATED : مارس 2026
 * OUTPUT  : { title_ar, title_en, body_ar, body_en, content_config{ key_points[], featured_quote?, key_numbers[], bottom_line_ar/en, source } }
 * CHANGE LOG:
 *   v1.0 — استخراج من generate-briefing/route.ts
 */

import { SOURCE_INSTRUCTION } from "../shared/sources";
import { TAGS_INSTRUCTION } from "../shared/tags";

export interface BriefingPromptParams {
  topic: string;
  categorySlug: string;
}

export function buildBriefingPrompt({ topic, categorySlug }: BriefingPromptParams): string {
  return `أنت صحفي في منصة "جمهرة". أنشئ موجزاً صحفياً تنفيذياً عن: ${topic} (قسم: ${categorySlug})

أرجع JSON صالحاً فقط:
{
  "title_ar": "موجز: [الموضوع]",
  "title_en": "Briefing: [Topic]",
  "body_ar": "مقدمة سياقية من 2-3 جمل نص عادي",
  "body_en": "2-3 sentence context plain text",
  "tags": ["وسم1", "وسم2", "..."],
  "content_config": {
    "key_points": [
      {"text_ar": "نقطة رئيسية بالعربية", "text_en": "Key point in English", "icon": "emoji"}
    ],
    "featured_quote": {
      "text_ar": "اقتباس بارز من شخصية موثوقة",
      "text_en": "Notable quote in English",
      "author_ar": "اسم الشخصية",
      "author_en": "Person Name",
      "role_ar": "المنصب أو اللقب",
      "role_en": "Title or Role"
    },
    "key_numbers": [
      {"value": "الرقم البارز", "label_ar": "الوصف بالعربية", "label_en": "Description in English", "icon": "emoji"}
    ],
    "bottom_line_ar": "خلاصة القول في جملة واحدة موجزة",
    "bottom_line_en": "Bottom line in one concise sentence",
    "source": "المصدر الرئيسي",
    "sourceUrl": "https://رابط-حقيقي-من-نتائج-البحث"
  }
}

القواعد:
- 5 إلى 7 نقاط في key_points، كل نقطة موجزة وواضحة
- 3 إلى 4 أرقام في key_numbers — أرقام حقيقية موثقة
- اقتباس واحد بارز من شخصية حقيقية إن أمكن
- نص بدون HTML${TAGS_INSTRUCTION}${SOURCE_INSTRUCTION}`;
}
