/**
 * PROMPT: profile — بروفايل صحفي
 * ─────────────────────────────────
 * VERSION : 1.0
 * UPDATED : مارس 2026
 * OUTPUT  : { title_ar, title_en, body_ar, body_en, content_config{ subject_type, full_name, quick_facts[], stats[], timeline[], sections[], tags[], source } }
 * SUBJECT TYPES: person | organization | country | movement | other
 * CHANGE LOG:
 *   v1.0 — استخراج من generate-profile/route.ts
 */

import { SOURCE_INSTRUCTION } from "../shared/sources";

export interface ProfilePromptParams {
  /** الموضوع — اسم الشخصية أو الجهة */
  topic: string;
  /** اسم التصنيف بالعربية */
  categoryName: string;
}

export function buildProfilePrompt({ topic, categoryName }: ProfilePromptParams): string {
  return `أنت صحفي ومحرر بارز في منصة "جمهرة". مهمتك كتابة بروفايل صحفي احترافي وشامل عن: ${topic}

ابحث أولاً عن أحدث وأهم المعلومات الموثوقة حول هذه الشخصية أو الجهة، ثم أنتج JSON بهذا الهيكل بالضبط:

{
  "title_ar": "بروفايل: [الاسم بالعربية]",
  "title_en": "Profile: [Name in English]",
  "body_ar": "مقدمة تحريرية من 3-5 جمل تُقدّم الشخصية أو الجهة بأسلوب صحفي راقٍ — نص عادي بلا HTML",
  "body_en": "3-5 sentence journalistic introduction in English — plain text no HTML",
  "content_config": {
    "subject_type": "person|organization|country|movement|other",
    "full_name_ar": "الاسم الكامل الرسمي بالعربية",
    "full_name_en": "Full official name in English",
    "known_as_ar": "الاسم المعروف به مختصراً",
    "known_as_en": "Known as (short name)",
    "tagline_ar": "وصف مختصر لا يزيد عن 10 كلمات — مثل: أكثر لاعب سجّل في تاريخ كرة القدم",
    "tagline_en": "Short tagline under 10 words",
    "avatar_emoji": "إيموجي واحد يمثل الشخصية أو الجهة",
    "avatar_color": "#hex — لون يعبر عن هوية الشخصية أو الجهة",
    "image_url": "رابط URL حقيقي لصورة من نتائج البحث إن وُجد — وإلا اتركه فارغاً \"\"",
    "quick_facts": [
      { "icon": "🎂", "label_ar": "تاريخ الميلاد/التأسيس", "label_en": "Born/Founded", "value_ar": "...", "value_en": "..." },
      { "icon": "🌍", "label_ar": "الجنسية/المقر", "label_en": "Nationality/HQ", "value_ar": "...", "value_en": "..." },
      { "icon": "💼", "label_ar": "المنصب/النوع", "label_en": "Role/Type", "value_ar": "...", "value_en": "..." },
      { "icon": "📍", "label_ar": "المدينة/البلد", "label_en": "City/Country", "value_ar": "...", "value_en": "..." }
    ],
    "stats": [
      { "icon": "🏆", "label_ar": "إنجاز مهم", "label_en": "Key Achievement", "value": "الرقم أو القيمة", "unit": "وحدة اختيارية" }
    ],
    "timeline": [
      { "year": "2003", "event_ar": "حدث مهم بالعربية", "event_en": "Key event in English", "type": "milestone|award|crisis|founding|death|other" }
    ],
    "sections": [
      {
        "title_ar": "عنوان المحور",
        "title_en": "Section Title",
        "content_ar": "محتوى تحريري مفصّل من 3-5 جمل — نص عادي",
        "content_en": "Detailed journalistic content 3-5 sentences — plain text"
      }
    ],
    "tags_ar": ["وسم1", "وسم2", "وسم3"],
    "tags_en": ["tag1", "tag2", "tag3"],
    "source": "اسم المصدر الرسمي",
    "sourceUrl": "https://رابط-حقيقي"
  }
}

قواعد صارمة:
- quick_facts: 3-5 حقائق أساسية مناسبة لنوع الموضوع (شخص/منظمة/دولة)
- stats: 3-5 أرقام أو إنجازات بارزة وحقيقية
- timeline: 5-10 أحداث زمنية مرتبة تصاعدياً من الأقدم للأحدث
- sections: 3-5 محاور تحريرية (النشأة، المسيرة، الإنجازات، التأثير، الجدل...)
- tags: 4-6 وسوم ذات صلة
- كل النصوص في body و sections: نص عادي بلا أي HTML أو وسوم
- avatar_color: اختر لوناً من: #4CB36C #373C55 #E05A2B #7B5EA7 #2196F3 #F59E0B #0891B2
- أرجع JSON فقط بدون أي نص قبله أو بعده${SOURCE_INSTRUCTION}`;
}
