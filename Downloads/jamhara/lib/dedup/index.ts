/**
 * lib/dedup/index.ts
 * ────────────────────────────────────────────────────────────────
 * نظام منع تكرار المحتوى في جمهرة — 3 طبقات
 *
 *  Layer 1 — Scheduler Diversity    → pickDiverseCombinations()
 *  Layer 2 — Topic Registry Check   → checkTopicDuplicate()
 *  Layer 2 — Topic Registration     → registerTopic()
 *  Layer 3 — Context Injection      → getRecentTopics()
 * ────────────────────────────────────────────────────────────────
 */

import { createAdminClient } from "@/lib/supabase/admin";

// ── Types ────────────────────────────────────────────────────────

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  similarTopic?: string;
  similarPostId?: string;
  score?: number;
  daysAgo?: number;
}

// ── Configuration ─────────────────────────────────────────────────
// كم يوم يجب أن يمر قبل أن يُسمح بموضوع مشابه

export const COOLDOWN_DAYS: Record<string, number> = {
  article:    14,
  profile:    30,
  factcheck:  14,
  map:        14,
  chart:       7,
  quiz:        7,
  comparison: 14,
  ranking:    14,
  numbers:    14,
  scenarios:  21,
  timeline:   30,
  briefing:    7,
  quotes:     14,
  explainer:  21,
  debate:     21,
  guide:      30,
  network:    30,
  interview:  30,
};

// عتبة التشابه — أرقام أصغر = أكثر حساسية
export const SIMILARITY_THRESHOLD: Record<string, number> = {
  article:    0.30,
  profile:    0.40,
  factcheck:  0.35,
  map:        0.35,
};
const DEFAULT_THRESHOLD = 0.35;

// ── Arabic Text Normalization ─────────────────────────────────────
// تطابق دالة DB normalize_arabic_text

function normalizeArabicText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "");
}

// ── Layer 2a — Pre-generation Duplicate Check ─────────────────────

/**
 * تفحص ما إذا كان الموضوع المقترح قريباً جداً من محتوى حديث.
 * تُستدعى قبل التوليد عندما يُوفَّر topic صريح.
 * FAIL OPEN — خطأ DB لا يوقف التوليد.
 */
export async function checkTopicDuplicate(
  topic: string,
  postType: string,
  categorySlug?: string,
): Promise<DuplicateCheckResult> {
  if (!topic?.trim()) return { isDuplicate: false };

  try {
    const supabase = createAdminClient();
    const threshold = SIMILARITY_THRESHOLD[postType] ?? DEFAULT_THRESHOLD;
    const daysBack  = COOLDOWN_DAYS[postType] ?? 14;

    const { data, error } = await supabase.rpc("check_topic_duplicate", {
      p_topic:          topic.trim(),
      p_post_type:      postType,
      p_category_slug:  categorySlug ?? null,
      p_days_back:      daysBack,
      p_threshold:      threshold,
    });

    if (error) {
      console.warn("[dedup] check RPC error:", error.message);
      return { isDuplicate: false };
    }

    if (!data || (data as unknown[]).length === 0) return { isDuplicate: false };

    const row = (data as {
      is_duplicate: boolean;
      similar_topic: string;
      similar_post_id: string | null;
      similarity_score: number;
      days_ago: number;
    }[])[0];

    return {
      isDuplicate:   row.is_duplicate,
      similarTopic:  row.similar_topic,
      similarPostId: row.similar_post_id ?? undefined,
      score:         row.similarity_score,
      daysAgo:       row.days_ago,
    };
  } catch (e) {
    console.warn("[dedup] checkTopicDuplicate exception:", e instanceof Error ? e.message : e);
    return { isDuplicate: false };
  }
}

// ── Layer 2b — Post-generation Registration ───────────────────────

/**
 * يُسجّل الموضوع في topic_registry بعد الحفظ الناجح.
 * يُستدعى دائماً (حتى بدون topic صريح) باستخدام title_ar.
 * FIRE-AND-FORGET SAFE — لا يُوقف المسار الرئيسي عند الفشل.
 */
export async function registerTopic(
  topic: string,
  postType: string,
  categorySlug: string,
  postId?: string,
): Promise<void> {
  if (!topic?.trim()) return;

  try {
    const supabase = createAdminClient();

    await supabase.from("topic_registry").insert({
      topic_original:   topic.trim(),
      topic_normalized: normalizeArabicText(topic),
      post_type:        postType,
      category_slug:    categorySlug,
      post_id:          postId ?? null,
    });
  } catch (e) {
    console.warn("[dedup] registerTopic exception:", e instanceof Error ? e.message : e);
  }
}

