/**
 * PROMPT: scenarios — تحليل سيناريوهات مستقبلية
 * ─────────────────────────────────────────────────
 * VERSION : 1.0
 * UPDATED : مارس 2026
 * OUTPUT  : { title_ar, title_en, body_ar, body_en, content_config{ question_ar/en, horizon_ar/en, scenarios[], source, sourceUrl } }
 * CHANGE LOG:
 *   v1.0 — استخراج من generate-scenarios/route.ts
 */

import { SOURCE_INSTRUCTION } from "../shared/sources";
import { TAGS_INSTRUCTION } from "../shared/tags";

export interface ScenariosPromptParams {
  topic: string;
  categorySlug: string;
}

export function buildScenariosPrompt({ topic, categorySlug }: ScenariosPromptParams): string {
  return `أنت محرر تحليلي في منصة "جمهرة". أنشئ تحليل سيناريوهات مستقبلية عن: ${topic} (قسم: ${categorySlug})

**تعليمات حرجة للإخراج:**
- أرجع JSON صالحاً فقط — لا نص قبله ولا بعده ولا مقدمة ولا ملاحظات
- لا تستخدم markdown أو \`\`\`json
- جميع القيم نصوص عادية بدون HTML

أرجع هذا JSON بالضبط:
{
  "title_ar": "عنوان تحليلي — مثال: ماذا سيحدث للدولار؟ ثلاثة سيناريوهات",
  "title_en": "Analytical title",
  "body_ar": "مقدمة تحليلية 2-3 جمل نص عادي",
  "body_en": "Analytical intro 2-3 sentences plain text",
  "tags": ["وسم1", "وسم2", "..."],
  "tags_en": ["tag1", "tag2", ...],
  "content_config": {
    "question_ar": "ماذا سيحدث لـ...؟ صياغة واضحة",
    "question_en": "What will happen to...? Clear phrasing",
    "horizon_ar": "خلال 5 سنوات",
    "horizon_en": "Within 5 years",
    "scenarios": [
      {
        "tone": "optimistic",
        "title_ar": "السيناريو الأفضل",
        "title_en": "Best case",
        "probability": "25%",
        "conditions_ar": ["شرط 1", "شرط 2", "شرط 3"],
        "conditions_en": ["condition 1", "condition 2", "condition 3"],
        "outcome_ar": "جملة تصف النتيجة المتوقعة في هذا السيناريو",
        "outcome_en": "Sentence describing the expected outcome"
      },
      {
        "tone": "realistic",
        "title_ar": "السيناريو الأرجح",
        "title_en": "Most likely",
        "probability": "55%",
        "conditions_ar": ["..."],
        "conditions_en": ["..."],
        "outcome_ar": "...",
        "outcome_en": "..."
      },
      {
        "tone": "pessimistic",
        "title_ar": "السيناريو الأسوأ",
        "title_en": "Worst case",
        "probability": "20%",
        "conditions_ar": ["..."],
        "conditions_en": ["..."],
        "outcome_ar": "...",
        "outcome_en": "..."
      }
    ],
    "source": "اسم المصدر",
    "sourceUrl": "https://رابط-حقيقي-من-نتائج-البحث"
  }
}

القواعد:
- السيناريوهات الثلاثة بالضبط: optimistic, realistic, pessimistic
- النسب المئوية تجمع إلى 100%
- الشروط: 2-4 نقاط لكل سيناريو
- نص موضوعي بدون HTML${TAGS_INSTRUCTION}${SOURCE_INSTRUCTION}`;
}
