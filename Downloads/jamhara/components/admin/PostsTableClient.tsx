"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TogglePublishButton } from "@/components/admin/TogglePublishButton";
import { DeleteButton } from "@/components/admin/DeleteButton";

/* ── Type maps (duplicated from server page) ── */
const TYPE_EMOJI: Record<string, string> = {
  article: "📰",
  chart: "📊",
  quiz: "🧠",
  comparison: "⚔️",
  ranking: "🏆",
  numbers: "📋",
  scenarios: "🔀",
  timeline: "📅",
  factcheck: "✅",
};

const TYPE_LABEL: Record<string, string> = {
  article: "مقالة",
  chart: "مخطط",
  quiz: "اختبار",
  comparison: "مقارنة",
  ranking: "تصنيف",
  numbers: "أرقام",
  scenarios: "سيناريو",
  timeline: "خط زمني",
  factcheck: "تحقق",
};

const TYPE_COLOR: Record<string, string> = {
  article: "#6B7280",
  chart: "#2196F3",
  quiz: "#7B5EA7",
  comparison: "#E05A2B",
  ranking: "#F59E0B",
  numbers: "#2196F3",
  scenarios: "#7B5EA7",
  timeline: "#373C55",
  factcheck: "#4CB36C",
};

/* ── Types ── */
type PostRow = {
  id: string;
  title_ar: string;
  type: string;
  published_at: string | null;
  view_count: number;
  like_count: number;
  status: string;
  categories:
    | { name_ar: string; color: string | null }
    | { name_ar: string; color: string | null }[]
    | null;
};

interface PostsTableClientProps {
  posts: PostRow[];
  totalCount: number;
  page: number;
  totalPages: number;
  currentSort: string;
  currentDir: "asc" | "desc";
  urlParams: { q: string; typeFilter: string; statusFilter: string; page: string };
}