// ── Layer 3 — Context Injection ───────────────────────────────────

/**
 * يجلب قائمة المواضيع الأخيرة في نفس التصنيف والنوع
 * لحقنها في البرومبت كـ "لا تكرر هذه المواضيع".
 */
export async function getRecentTopics(
  categorySlug: string,
  postType: string,
  limit = 10,
  daysBack = 14,
): Promise<string[]> {
  try {
    const supabase = createAdminClient();
    const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

    const { data } = await supabase
      .from("topic_registry")
      .select("topic_original")
      .eq("category_slug", categorySlug)
      .eq("post_type", postType)
      .gte("generated_at", since)
      .order("generated_at", { ascending: false })
      .limit(limit);

    return (data ?? []).map((r: { topic_original: string }) => r.topic_original);
  } catch {
    return [];
  }
}

// ── Layer 1 — Scheduler Diversity ────────────────────────────────

/**
 * بالنسبة لمجموعة من التصنيفات والأنواع، تُعيد N مجموعة متنوعة
 * بناءً على الأقل استخداماً حديثاً.
 */
export async function pickDiverseCombinations(
  categorySlugs: string[],
  postTypes: string[],
  count: number,
): Promise<Array<{ categorySlug: string; postType: string }>> {
  try {
    const supabase = createAdminClient();

    const { data } = await supabase
      .from("topic_registry")
      .select("category_slug, post_type, generated_at")
      .in("category_slug", categorySlugs)
      .in("post_type", postTypes)
      .order("generated_at", { ascending: false })
      .limit(categorySlugs.length * postTypes.length);

    // بناء خريطة: "type:slug" → آخر استخدام
    const lastUsed = new Map<string, number>();
    for (const row of (data ?? []) as {
      category_slug: string;
      post_type: string;
      generated_at: string;
    }[]) {
      const key = `${row.post_type}:${row.category_slug}`;
      if (!lastUsed.has(key)) {
        lastUsed.set(key, new Date(row.generated_at).getTime());
      }
    }

    // بناء كل المجموعات الممكنة مرتبة حسب الأقدم
    // random jitter يمنع الحلقة المفرغة: عندما تفشل مجموعة دائماً لا تُسجَّل في topic_registry
    // فيبقى lastTs=0 وتُختار مجدداً — الـ jitter يضمن التنويع حتى عند التساوي
    const JITTER_MS = 60 * 60 * 1000; // ساعة واحدة كحد أقصى للـ jitter
    const all: Array<{ categorySlug: string; postType: string; lastTs: number }> = [];
    for (const slug of categorySlugs) {
      for (const type of postTypes) {
        const base = lastUsed.get(`${type}:${slug}`) ?? 0;
        all.push({
          categorySlug: slug,
          postType:     type,
          // jitter صغير عشوائي — يُميّز المجموعات المتساوية لمنع الاختيار الثابت
          lastTs: base + Math.random() * JITTER_MS,
        });
      }
    }

    all.sort((a, b) => a.lastTs - b.lastTs);

    // اختر أول N مجموعات (الأقدم) مع ضمان عدم تكرار نفس التصنيف
    const result: Array<{ categorySlug: string; postType: string }> = [];
    const usedSlugs = new Set<string>();

    for (const combo of all) {
      if (result.length >= count) break;
      if (usedSlugs.has(combo.categorySlug)) continue;
      result.push({ categorySlug: combo.categorySlug, postType: combo.postType });
      usedSlugs.add(combo.categorySlug);
    }

    // إذا لم نكتمل، أكمل بدون قيد التصنيف
    if (result.length < count) {
      for (const combo of all) {
        if (result.length >= count) break;
        if (result.some(r => r.categorySlug === combo.categorySlug && r.postType === combo.postType)) continue;
        result.push({ categorySlug: combo.categorySlug, postType: combo.postType });
      }
    }

    return result;
  } catch {
    // fallback: عشوائي
    const shuffled = [...categorySlugs].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(slug => ({
      categorySlug: slug,
      postType: postTypes[Math.floor(Math.random() * postTypes.length)],
    }));
  }
}
