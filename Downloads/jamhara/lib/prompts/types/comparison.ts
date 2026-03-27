/**
 * PROMPT: comparison — مقارنة متعددة الأنواع
 * ─────────────────────────────────────────────
 * VERSION : 1.0
 * UPDATED : مارس 2026
 * OUTPUT  : { title_ar, title_en, body_ar, body_en, comparison_config{} }
 * SUBTYPES: bars | matrix | profile | timeline_duel | stance | spectrum
 * CHANGE LOG:
 *   v1.0 — استخراج prompt_bars..prompt_spectrum وPROMPTS map من generate-comparison/route.ts
 */

import type { ComparisonType } from "@/lib/supabase/types";
import { SOURCE_INSTRUCTION } from "../shared/sources";
import { TAGS_INSTRUCTION } from "../shared/tags";

export interface ComparisonPromptParams {
  /** الموضوع الفعّال */
  topic: string;
  /** يُمرَّر category_slug كما هو في الـ route الأصلي */
  categorySlug: string;
  /** نوع المقارنة */
  comparisonType: ComparisonType;
}

// ── Sub-type builders ─────────────────────────────────────────────────────────

function prompt_bars(topic: string, cat: string): string {
  return `أنت محرر في منصة "جمهرة". أنشئ مقارنة بالأرقام عن: ${topic} (قسم: ${cat})

أرجع JSON صالحاً فقط:
{
  "title_ar": "العنوان بالعربية",
  "title_en": "Title in English",
  "body_ar": "ملخص تحليلي 2-3 جمل، نص عادي",
  "body_en": "Summary 2-3 sentences, plain text",
  "tags": ["وسم1", "وسم2", ...],
  "comparison_config": {
    "comparison_type": "bars",
    "entity_a": { "name_ar":"...", "name_en":"...", "emoji":"🔵", "color":"#7B5EA7" },
    "entity_b": { "name_ar":"...", "name_en":"...", "emoji":"🔴", "color":"#E05A2B" },
    "dimensions": [
      { "name_ar":"...", "name_en":"...", "score_a":85, "score_b":72, "note_ar":"ملاحظة قصيرة", "note_en":"short note" }
    ],
    "source": "...", "sourceUrl": "https://رابط-حقيقي-من-نتائج-البحث"
  }
}
قواعد: 5-8 محاور، الأرقام 0-100 واقعية ومتنوعة، نص بدون HTML.
${TAGS_INSTRUCTION}${SOURCE_INSTRUCTION}`;
}

function prompt_matrix(topic: string, cat: string): string {
  return `أنت محرر في منصة "جمهرة". أنشئ مقارنة بجدول الميزات عن: ${topic} (قسم: ${cat})

أرجع JSON صالحاً فقط:
{
  "title_ar": "العنوان بالعربية",
  "title_en": "Title in English",
  "body_ar": "ملخص تحليلي 2-3 جمل، نص عادي",
  "body_en": "Summary 2-3 sentences, plain text",
  "tags": ["وسم1", "وسم2", ...],
  "comparison_config": {
    "comparison_type": "matrix",
    "entity_a": { "name_ar":"...", "name_en":"...", "emoji":"🔵", "color":"#7B5EA7" },
    "entity_b": { "name_ar":"...", "name_en":"...", "emoji":"🔴", "color":"#E05A2B" },
    "features": [
      {
        "name_ar": "اسم الميزة",
        "name_en": "Feature name",
        "value_a": "yes",
        "value_b": "no",
        "note_ar": "ملاحظة اختيارية",
        "note_en": "optional note"
      }
    ],
    "source": "...", "sourceUrl": "https://رابط-حقيقي-من-نتائج-البحث"
  }
}
قواعد: 8-14 ميزة. قيمة value_a/value_b: "yes" أو "no" أو "partial" أو نص قصير واقعي. تنوّع بين القيم ولا تجعل طرفاً يفوز في كل شيء. نص بدون HTML.
${TAGS_INSTRUCTION}${SOURCE_INSTRUCTION}`;
}

function prompt_profile(topic: string, cat: string): string {
  return `أنت محرر في منصة "جمهرة". أنشئ مقارنة بطاقات ملف شخصي عن: ${topic} (قسم: ${cat})

أرجع JSON صالحاً فقط:
{
  "title_ar": "العنوان بالعربية",
  "title_en": "Title in English",
  "body_ar": "ملخص 2-3 جمل نص عادي",
  "body_en": "Summary 2-3 sentences plain text",
  "tags": ["وسم1", "وسم2", ...],
  "comparison_config": {
    "comparison_type": "profile",
    "entity_a": {
      "name_ar":"...", "name_en":"...", "emoji":"🔵", "color":"#7B5EA7",
      "subtitle_ar":"المسمى أو الدور", "subtitle_en":"role or title",
      "stats": [
        { "label_ar":"إحصاء", "label_en":"stat", "value":"القيمة" }
      ],
      "highlight_ar": "أبرز إنجاز في جملة واحدة",
      "highlight_en": "Top achievement in one sentence",
      "tags_ar": ["وسم1","وسم2"],
      "tags_en": ["tag1","tag2"]
    },
    "entity_b": { "...نفس الهيكل..." },
    "source": "...", "sourceUrl": "https://رابط-حقيقي-من-نتائج-البحث"
  }
}
قواعد: 4-6 إحصاءات، 2-4 وسوم، إنجاز بارز واحد. نص بدون HTML.
${TAGS_INSTRUCTION}${SOURCE_INSTRUCTION}`;
}