export function PostsTableClient({
  posts,
  totalCount,
  page,
  totalPages,
  currentSort,
  currentDir,
  urlParams,
}: PostsTableClientProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  /* ── URL builder ── */
  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (urlParams.q) p.set("q", urlParams.q);
    if (urlParams.typeFilter) p.set("type", urlParams.typeFilter);
    if (urlParams.statusFilter) p.set("status", urlParams.statusFilter);
    p.set("page", urlParams.page);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    return `/admin/posts?${p.toString()}`;
  }

  /* ── Sortable column header ── */
  function SortTh({ label, field }: { label: string; field: string }) {
    const isActive = currentSort === field;
    const nextDir = isActive && currentDir === "desc" ? "asc" : "desc";
    return (
      <th style={{ cursor: "pointer", userSelect: "none" }}>
        <Link
          href={buildUrl({ sort: field, dir: nextDir, page: "1" })}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            color: isActive ? "#1E2130" : "#6B7280",
            textDecoration: "none",
          }}
        >
          {label}
          <span style={{ fontSize: ".7rem", opacity: isActive ? 1 : 0.3 }}>
            {isActive ? (currentDir === "desc" ? "↓" : "↑") : "↕"}
          </span>
        </Link>
      </th>
    );
  }

  /* ── Bulk actions ── */
  async function handleBulkDelete() {
    if (!confirm(`هل تريد حذف ${selectedIds.size} منشور نهائياً؟`)) return;
    setBulkLoading(true);
    const res = await fetch("/api/admin/posts/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selectedIds) }),
    });
    if (res.ok) {
      setSelectedIds(new Set());
      router.refresh();
    }
    setBulkLoading(false);
  }

  async function handleBulkStatus(status: "published" | "draft") {
    setBulkLoading(true);
    const res = await fetch("/api/admin/posts/bulk-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selectedIds), status }),
    });
    if (res.ok) {
      setSelectedIds(new Set());
      router.refresh();
    }
    setBulkLoading(false);
  }

  /* ── Render ── */
  return (
    <>
      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="a-bulk-bar">
          <span className="a-bulk-count">{selectedIds.size} منشور محدد</span>
          <button
            className="a-btn-publish a-btn-sm"
            onClick={() => handleBulkStatus("published")}
            disabled={bulkLoading}
          >
            نشر الكل
          </button>
          <button
            className="a-btn-unpublish a-btn-sm"
            onClick={() => handleBulkStatus("draft")}
            disabled={bulkLoading}
          >
            تحويل لمسودة
          </button>
          <button className="a-btn-danger a-btn-sm" onClick={handleBulkDelete} disabled={bulkLoading}>
            حذف الكل
          </button>
          <button className="a-btn-ghost a-btn-sm" onClick={() => setSelectedIds(new Set())}>
            إلغاء التحديد
          </button>
        </div>
      )}

      {/* Table */}
      <div className="a-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.size === posts.length && posts.length > 0}
                    onChange={(e) =>
                      setSelectedIds(
                        e.target.checked ? new Set(posts.map((p) => p.id)) : new Set()
                      )
                    }
                  />
                </th>
                <th>النوع</th>
                <th>العنوان</th>
                <th>القسم</th>
                <th>الحالة</th>
                <SortTh label="تاريخ النشر" field="published_at" />
                <SortTh label="مشاهدات" field="view_count" />
                <SortTh label="إعجابات" field="like_count" />
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "#9BA0B8" }}>
                    لا توجد نتائج
                  </td>
                </tr>
              )}
              {posts.map((post) => {
                const cat = Array.isArray(post.categories)
                  ? post.categories[0]
                  : (post.categories as { name_ar: string; color: string | null } | null);

                const title =
                  post.title_ar.length > 60
                    ? post.title_ar.slice(0, 60) + "…"
                    : post.title_ar;

                return (
                  <tr key={post.id}>
                    {/* Checkbox */}
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(post.id)}
                        onChange={(e) => {
                          const next = new Set(selectedIds);
                          e.target.checked ? next.add(post.id) : next.delete(post.id);
                          setSelectedIds(next);
                        }}
                      />
                    </td>

                    {/* Type badge */}
                    <td>
                      <span
                        className="a-badge"
                        style={{
                          background: (TYPE_COLOR[post.type] ?? "#6B7280") + "18",
                          color: TYPE_COLOR[post.type] ?? "#6B7280",
                        }}
                      >
                        {TYPE_EMOJI[post.type] ?? ""} {TYPE_LABEL[post.type] ?? post.type}
                      </span>
                    </td>

                    {/* Title */}
                    <td style={{ maxWidth: 280 }}>
                      <span title={post.title_ar} style={{ fontSize: ".85rem" }}>
                        {title}
                      </span>
                    </td>

                    {/* Category */}
                    <td>
                      {cat && (
                        <span
                          className="a-badge"
                          style={{
                            background: (cat.color ?? "#6B7280") + "18",
                            color: cat.color ?? "#6B7280",
                          }}
                        >
                          {cat.name_ar}
                        </span>
                      )}
                    </td>

                    {/* Status toggle */}
                    <td>
                      <TogglePublishButton postId={post.id} currentStatus={post.status ?? "draft"} />
                    </td>

                    {/* Published at */}
                    <td style={{ fontSize: ".78rem", color: "#6B7280", whiteSpace: "nowrap" }}>
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("ar-SA")
                        : "—"}
                    </td>

                    {/* Views */}
                    <td style={{ fontSize: ".85rem", color: "#374151" }}>
                      {(post.view_count ?? 0).toLocaleString()}
                    </td>

                    {/* Likes */}
                    <td style={{ fontSize: ".85rem", color: "#374151" }}>
                      {(post.like_count ?? 0).toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <Link
                          href={`/ar/p/${post.id}`}
                          target="_blank"
                          className="a-btn-ghost"
                          style={{ padding: "4px 10px", fontSize: ".75rem", borderRadius: 6 }}
                        >
                          عرض
                        </Link>
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="a-btn-ghost"
                          style={{ padding: "4px 10px", fontSize: ".75rem", borderRadius: 6 }}
                        >
                          تعديل
                        </Link>
                        <DeleteButton postId={post.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="a-pagination">
          <Link
            href={buildUrl({ page: String(page - 1) })}
            className="a-page-btn"
            style={page <= 1 ? { pointerEvents: "none", opacity: 0.4 } : {}}
          >
            ‹ السابق
          </Link>
          <span style={{ fontSize: ".85rem", color: "#6B7280" }}>
            {page} / {totalPages}
          </span>
          <Link
            href={buildUrl({ page: String(page + 1) })}
            className="a-page-btn"
            style={page >= totalPages ? { pointerEvents: "none", opacity: 0.4 } : {}}
          >
            التالي ›
          </Link>
        </div>
      )}
    </>
  );
}
