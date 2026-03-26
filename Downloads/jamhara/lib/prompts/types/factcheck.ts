/**
 * PROMPT: factcheck — تدقيق حقائق
 * ───────────────────────────────────
 * VERSION : 1.0
 * UPDATED : مارس 2026
 * OUTPUT  : { title_ar, title_en, body_ar, body_en, content_config{ claims[], source, sourceUrl } }
 * VERDICTS: true | false | misleading | partial | unverified
 * CHANGE LOG:
 *   v1.0 — استخراج من generate-factcheck/route.ts
 */

import { SOURCE_INSTRUCTION } from "../shared/sources";

export interface FactcheckPromptParams {
  topic: string;
  categorySlug: string;
}

export function buildFactcheckPrompt({ topic, categorySlug }: FactcheckPromptParams): string {
  return `أنت محقق حقائق في منصة "جمهرة". أنشئ منشور تحقق من الحقيقة عن: ${topic} (قسم: ${categorySlug})

أرجع JSON صالحاً فقط:
{
  "title_ar": "عنوان — مثال: هل صحيح أن الذهب يحمي من التضخم؟",
  "title_en": "Title",
  "body_ar": "مقدمة التحقق 2-3 جمل نص عادي",
  "body_en": "Fact-check intro 2-3 sentences plain text",
  "content_config": {
    "claims": [
      {
        "claim_ar": "الادعاء كما هو شائع بالعربية",
        "claim_en": "The claim as commonly stated in English",
        "verdict": "true",
        "explanation_ar": "الشرح الموضوعي والأدلة الداعمة للحكم (2-3 جمل)",
        "explanation_en": "Objective explanation and supporting evidence (2-3 sentences)",
        "sources": ["اسم المصدر 1", "اسم المصدر 2"]
      }
    ],
    "source": "المصدر الرئيسي",
    "sourceUrl": "https://رابط-حقيقي-من-نتائج-البحث"
  }
}

القواعد:
- 5 إلى 8 ادعاءات
- verdict: "true" | "false" | "misleading" | "partial" | "unverified"
- تنوّع الأحكام — لا تجعل كل شيء صحيحاً أو كل شيء خاطئاً
- sources: 1-3 مصادر مختصرة لكل ادعاء
- موضوعي، مبني على أدلة، نص بدون HTML${SOURCE_INSTRUCTION}`;
}
