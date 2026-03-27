/**
 * PROMPT: news — خبر صحفي بأسلوب Axios Smart Brevity
 * ─────────────────────────────────
 * VERSION : 2.0
 * UPDATED : مارس 2026
 * INPUT   : title, description, content, source_name, publishedAt
 * OUTPUT  : { title_ar, lede_ar, why_it_matters_ar, key_points_ar[], quote?, whats_next_ar?, tags[], title_en, lede_en, why_it_matters_en, key_points_en[], whats_next_en?, tags_en[] }
 * STYLE   : Axios Smart Brevity — فقرة افتتاحية + لماذا يهم + نقاط + اقتباس + ما التالي
 */

export interface NewsPromptParams {
  title: string;
  description: string;
  content: string;
  sourceName: string;
  publishedAt: string; // ISO date string
}

export function buildNewsPrompt({ title, description, content, sourceName, publishedAt }: NewsPromptParams): string {
  const date = new Date(publishedAt);
  const dateStr = date.toLocaleDateString("ar-EG", {
    year: "numeric", month: "long", day: "numeric",
    timeZone: "UTC",
  });

  return `أنت محرر أخبار في منصة "جمهرة". أعِد صياغة هذا الخبر بأسلوب "Axios Smart Brevity" — أسلوب تحريري يُقدّم المعلومات بكثافة ووضوح تام.

المصدر: ${sourceName}
تاريخ النشر: ${dateStr}
العنوان الأصلي: ${title}
المقدمة: ${description}
المحتوى: ${content}

أنتج JSON فقط بهذا الهيكل:

{
  "title_ar": "عنوان مباشر ومكثف ≤ 12 كلمة — يصف الحدث بدقة — بدون علامة استفهام",
  "lede_ar": "جملة أو جملتان تجيبان: من؟ ماذا؟ متى؟ أين؟ — الأهم أولاً — 20-35 كلمة",
  "why_it_matters_ar": "فقرة 1-3 جمل تشرح لماذا يهم هذا الخبر المتلقي العربي — السياق الحقيقي لا الوصف",
  "key_points_ar": [
    "نقطة مكثفة لا تتجاوز 15 كلمة — تبدأ بفعل أو رقم",
    "نقطة مكثفة...",
    "نقطة مكثفة..."
  ],
  "quote": {
    "text_ar": "اقتباس مباشر بالعربية — أو null إذا لم يوجد اقتباس جوهري في المصدر",
    "text_en": "Same quote translated to English — or null",
    "author_ar": "اسم صاحب الاقتباس",
    "author_en": "Name of the speaker in English",
    "role_ar": "منصبه أو صفته",
    "role_en": "Their title or role in English"
  },
  "whats_next_ar": "جملة أو جملتان عن المتوقع أو الخطوة التالية — أو null إذا لم تكن معلومة",
  "tags": ["وسم1", "وسم2", "..."],
  "title_en": "Direct English headline ≤ 10 words",
  "lede_en": "1-2 sentences: who, what, when, where — 20-35 words",
  "why_it_matters_en": "1-3 sentences explaining significance in English",
  "key_points_en": ["Point starting with verb or number", "..."],
  "whats_next_en": "1-2 sentences on what to expect — or null",
  "tags_en": ["syria", "economy", "..."]
}

قواعد صارمة:
- title_ar: خبري مباشر، فعل ماضٍ أو مضارع، بدون "يكشف" / "يُثير" / "يُحذر"
- lede_ar: اذكر التاريخ الصريح (${dateStr}) إذا أشرت للوقت — يُمنع "اليوم" / "أمس" / "مؤخراً"
- key_points_ar: 3-5 نقاط — لا أقل من 3 ولا أكثر من 5
- quote: أرجع null للحقل بأكمله (لا تضع كائناً فارغاً) إذا لم يوجد اقتباس حقيقي في المصدر
- whats_next_ar: أرجع null إذا لم تكن هناك معلومة مؤكدة عن المستقبل
- اللغة: فصحى سلسة كالجزيرة والعربية — لا ترجمة حرفية
- tags: 5-8 وسوم عربية (دول، أشخاص، منظمات، مواضيع) — كلمة أو كلمتان — بدون تشكيل
- tags_en: same count as tags — lowercase ASCII slugs — use hyphens for spaces
- أرجع JSON فقط بدون أي نص قبله أو بعده`;
}
