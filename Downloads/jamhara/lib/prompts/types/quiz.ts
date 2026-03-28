/**
 * PROMPT: quiz — اختبار معرفي تفاعلي
 * ─────────────────────────────────────
 * VERSION : 1.0
 * UPDATED : مارس 2026
 * OUTPUT  : { title_ar, title_en, difficulty, questions[], source, sourceUrl }
 * SUBTYPES: mcq | true_false | timeline | matching | guess_who | speed
 * CHANGE LOG:
 *   v1.0 — استخراج buildPrompt() من generate-quiz/route.ts
 */

import type { QuizType } from "@/lib/supabase/types";
import { SOURCE_INSTRUCTION } from "../shared/sources";
import { TAGS_INSTRUCTION } from "../shared/tags";

export interface QuizPromptParams {
  /** الموضوع الفعّال */
  topic: string;
  /** اسم التصنيف بالعربية */
  categoryName: string;
  /** مستوى الصعوبة بالعربية (سهل/متوسط/صعب) */
  difficulty: string;
  /** مستوى الصعوبة بالإنجليزية (easy/medium/hard) */
  difficultyEn: string;
  /** نوع الاختبار */
  quizType: QuizType;
}

export function buildQuizPrompt({
  topic,
  categoryName,
  difficulty,
  difficultyEn,
  quizType,
}: QuizPromptParams): string {
  // الحقول المشتركة لجميع أنواع الاختبار
  const base = `أنت خبير تربوي ومصمم اختبارات معرفية. الموضوع: "${topic}" في تصنيف: ${categoryName}. مستوى الصعوبة: ${difficulty}.
**ابحث أولاً** في الإنترنت عن أحدث المعلومات الموثوقة، ثم أنتج JSON فقط بدون markdown أو نص إضافي.

الحقول العامة المطلوبة دائماً:
{ "title_ar": "عنوان مثير بالعربية", "title_en": "Catchy title in English", "difficulty": "${difficultyEn}", "tags": ["وسم1", "وسم2", ...],
  "tags_en": ["tag1", "tag2", ...], "source": "اسم المصدر", "sourceUrl": "https://رابط-حقيقي-من-نتائج-البحث" }
${TAGS_INSTRUCTION}${SOURCE_INSTRUCTION}`;

  switch (quizType) {

    case "mcq":
      return `${base}

أضف حقل "questions" يحتوي على 6 أسئلة بهذا الشكل:
{
  "type": "mcq",
  "question_ar": "نص السؤال",
  "question_en": "Question text",
  "options_ar": ["الخيار أ","الخيار ب","الخيار ج","الخيار د"],
  "options_en": ["Option A","Option B","Option C","Option D"],
  "correct_index": 0,
  "explanation_ar": "شرح موجز",
  "explanation_en": "Brief explanation"
}
قواعد: 6 أسئلة بالضبط، 4 خيارات لكل سؤال، وزّع correct_index بشكل متوازن، نص عادي بدون HTML.`;

    case "true_false":
      return `${base}

أضف حقل "questions" يحتوي على 10 جمل صواب/خطأ:
{
  "type": "true_false",
  "statement_ar": "جملة حقيقية أو مضللة حول الموضوع",
  "statement_en": "A true or false statement about the topic",
  "is_true": true,
  "explanation_ar": "شرح لماذا هي صواب أو خطأ",
  "explanation_en": "Explanation of why it's true or false"
}
قواعد: 10 جمل بالضبط، 5 صواب و5 خطأ موزعة عشوائياً، الجمل محددة وقابلة للتحقق، نص عادي بدون HTML.`;

    case "timeline":
      return `${base}

أضف حقل "questions" يحتوي على 3 جولات ترتيب زمني:
{
  "type": "timeline",
  "instruction_ar": "رتّب هذه الأحداث من الأقدم إلى الأحدث:",
  "instruction_en": "Sort these events from oldest to most recent:",
  "events": [
    { "id": "1", "label_ar": "وصف الحدث", "label_en": "Event description", "order": 1, "year": "1950" },
    { "id": "2", "label_ar": "وصف الحدث", "label_en": "Event description", "order": 2, "year": "1965" },
    { "id": "3", "label_ar": "وصف الحدث", "label_en": "Event description", "order": 3, "year": "1980" },
    { "id": "4", "label_ar": "وصف الحدث", "label_en": "Event description", "order": 4, "year": "1995" },
    { "id": "5", "label_ar": "وصف الحدث", "label_en": "Event description", "order": 5, "year": "2010" }
  ]
}
قواعد: 3 جولات، كل جولة 5 أحداث، order يمثل الترتيب الصحيح (1=الأقدم)، year سنة أو تاريخ نصي، الأحداث واضحة ومختلفة.`;

    case "matching":
      return `${base}

أضف حقل "questions" يحتوي على 3 جولات مطابقة:
{
  "type": "matching",
  "instruction_ar": "طابق كل عنصر بمقابله:",
  "instruction_en": "Match each item with its pair:",
  "pairs": [
    { "id": "1", "left_ar": "مصطلح أو اسم", "left_en": "Term or name", "right_ar": "التعريف أو المقابل", "right_en": "Definition or match" },
    { "id": "2", "left_ar": "مصطلح أو اسم", "left_en": "Term or name", "right_ar": "التعريف أو المقابل", "right_en": "Definition or match" },
    { "id": "3", "left_ar": "مصطلح أو اسم", "left_en": "Term or name", "right_ar": "التعريف أو المقابل", "right_en": "Definition or match" },
    { "id": "4", "left_ar": "مصطلح أو اسم", "left_en": "Term or name", "right_ar": "التعريف أو المقابل", "right_en": "Definition or match" }
  ]
}
قواعد: 3 جولات، كل جولة 4 أزواج، العناصر قصيرة (لا تتجاوز 5 كلمات)، الأزواج متنوعة ومترابطة منطقياً.`;

    case "guess_who":
      return `${base}

أضف حقل "questions" يحتوي على 5 أسئلة "من أنا؟":
{
  "type": "guess_who",
  "hints_ar": ["تلميح 1 (غامض)", "تلميح 2 (أوضح)", "تلميح 3 (واضح جداً)"],
  "hints_en": ["Hint 1 (vague)", "Hint 2 (clearer)", "Hint 3 (quite obvious)"],
  "options_ar": ["الإجابة الصحيحة","خيار خاطئ قريب","خيار خاطئ","خيار خاطئ"],
  "options_en": ["Correct answer","Close wrong option","Wrong option","Wrong option"],
  "correct_index": 0,
  "explanation_ar": "شرح للإجابة",
  "explanation_en": "Explanation of the answer"
}
قواعد: 5 شخصيات/مفاهيم/دول/أحداث، 3 تلميحات لكل سؤال (من الأصعب للأسهل)، 4 خيارات معقولة، correct_index موزع بشكل متوازن.`;

    case "speed":
      return `${base}

أضف حقل "questions" يحتوي على 8 أسئلة سريعة:
{
  "type": "speed",
  "question_ar": "سؤال قصير ومباشر",
  "question_en": "Short direct question",
  "options_ar": ["الخيار أ","الخيار ب","الخيار ج","الخيار د"],
  "options_en": ["Option A","Option B","Option C","Option D"],
  "correct_index": 0,
  "time_limit": 12,
  "explanation_ar": "شرح موجز جداً",
  "explanation_en": "Very brief explanation"
}
قواعد: 8 أسئلة، time_limit بين 10-15 ثانية (أصعب الأسئلة = وقت أطول قليلاً)، الأسئلة قصيرة ومباشرة، 4 خيارات لكل سؤال.`;

    default:
      // fallback — mcq
      return `${base}

أضف حقل "questions" يحتوي على 6 أسئلة اختيار من متعدد بهذا الشكل:
{
  "type": "mcq",
  "question_ar": "نص السؤال",
  "question_en": "Question text",
  "options_ar": ["الخيار أ","الخيار ب","الخيار ج","الخيار د"],
  "options_en": ["Option A","Option B","Option C","Option D"],
  "correct_index": 0,
  "explanation_ar": "شرح موجز",
  "explanation_en": "Brief explanation"
}
قواعد: 6 أسئلة بالضبط، 4 خيارات لكل سؤال، وزّع correct_index بشكل متوازن، نص عادي بدون HTML.`;
  }
}
