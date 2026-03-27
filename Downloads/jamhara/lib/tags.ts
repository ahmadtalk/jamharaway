/**
 * lib/tags.ts — نظام الوسوم (SEO Tags)
 * ────────────────────────────────────
 * - توحيد المصطلحات (سورية → سوريا)
 * - تنظيف الوسوم وإزالة المكررات
 * - تحويل الوسم إلى slug للـ URL
 */

// ── جدول توحيد المصطلحات ──────────────────────────────────────────────────────
// المفتاح: الشكل المقبول | القيمة: بدائله التي تُوحَّد إليه
const TERM_MAP: Record<string, string[]> = {
  "سوريا":               ["سورية", "سوريه"],
  "فلسطين":              ["فلسطينيون", "الفلسطينيون"],
  "إيران":               ["ايران", "إيران", "ايران"],
  "الولايات المتحدة":    ["أمريكا", "امريكا", "الولايات المتحدة الأمريكية", "واشنطن"],
  "روسيا":               ["روسيه", "روسية"],
  "إسرائيل":             ["اسرائيل", "إسرائيل"],
  "تركيا":               ["تركيه"],
  "السعودية":            ["المملكة العربية السعودية", "السعوديه", "الرياض"],
  "مصر":                 ["مصر العربية"],
  "لبنان":               ["لبنانيون"],
  "العراق":              ["العراق العربي"],
  "اليمن":               ["اليمنيون"],
  "ليبيا":               ["ليبيه"],
  "السودان":             ["السودانيون"],
  "تونس":                ["تونسيون"],
  "الجزائر":             ["الجزائريون"],
  "المغرب":              ["المغرب العربي"],
  "الأردن":              ["الأردنيون"],
  "داعش":                ["تنظيم داعش", "تنظيم الدولة", "داعش الإرهابي", "ISIS", "ISIL"],
  "حماس":                ["حركة حماس", "حركة المقاومة الإسلامية"],
  "حزب الله":            ["حزب‌الله", "حزب اللة"],
  "الأمم المتحدة":       ["الأمم المتحده", "هيئة الأمم المتحدة", "UN", "مجلس الأمن"],
  "الاتحاد الأوروبي":   ["الاتحاد الاوروبي", "EU"],
  "حلف الناتو":          ["الناتو", "NATO", "حلف شمال الأطلسي"],
  "صندوق النقد الدولي": ["IMF", "صندوق النقد"],
  "البنك الدولي":        ["World Bank"],
  "الجامعة العربية":    ["الجامعه العربية", "جامعة الدول العربية"],
};

// بناء فهرس عكسي: البديل → الشكل الصحيح
const REVERSE_MAP = new Map<string, string>();
for (const [canonical, variants] of Object.entries(TERM_MAP)) {
  for (const v of variants) {
    REVERSE_MAP.set(v.trim().toLowerCase(), canonical);
  }
}

/**
 * توحيد وسم واحد — يُعيد الشكل الصحيح إن وُجد بديل
 */
function normalizeOne(tag: string): string {
  const trimmed = tag.trim();
  if (!trimmed) return "";
  const lower = trimmed.toLowerCase();
  return REVERSE_MAP.get(lower) ?? trimmed;
}

/**
 * تنظيف وتوحيد مصفوفة وسوم:
 * - يزيل الفراغات
 * - يوحّد المصطلحات
 * - يزيل المكررات
 * - يحدّ بـ 12 وسم كحد أقصى
 */
export function normalizeTags(tags: string[]): string[] {
  if (!tags?.length) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of tags) {
    const normalized = normalizeOne(raw);
    if (!normalized || normalized.length < 2) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
    if (result.length >= 12) break;
  }
  return result;
}

/**
 * تحويل الوسم إلى slug مناسب للـ URL
 * يُبقي العربية كما هي (المتصفحات الحديثة تدعمها)
 */
export function tagToSlug(tag: string): string {
  return encodeURIComponent(tag.trim());
}

/**
 * استعادة الوسم من الـ slug
 */
export function slugToTag(slug: string): string {
  try { return decodeURIComponent(slug); }
  catch { return slug; }
}

/**
 * رابط صفحة الوسم
 * وسوم ASCII (إنجليزية) — بدون encode | وسوم عربية — encodeURIComponent
 */
export function tagHref(tag: string, locale: string): string {
  const prefix = locale === "en" ? "/en" : "";
  const slug = /^[\x00-\x7F]+$/.test(tag) ? tag : tagToSlug(tag);
  return `${prefix}/tag/${slug}`;
}
