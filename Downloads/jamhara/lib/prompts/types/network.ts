/**
 * PROMPT: network — خريطة الصلات (شبكة علاقات)
 * ─────────────────────────────────────────────────
 * VERSION : 1.0
 * UPDATED : مارس 2026
 * OUTPUT  : { title_ar, title_en, body_ar, body_en, content_config{ center_ar/en, center_emoji, nodes[], source } }
 * RELATION TYPES: ally | rival | partner | client | parent | subsidiary | competitor | neutral | other
 * CHANGE LOG:
 *   v1.0 — استخراج من generate-network/route.ts
 */

import { SOURCE_INSTRUCTION } from "../shared/sources";
import { TAGS_INSTRUCTION } from "../shared/tags";

export interface NetworkPromptParams {
  topic: string;
  categoryName: string;
}

export function buildNetworkPrompt({ topic, categoryName }: NetworkPromptParams): string {
  return `أنت محلل سياسي في منصة "جمهرة". ارسم خريطة علاقات حول: ${topic}

أرجع JSON بهذا الهيكل:
{
  "title_ar": "عنوان خريطة الصلات",
  "title_en": "Network Map Title",
  "body_ar": "مقدمة موجزة تشرح طبيعة العلاقات وأهميتها — 2-3 جمل",
  "body_en": "Brief intro explaining the relationships — 2-3 sentences",
  "tags": ["وسم1", "وسم2", "..."],
  "tags_en": ["tag1", "tag2", ...],
  "content_config": {
    "center_ar": "اسم الجهة المركزية",
    "center_en": "Central Entity Name",
    "center_emoji": "إيموجي يمثلها",
    "center_role_ar": "دور أو وصف مختصر",
    "center_role_en": "Role or short description",
    "nodes": [
      {
        "name_ar": "اسم الطرف المرتبط",
        "name_en": "Connected Party Name",
        "emoji": "إيموجي",
        "role_ar": "دور مختصر",
        "role_en": "Short role",
        "relation_type": "ally|rival|partner|client|parent|subsidiary|competitor|neutral|other",
        "relation_label_ar": "وصف العلاقة مثل: حليف استراتيجي",
        "relation_label_en": "Relationship description e.g.: Strategic Ally",
        "strength": "strong|medium|weak",
        "description_ar": "جملة واحدة تشرح طبيعة العلاقة",
        "description_en": "One sentence explaining the relationship"
      }
    ],
    "source": "اسم المصدر",
    "sourceUrl": "https://رابط-حقيقي"
  }
}

قواعد: 5-10 عقد مترابطة، تنوع في أنواع العلاقات (حليف/خصم/شريك/تابع...)، معلومات دقيقة وحقيقية.
أرجع JSON فقط بدون أي نص إضافي.${TAGS_INSTRUCTION}${SOURCE_INSTRUCTION}`;
}