function prompt_timeline_duel(topic: string, cat: string): string {
  return `أنت محرر في منصة "جمهرة". أنشئ مقارنة تطور عبر الزمن عن: ${topic} (قسم: ${cat})

أرجع JSON صالحاً فقط:
{
  "title_ar": "العنوان بالعربية",
  "title_en": "Title in English",
  "body_ar": "ملخص 2-3 جمل نص عادي",
  "body_en": "Summary 2-3 sentences plain text",
  "tags": ["وسم1", "وسم2", ...],
  "comparison_config": {
    "comparison_type": "timeline_duel",
    "entity_a": { "name_ar":"...", "name_en":"...", "emoji":"🔵", "color":"#7B5EA7" },
    "entity_b": { "name_ar":"...", "name_en":"...", "emoji":"🔴", "color":"#E05A2B" },
    "unit_ar": "وحدة القياس (مثل: مليار دولار، مليون نسمة)",
    "unit_en": "unit (e.g.: billion USD, million)",
    "data_points": [
      { "label": "2015", "value_a": 120, "value_b": 80 }
    ],
    "source": "...", "sourceUrl": "https://رابط-حقيقي-من-نتائج-البحث"
  }
}
قواعد: 8-12 نقطة زمنية واقعية ودقيقة، القيم أرقام حقيقية. نص بدون HTML.
${TAGS_INSTRUCTION}${SOURCE_INSTRUCTION}`;
}

function prompt_stance(topic: string, cat: string): string {
  return `أنت محرر في منصة "جمهرة". أنشئ مقارنة تناقض المواقف عن: ${topic} (قسم: ${cat})

أرجع JSON صالحاً فقط:
{
  "title_ar": "العنوان بالعربية",
  "title_en": "Title in English",
  "body_ar": "ملخص 2-3 جمل نص عادي",
  "body_en": "Summary 2-3 sentences plain text",
  "tags": ["وسم1", "وسم2", ...],
  "comparison_config": {
    "comparison_type": "stance",
    "entity_a": { "name_ar":"...", "name_en":"...", "emoji":"🔵", "color":"#7B5EA7" },
    "entity_b": { "name_ar":"...", "name_en":"...", "emoji":"🔴", "color":"#E05A2B" },
    "topics": [
      {
        "topic_ar": "المحور أو السؤال بالعربية",
        "topic_en": "Topic or question in English",
        "stance_a_ar": "موقف الطرف الأول (2-3 جمل واضحة)",
        "stance_a_en": "Entity A stance (2-3 clear sentences)",
        "stance_b_ar": "موقف الطرف الثاني (2-3 جمل واضحة)",
        "stance_b_en": "Entity B stance (2-3 clear sentences)"
      }
    ],
    "source": "...", "sourceUrl": "https://رابط-حقيقي-من-نتائج-البحث"
  }
}
قواعد: 4-7 محاور، المواقف متباينة وواقعية وموضوعية، نص بدون HTML.
${TAGS_INSTRUCTION}${SOURCE_INSTRUCTION}`;
}

function prompt_spectrum(topic: string, cat: string): string {
  return `أنت محرر في منصة "جمهرة". أنشئ مقارنة مقياس الطيف عن: ${topic} (قسم: ${cat})

أرجع JSON صالحاً فقط:
{
  "title_ar": "العنوان بالعربية",
  "title_en": "Title in English",
  "body_ar": "ملخص 2-3 جمل نص عادي",
  "body_en": "Summary 2-3 sentences plain text",
  "tags": ["وسم1", "وسم2", ...],
  "comparison_config": {
    "comparison_type": "spectrum",
    "entity_a": { "name_ar":"...", "name_en":"...", "emoji":"🔵", "color":"#7B5EA7" },
    "entity_b": { "name_ar":"...", "name_en":"...", "emoji":"🔴", "color":"#E05A2B" },
    "axes": [
      {
        "name_ar": "اسم المحور",
        "name_en": "Axis name",
        "min_label_ar": "التسمية اليسرى (القطب السلبي)",
        "min_label_en": "Left label (negative pole)",
        "max_label_ar": "التسمية اليمنى (القطب الإيجابي)",
        "max_label_en": "Right label (positive pole)",
        "position_a": 35,
        "position_b": 75,
        "note_ar": "ملاحظة قصيرة اختيارية",
        "note_en": "optional short note"
      }
    ],
    "source": "...", "sourceUrl": "https://رابط-حقيقي-من-نتائج-البحث"
  }
}
قواعد: 4-7 محاور طيفية، position_a وposition_b بين 0-100 وواقعيتان، التسميات قصيرة (كلمة أو كلمتان). نص بدون HTML.
${TAGS_INSTRUCTION}${SOURCE_INSTRUCTION}`;
}

// ── Map (لتبسيط lookup في الـ route) ─────────────────────────────────────────

const BUILDERS: Record<ComparisonType, (topic: string, cat: string) => string> = {
  bars:          prompt_bars,
  matrix:        prompt_matrix,
  profile:       prompt_profile,
  timeline_duel: prompt_timeline_duel,
  stance:        prompt_stance,
  spectrum:      prompt_spectrum,
};

// ── Main builder ──────────────────────────────────────────────────────────────

export function buildComparisonPrompt({
  topic,
  categorySlug,
  comparisonType,
}: ComparisonPromptParams): string {
  const builder = BUILDERS[comparisonType] ?? BUILDERS.bars;
  return builder(topic, categorySlug);
}
