/**
 * Shared utilities for all generate API routes.
 *
 * SOURCE_INSTRUCTION مُنقول إلى lib/prompts/shared/sources.ts
 * هذا الملف يُعيد تصديره للتوافق مع الكود القديم.
 * الـ routes الجديدة تستورد من "@/lib/prompts" مباشرة.
 */
export { SOURCE_INSTRUCTION } from "./prompts/shared/sources";

/**
 * Normalizes a single source {name, url} pair into a sources array.
 * Used by card components to pass consistent data to JCardShell.
 */
export function toSourcesArray(
  source?: string | null,
  sourceUrl?: string | null
): { name: string; url: string }[] {
  if (!sourceUrl) return [];
  return [{ name: source || "المصدر", url: sourceUrl }];
}
