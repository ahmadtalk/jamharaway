/**
 * PROMPT: profile — بروفايل صحفي
 * ─────────────────────────────────
 * VERSION : 2.1
 * UPDATED : مارس 2026
 * OUTPUT  : { title_ar, title_en, body_ar, body_en, content_config{...} }
 * SUBJECT TYPES: person | organization | country | movement | other
 * CHANGE LOG:
 *   v1.0 — النسخة الأولى
 *   v2.0 — سبب النشر الآن + فورمولا tagline + قواعد sections + قسم الجدل + quick_facts مفاجئة + avatar_color ذكي
 *   v2.1 — إزالة الهيكل متعدد الخطوات (كان يُنتج نصاً قبل JSON) → هيكل مسطّح موثوق
 */

import { SOURCE_INSTRUCTION } from "../shared/sources";

export interface ProfilePromptParams {
  topic: string;
  categoryName: string;
  recentTopics?: string[];
}

export function buildProfilePrompt({ topic, categoryName, recentTopics }: ProfilePromptParams): string {
  const recentBlock = recentTopics && recentTopics.length > 0
    ? `\n\n⚠️ لا تكتب بروفايلاً عن أي شخصية أو جهة من القائمة التالية (كُتبت مؤخراً):\n${recentTopics.map(t => `- ${t}`).join("\n")}\nاختر شخصية أو جهة مختلفة تماماً.`
    : "";

  return `أنت صحفي ومحرر بارز في منصة "جمهرة". اكتب بروفايلاً صحفياً احترافياً عن: ${topic}${recentBlock}

ابحث أولاً عن: أحدث أخبار الشخصية/الجهة (آخر 90 يوماً) + أبرز رقم مفاجئ + أبرز جدل موثّق + صورة حقيقية.
ثم أرجع JSON فقط بهذا الهيكل:

{
  "title_ar": "بروفايل: [الاسم بالعربية]",
  "title_en": "Profile: [Name in English]",
  "body_ar": "3-4 جمل تفتح بحدث راهن من آخر 90 يوماً (قرار/فوز/تصريح/تعيين...) ثم تُقدّم الشخصية — أرقام وتواريخ إن أمكن — نص عادي بلا HTML",
  "body_en": "3-4 sentences opening with a recent event from the last 90 days — plain text with numbers/dates",
  "content_config": {
    "subject_type": "person|organization|country|movement|other",
    "full_name_ar": "الاسم الكامل الرسمي",
    "full_name_en": "Full official name",
    "known_as_ar": "الاسم المختصر المعروف به",
    "known_as_en": "Short known name",
    "tagline_ar": "فورمولا — فعل + رقم أو إنجاز + سياق مميز. مثال: أول امرأة تترأس صندوق النقد الدولي مرتين متتاليتين",
    "tagline_en": "Formula: verb + number/achievement + distinctive context — max 12 words",
    "avatar_emoji": "إيموجي واحد يمثل الشخصية أو الجهة",
    "avatar_color": "person=#7B5EA7 | organization=#2196F3 | country=#4CB36C | movement=#E05A2B | other=#373C55 — اختر بحسب subject_type",
    "image_url": "رابط URL حقيقي من نتائج البحث أو \"\" إن لم يُوجد",
    "quick_facts": [
      { "icon": "🎂", "label_ar": "تاريخ الميلاد/التأسيس", "label_en": "Born/Founded", "value_ar": "قيمة قصيرة ≤ 7 كلمات", "value_en": "short value ≤ 7 words" },
      { "icon": "🌍", "label_ar": "الجنسية/المقر", "label_en": "Nationality/HQ", "value_ar": "...", "value_en": "..." },
      { "icon": "💼", "label_ar": "المنصب الحالي", "label_en": "Current Role", "value_ar": "...", "value_en": "..." },
      { "icon": "إيموجي", "label_ar": "حقيقة مفاجئة غير متوقعة — ليس من النوع أعلاه", "label_en": "Surprising fact", "value_ar": "قيمة قصيرة ≤ 7 كلمات", "value_en": "≤ 7 words" }
    ],
    "stats": [
      { "icon": "إيموجي", "label_ar": "رقم بارز يُفاجئ القارئ", "label_en": "...", "value": "الرقم الحقيقي", "unit": "وحدة اختيارية" }
    ],
    "timeline": [
      { "year": "YYYY", "event_ar": "حدث مهم بالعربية", "event_en": "Key event in English", "type": "milestone|award|crisis|founding|death|other" }
    ],
    "sections": [
      { "title_ar": "عنوان المحور", "title_en": "Section Title", "content_ar": "60-100 كلمة — رقم أو تاريخ واحد إلزامي — نص محدد لا عام", "content_en": "60-100 words — one number or date required — specific not vague" }
    ],
    "tags_ar": ["وسم1", "وسم2", "وسم3"],
    "tags_en": ["tag1", "tag2", "tag3"],
    "source": "اسم المصدر",
    "sourceUrl": "https://رابط-حقيقي"
  }
}

قواعد إلزامية:
- quick_facts (3-5): الأولى الثلاث هي الهوية الأساسية (الميلاد، الجنسية، المنصب) + حقيقة مفاجئة واحدة أو اثنتان — كل value_ar وvalue_en: ≤ 7 كلمات بالضبط، قصيرة كالبطاقة التعريفية
- stats (3-5): أرقام حقيقية موثّقة فقط — لا تقديرات مبهمة
- timeline (5-10): مرتبة تصاعدياً — ركّز على نقاط التحول — آخر حدث من آخر 90 يوماً
- sections (3-5): كل قسم 60-100 كلمة + رقم أو تاريخ إلزامي + قسم "الجدل والانتقادات" إلزامي
- محظور في sections: "يُعدّ" / "دور محوري" / "تحديات جسيمة" / "أثر بالغ" / "في ظل" / "آفاق واسعة"
- tagline: ❌ "سياسي بارز ومؤثر" — ✅ "أطول رئيس وزراء يبقى في منصبه في تاريخ اليابان الحديث"
- أرجع JSON فقط بدون أي نص قبله أو بعده${SOURCE_INSTRUCTION}`;
}
