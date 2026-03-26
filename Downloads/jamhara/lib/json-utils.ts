/**
 * أدوات JSON مشتركة لجميع routes التوليد
 * المصدر الوحيد للحقيقة — لا تنسخ هذه الدوال في أي route
 */

/**
 * تُزيل <cite> tags التي يُدرجها Anthropic web_search تلقائياً
 * تُبقي النص داخل الوسوم سليماً
 */
export function stripCiteTags(text: string): string {
  return text
    .replace(/<cite[^>]*>([\s\S]*?)<\/cite>/g, "$1")
    .replace(/<\/?cite[^>]*>/g, "")
    .trim();
}

/**
 * تُنظّف نص JSON قبل الـ parse:
 * - تحذف trailing commas قبل ] أو }
 * - تحذف block comments فقط (لا تحذف // لأنها موجودة في URLs)
 */
export function sanitizeJSON(str: string): string {
  return str
    .replace(/\/\*[\s\S]*?\*\//g, "")   // block comments فقط
    .replace(/,\s*([\]}])/g, "$1");      // trailing commas
}

/**
 * دالة استخراج JSON قوية — تجرب عدة استراتيجيات:
 * 1. نص مباشر
 * 2. فقرة ```json``` مسوّرة
 * 3. أول { ... } في النص
 * في كل محاولة: تجرب parse مباشرة، ثم بعد sanitize
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractJSON(raw: string): any {
  const cleaned = stripCiteTags(raw);

  // استراتيجية 1: النص كاملاً
  for (const candidate of [cleaned, sanitizeJSON(cleaned)]) {
    try { return JSON.parse(candidate.trim()); } catch { /* continue */ }
  }

  // استراتيجية 2: ```json ... ``` أو ``` ... ```
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    for (const candidate of [fenced[1], sanitizeJSON(fenced[1])]) {
      try { return JSON.parse(candidate.trim()); } catch { /* continue */ }
    }
  }

  // استراتيجية 3: أول { ... } في النص (greedy — من أول { لآخر })
  const brace = cleaned.match(/\{[\s\S]*\}/);
  if (brace) {
    for (const candidate of [brace[0], sanitizeJSON(brace[0])]) {
      try { return JSON.parse(candidate); } catch { /* continue */ }
    }
  }

  return null;
}
