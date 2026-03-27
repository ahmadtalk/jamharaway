/**
 * PROMPT: timeline — خط زمني تاريخي
 * ─────────────────────────────────────
 * VERSION : 1.0
 * UPDATED : مارس 2026
 * OUTPUT  : { title_ar, title_en, body_ar, body_en, content_config{ events[], source, sourceUrl } }
 * CHANGE LOG:
 *   v1.0 — استخراج من generate-timeline/route.ts
 */

import { SOURCE_INSTRUCTION } from "../shared/sources";
import { TAGS_INSTRUCTION } from "../shared/tags";

export interface TimelinePromptParams {
  topic: string;
  categorySlug: string;
}

export function buildTimelinePrompt({ topic, categorySlug }: TimelinePromptParams): string {
  return `أنت محرر في منصة "جمهرة". أنشئ خطاً زمنياً تاريخياً عن: ${topic} (قسم: ${categorySlug})

أرجع JSON صالحاً فقط:
{
  "title_ar": "عنوان — مثال: تاريخ الذكاء الاصطناعي من 1950 إلى اليوم",
  "title_en": "Title",
  "body_ar": "وصف مختصر 2-3 جمل نص عادي",
  "body_en": "Short description 2-3 sentences plain text",
  "tags": ["وسم1", "وسم2", "..."],
  "content_config": {
    "events": [
      {
        "year": "1950",
        "title_ar": "عنوان الحدث بالعربية",
        "title_en": "Event title in English",
        "description_ar": "وصف مختصر للحدث وأهميته",
        "description_en": "Short description of event and significance",
        "type": "milestone",
        "emoji": "🧠"
      }
    ],
    "source": "اسم المصدر",
    "sourceUrl": "https://رابط-حقيقي-من-نتائج-البحث"
  }
}

القواعد:
- 10 إلى 15 حدثاً مرتبة زمنياً تصاعدياً
- type: "milestone" | "crisis" | "innovation" | "discovery" | "default"
- تنوّع الأنواع: لا تجعل كل الأحداث من نفس النوع
- emoji مناسب لكل حدث
- وصف مختصر وواقعي
- نص بدون HTML${TAGS_INSTRUCTION}${SOURCE_INSTRUCTION}`;
}
