/**
 * PROMPT: explainer — أسئلة شارحة (Q&A)
 * ─────────────────────────────────────────
 * VERSION : 1.0
 * UPDATED : مارس 2026
 * OUTPUT  : { title_ar, title_en, body_ar, body_en, content_config{ intro_ar/en?, questions[], source } }
 * CHANGE LOG:
 *   v1.0 — استخراج من generate-explainer/route.ts
 */

import { SOURCE_INSTRUCTION } from "../shared/sources";

export interface ExplainerPromptParams {
  topic: string;
  categorySlug: string;
}

export function buildExplainerPrompt({ topic, categorySlug }: ExplainerPromptParams): string {
  return `أنت صحفي في منصة "جمهرة". أنشئ شرحاً تفصيلياً بأسئلة وأجوبة عن: ${topic} (قسم: ${categorySlug})

أرجع JSON صالحاً فقط:
{
  "title_ar": "أسئلة شارحة: [الموضوع]",
  "title_en": "Explainer: [Topic]",
  "body_ar": "جملة مقدمة واحدة توضح لماذا هذا الموضوع مهم",
  "body_en": "One intro sentence explaining why this topic matters",
  "content_config": {
    "intro_ar": "مقدمة موجزة للموضوع من جملتين",
    "intro_en": "Brief 2-sentence intro to the topic",
    "questions": [
      {
        "question_ar": "السؤال بالعربية",
        "question_en": "Question in English",
        "answer_ar": "الإجابة بالعربية من 2-4 جمل موضوعية وواضحة",
        "answer_en": "Answer in English, 2-4 clear sentences",
        "icon": "emoji"
      }
    ],
    "source": "المصدر الرئيسي",
    "sourceUrl": "https://رابط-حقيقي-من-نتائج-البحث"
  }
}

القواعد:
- 6 إلى 10 أسئلة تتدرج من البسيط إلى المعقد
- كل سؤال يشرح جانباً مختلفاً من الموضوع
- كل إجابة من 2 إلى 4 جمل مفيدة وموضوعية
- استخدم emoji مناسب لكل سؤال
- نص بدون HTML${SOURCE_INSTRUCTION}`;
}
