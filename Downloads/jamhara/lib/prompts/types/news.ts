/**
 * PROMPT: news — خبر صحفي
 * ─────────────────────────────────
 * VERSION : 1.0
 * UPDATED : مارس 2026
 * INPUT   : title, description, content, source_name, source_url (من GNews API)
 * OUTPUT  : { title_ar, body_ar }
 * STYLE   : هرم مقلوب — حدث واحد — 150-200 كلمة
 */

export interface NewsPromptParams {
  title: string;
  description: string;
  content: string;
  sourceName: string;
}

export function buildNewsPrompt({ title, description, content, sourceName }: NewsPromptParams): string {
  return `أنت محرر أخبار في منصة "جمهرة". أعِد صياغة هذا الخبر بالعربية الفصحى بأسلوب هرم مقلوب احترافي.

المصدر: ${sourceName}
العنوان الأصلي: ${title}
المقدمة: ${description}
المحتوى: ${content}

أنتج JSON فقط:

{
  "title_ar": "عنوان مباشر ومكثف ≤ 12 كلمة — يُصف الحدث لا الموضوع — بلا علامات استفهام",
  "body_ar": "متن 150-200 كلمة بالضبط — هيكل الهرم المقلوب: الفقرة الأولى تجيب عن (من؟ ماذا؟ متى؟ أين؟) في جملتين — ثم التفاصيل الأساسية — ثم السياق المباشر فقط — حدث واحد لا تشتيت — نص عادي بلا HTML"
}

قواعد صارمة:
- العنوان: خبري مباشر، فعل في الماضي أو المضارع، بدون "يكشف" / "يُثير" / "يُحذر"
- المتن: لا تاريخ بعيد، لا أحداث سابقة غير لصيقة بالخبر، لا تعليق تحريري
- اللغة: فصحى سلسة كالجزيرة والعربية — لا ترجمة حرفية
- أرجع JSON فقط بدون أي نص قبله أو بعده`;
}
