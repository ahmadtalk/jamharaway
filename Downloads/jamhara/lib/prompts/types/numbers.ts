/**
 * PROMPT: numbers — منشور "بالأرقام" (صحافة بيانات مكثّفة)
 * ───────────────────────────────────────────────────────────
 * VERSION : 1.0
 * UPDATED : مارس 2026
 * OUTPUT  : { title_ar, title_en, body_ar, body_en, content_config{ stats[], source, sourceUrl } }
 * CHANGE LOG:
 *   v1.0 — استخراج من generate-numbers/route.ts
 */

import { SOURCE_INSTRUCTION } from "../shared/sources";
import { TAGS_INSTRUCTION } from "../shared/tags";

export interface NumbersPromptParams {
  topic: string;
  categorySlug: string;
}

export function buildNumbersPrompt({ topic, categorySlug }: NumbersPromptParams): string {
  return `أنت محرر في منصة "جمهرة". أنشئ منشور "بالأرقام" (صحافة بيانات مكثفة) عن: ${topic} (قسم: ${categorySlug})

أرجع JSON صالحاً فقط:
{
  "title_ar": "عنوان جذاب — مثال: الذكاء الاصطناعي بالأرقام",
  "title_en": "Catchy title",
  "body_ar": "سياق تحليلي 2-3 جمل نص عادي",
  "body_en": "Analytical context 2-3 sentences plain text",
  "tags": ["وسم1", "وسم2", ...],
  "tags_en": ["tag1", "tag2", ...],
  "content_config": {
    "stats": [
      {
        "number": "4.8 مليار",
        "label_ar": "مستخدمي الإنترنت عالمياً",
        "label_en": "Global internet users",
        "context_ar": "يمثلون 60% من سكان العالم في 2024",
        "context_en": "Representing 60% of world population in 2024",
        "icon": "🌐",
        "color": "#4CB36C"
      }
    ],
    "source": "اسم المصدر",
    "sourceUrl": "https://رابط-حقيقي-من-نتائج-البحث"
  }
}

القواعد:
- 6 إلى 10 إحصاءات مؤثرة وموثوقة
- الرقم في number يجب أن يكون بارزاً ومثيراً (قيمة + وحدة في نفس النص)
- تنوّع الألوان في color من: #4CB36C #7B5EA7 #E05A2B #2196F3 #F59E0B #00BCD4
- icon: emoji مناسب
- نص بدون HTML
${TAGS_INSTRUCTION}${SOURCE_INSTRUCTION}`;
}
