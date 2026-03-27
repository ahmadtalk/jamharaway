/**
 * PROMPT: quotes — اقتباسات بارزة
 * ──────────────────────────────────
 * VERSION : 1.0
 * UPDATED : مارس 2026
 * OUTPUT  : { title_ar, title_en, body_ar, body_en, content_config{ topic_ar/en, quotes[], source } }
 * SENTIMENTS: positive | negative | neutral | warning
 * CHANGE LOG:
 *   v1.0 — استخراج من generate-quotes/route.ts
 */

import { SOURCE_INSTRUCTION } from "../shared/sources";
import { TAGS_INSTRUCTION } from "../shared/tags";

export interface QuotesPromptParams {
  topic: string;
  categorySlug: string;
  useWebSearch?: boolean;
}

export function buildQuotesPrompt({ topic, categorySlug, useWebSearch = false }: QuotesPromptParams): string {
  const sourceNote = useWebSearch
    ? `- ابحث عن الاقتباسات قبل الكتابة وتحقق من صحتها${SOURCE_INSTRUCTION}`
    : `- استخدم اقتباسات موثّقة من معرفتك — أشخاص حقيقيون وأقوال فعلية معروفة
- اترك sourceUrl فارغاً إذا لم تكن متأكداً من الرابط الدقيق`;

  return `أنت صحفي في منصة "جمهرة". اجمع اقتباسات بارزة حول: ${topic} (قسم: ${categorySlug})

**تعليمات حرجة للإخراج:**
- أرجع JSON صالحاً فقط — لا نص قبله ولا بعده ولا مقدمة ولا ملاحظات
- لا تستخدم markdown أو \`\`\`json
- تأكد من هروب علامات الاقتباس المزدوجة داخل النصوص بـ \\"
- جميع القيم نصوص عادية بدون HTML

{
  "title_ar": "اقتباسات: [الموضوع]",
  "title_en": "Quotes: [Topic]",
  "body_ar": "جملة مقدمة واحدة تُطار الموضوع",
  "body_en": "One intro sentence framing the topic",
  "tags": ["وسم1", "وسم2", "..."],
  "content_config": {
    "topic_ar": "الموضوع بالعربية",
    "topic_en": "Topic in English",
    "quotes": [
      {
        "text_ar": "نص الاقتباس بالعربية",
        "text_en": "Quote text in English",
        "author_ar": "اسم صاحب الاقتباس",
        "author_en": "Author Name",
        "role_ar": "منصبه أو لقبه",
        "role_en": "Title or Role",
        "date": "التاريخ أو السنة",
        "sentiment": "positive"
      }
    ],
    "source": "المصدر الرئيسي",
    "sourceUrl": ""
  }
}

القواعد:
- 5 إلى 8 اقتباسات من أشخاص حقيقيين بتواريخ حقيقية
- sentiment: "positive" | "negative" | "neutral" | "warning" — تنوّع في المشاعر
- نص بدون HTML
${TAGS_INSTRUCTION}
${sourceNote}`;
}
