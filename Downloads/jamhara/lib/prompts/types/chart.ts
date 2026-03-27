/**
 * PROMPT: chart — مخطط بياني تفاعلي
 * ─────────────────────────────────────
 * VERSION : 1.0
 * UPDATED : مارس 2026
 * OUTPUT  : { title_ar, title_en, body_ar, body_en, chart_config{} }
 * TYPES   : 15 نوعاً محدداً + auto (يختار Claude)
 * CHANGE LOG:
 *   v1.0 — استخراج من generate-chart/route.ts
 *           نقل CHART_LABELS وbuildChartTypeInstruction من الـ route
 */

import { SOURCE_INSTRUCTION } from "../shared/sources";
import { TAGS_INSTRUCTION } from "../shared/tags";

// ── تسميات أنواع المخططات ─────────────────────────────────────────────────────
// لإضافة نوع جديد: أضف مدخلاً هنا وسيظهر تلقائياً في الـ auto instruction
export const CHART_LABELS: Record<string, string> = {
  area:             "منطقة (area) — تطور زمني مع تظليل المساحة",
  line:             "خطي (line) — سلاسل زمنية متعددة",
  bar:              "أعمدة (bar) — مقارنات بين فئات",
  pie:              "دائري (pie) — توزيع نسبي (3-6 فئات)",
  donut:            "حلقي (donut) — توزيع نسبي مع إجمالي في المنتصف",
  scatter:          "نقطي/فقاعي (scatter) — علاقة بين متغيرين مع z للحجم",
  radar:            "رادار (radar) — مقارنة كيانات عبر أبعاد متعددة",
  composed:         "مركّب (composed) — مزج أعمدة مع خط على نفس الرسم",
  "bar-horizontal": "أعمدة أفقية (bar-horizontal) — مقارنات مع أسماء طويلة أو فئات كثيرة",
  "bar-stacked":    "أعمدة مكدسة (bar-stacked) — أجزاء مكدسة فوق بعضها، لإظهار المجموع والتوزيع معاً",
  "bar-100":        "أعمدة 100% (bar-100) — كل عمود = 100%، لمقارنة التوزيع النسبي بين فترات",
  "area-stacked":   "منطقة مكدسة (area-stacked) — إجماليات متراكمة عبر الزمن",
  treemap:          "شجرة النسب (treemap) — مستطيلات بأحجام تناسبية لبيانات هرمية",
  funnel:           "قمع (funnel) — مراحل تتناقص تدريجياً لإظهار معدلات التحويل أو الإتمام",
  radialbar:        "أعمدة دائرية (radialbar) — أقواس دائرية لمقارنة قيم متعددة بصرياً",
};

/**
 * يبني تعليمة نوع المخطط:
 * - إذا حُدّد chart_type → إلزامي على Claude استخدامه
 * - إذا لم يُحدَّد → Claude يختار الأنسب من القائمة الكاملة
 */
export function buildChartTypeInstruction(chartType?: string): string {
  if (chartType && CHART_LABELS[chartType]) {
    return `**نوع المخطط محدد مسبقاً:** استخدم "${chartType}" — ${CHART_LABELS[chartType]}. يجب أن يكون chartType = "${chartType}" في JSON بالضبط.`;
  }
  const allTypes = Object.entries(CHART_LABELS)
    .map(([k, v]) => `- "${k}": ${v}`)
    .join("\n");
  return `اختر نوع المخطط الأنسب للبيانات:\n${allTypes}`;
}

// ── Params ────────────────────────────────────────────────────────────────────

export interface ChartPromptParams {
  /** الموضوع الفعّال (topic أو fallback تلقائي) */
  topic: string;
  /** اسم التصنيف بالعربية */
  categoryName: string;
  /** تعليمة النوع — أنتجها بـ buildChartTypeInstruction() */
  chartTypeInstruction: string;
}

// ── Builder ───────────────────────────────────────────────────────────────────

export function buildChartPrompt({
  topic,
  categoryName,
  chartTypeInstruction,
}: ChartPromptParams): string {
  return `أنت خبير بيانات ومصمم مخططات بيانية متخصص في إنتاج محتوى تفاعلي غني باللغة العربية.

المطلوب: مخطط بياني تفاعلي احترافي عن: "${topic}" في تصنيف: ${categoryName}

**ابحث أولاً** في الإنترنت عن أحدث البيانات الموثوقة المتعلقة بهذا الموضوع، ثم أنتج JSON دقيقاً.

${chartTypeInstruction}

للـ composed: أضف "seriesType": "bar" أو "line" أو "area" لكل series.

أنتج JSON بهذا الهيكل بالضبط (JSON فقط، بدون أي نص):
{
  "title_ar": "عنوان دقيق ومعبّر بالعربية",
  "title_en": "Precise English title",
  "body_ar": "تحليل من 4-6 جمل يشرح أبرز الاستنتاجات والاتجاهات والمفاجآت في البيانات",
  "body_en": "4-6 sentence analytical description in English",
  "tags": ["وسم1", "وسم2", ...],
  "chart_config": {
    "chartType": "area|line|bar|pie|donut|scatter|radar|composed",
    "stats": [
      { "label": "تسمية موجزة", "value": "القيمة أو النص", "unit": "الوحدة" }
    ],
    "series": [
      {
        "name": "اسم السلسلة",
        "color": "#hex",
        "seriesType": "bar",
        "data": [{ "x": "قيمة أو سنة", "y": 0, "z": 0, "label": "تسمية اختيارية" }]
      }
    ],
    "xAxis": { "label": "تسمية المحور الأفقي" },
    "yAxis": { "label": "تسمية المحور العمودي", "unit": "%" },
    "annotations": [
      { "x": "نقطة محددة", "label": "تعليق مختصر", "color": "#E05A2B" }
    ],
    "source": "اسم المصدر الرسمي",
    "sourceUrl": "https://رابط-حقيقي-من-نتائج-البحث"
  }
}

قواعد صارمة:
- ابحث عن بيانات حقيقية وحديثة قبل الإجابة
- stats: 2-4 إحصاءات ملخّصة ذات معنى (الأعلى، الأدنى، المتوسط، نقطة مفصلية)
- للـ scatter/bubble: 10-20 نقطة بيانات، z = حجم الفقاعة (اختياري)
- للـ radar: 5-8 أبعاد كحد أقصى، 2-4 كيانات للمقارنة
- للـ composed: السلسلة الأولى عادةً bar، الثانية line أو area
- الألوان المفضلة: #4CB36C #373C55 #E05A2B #7B5EA7 #2196F3 #F59E0B
- annotations: 2-4 نقاط مهمة فقط (أحداث، ذروات، تحولات)
- لا تضع أكثر من 8 فئات في pie أو donut
- أرجع JSON فقط، بدون markdown أو نص قبله أو بعده
- النص في body_ar وbody_en يجب أن يكون نصاً عادياً فقط، بدون أي وسوم HTML أو XML أو citation tags من أي نوع
${TAGS_INSTRUCTION}${SOURCE_INSTRUCTION}`;
}
