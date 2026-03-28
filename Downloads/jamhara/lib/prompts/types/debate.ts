/**
 * PROMPT: debate — مناظرة متوازنة
 * ──────────────────────────────────
 * VERSION : 1.0
 * UPDATED : مارس 2026
 * OUTPUT  : { title_ar, title_en, body_ar, body_en, content_config{ question_ar/en, side_a{}, side_b{}, verdict_ar/en, source } }
 * CHANGE LOG:
 *   v1.0 — استخراج من generate-debate/route.ts
 */

import { SOURCE_INSTRUCTION } from "../shared/sources";
import { TAGS_INSTRUCTION } from "../shared/tags";

export interface DebatePromptParams {
  topic: string;
  categorySlug: string;
}

export function buildDebatePrompt({ topic, categorySlug }: DebatePromptParams): string {
  return `أنت صحفي في منصة "جمهرة". أنشئ مناظرة متوازنة وموضوعية حول: ${topic} (قسم: ${categorySlug})

أرجع JSON صالحاً فقط:
{
  "title_ar": "مناظرة: [الموضوع]",
  "title_en": "Debate: [Topic]",
  "body_ar": "جملة مقدمة واحدة تُطار القضية الخلافية",
  "body_en": "One intro sentence framing the controversy",
  "tags": ["وسم1", "وسم2", "..."],
  "tags_en": ["tag1", "tag2", ...],
  "content_config": {
    "question_ar": "السؤال الجوهري للمناظرة",
    "question_en": "Core debate question in English",
    "side_a": {
      "label_ar": "المؤيدون",
      "label_en": "For",
      "emoji": "✅",
      "color": "#059669",
      "arguments": [
        {"point_ar": "حجة مؤيدة بالعربية", "point_en": "Supporting argument in English"}
      ],
      "summary_ar": "خلاصة موقف المؤيدين في جملة",
      "summary_en": "Summary of the supporting position"
    },
    "side_b": {
      "label_ar": "المعارضون",
      "label_en": "Against",
      "emoji": "❌",
      "color": "#DC2626",
      "arguments": [
        {"point_ar": "حجة معارضة بالعربية", "point_en": "Opposing argument in English"}
      ],
      "summary_ar": "خلاصة موقف المعارضين في جملة",
      "summary_en": "Summary of the opposing position"
    },
    "verdict_ar": "خلاصة تحريرية موضوعية ومحايدة تُقيّم الحجج",
    "verdict_en": "Objective and neutral editorial verdict evaluating the arguments",
    "source": "المصدر الرئيسي",
    "sourceUrl": "https://رابط-حقيقي-من-نتائج-البحث"
  }
}

القواعد:
- 4 إلى 5 حجج لكل جانب، متوازنة ومتكافئة في القوة
- الحجج مبنية على حقائق وأدلة موثقة
- الخلاصة (verdict) محايدة تماماً وتحليلية وليست منحازة لأي جانب
- نص بدون HTML${TAGS_INSTRUCTION}${SOURCE_INSTRUCTION}`;
}
