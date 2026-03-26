import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { PostsTableClient } from "@/components/admin/PostsTableClient";

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

const ALL_TYPES = ["article", "chart", "quiz", "comparison", "ranking", "numbers", "scenarios", "timeline", "factcheck"];

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ q?: string; type?: string; page?: string; sort?: string; dir?: string; status?: string }>;
}

export default async function PostsManagerPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const params = await searchParams;
  const q = params.q ?? "";
  const typeFilter = params.type ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const validSorts = ["published_at", "view_count", "like_count"];
  const sortField = validSorts.includes(params.sort ?? "") ? (params.sort as string) : "published_at";
  const sortAsc = params.dir === "asc";
  const statusFilter = ["published", "draft"].includes(params.status ?? "") ? params.status! : "";

  let query = supabase
    .from("posts")
    .select(
      "id, title_ar, type, published_at, view_count, like_count, status, categories!posts_category_id_fkey(name_ar, color)",
      { count: "exact" }
    )
    .order(sortField, { ascending: sortAsc })
    .range(offset, offset + PAGE_SIZE - 1);

  if (q) query = query.ilike("title_ar", `%${q}%`);
  if (typeFilter) query = query.eq("type", typeFilter);
  if (statusFilter) query = query.eq("status", statusFilter);

  const { data, count } = await query;
  const posts = (data ?? []) as Parameters<typeof PostsTableClient>[0]["posts"];
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const hasFilters = !!(q || typeFilter || statusFilter);

  return (
    <AdminShell title="المنشورات" userEmail={user.email}>
      {/* Filter bar */}
      <form method="GET" action="/admin/posts" className="a-filter-bar">
        <input
          className="a-search-input"
          type="search"
          name="q"
          defaultValue={q}
          placeholder="ابحث في العناوين..."
        />
        <select className="a-select" name="type" defaultValue={typeFilter} style={{ width: "auto" }}>
          <option value="">كل الأنواع</option>
          {ALL_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_EMOJI[t]} {TYPE_LABEL[t]}
            </option>
          ))}
        </select>
        <select className="a-select" name="status" defaultValue={statusFilter} style={{ width: "auto" }}>
          <option value="">كل الحالات</option>
          <option value="published">منشور</option>
          <option value="draft">مسودة</option>
        </select>
        {/* Preserve sort/dir when the form is submitted */}
        {params.sort && <input type="hidden" name="sort" value={params.sort} />}
        {params.dir && <input type="hidden" name="dir" value={params.dir} />}
        <button type="submit" className="a-btn a-btn-sm">
          بحث
        </button>
        {hasFilters && (
          <Link
            href="/admin/posts"
            className="a-btn-ghost"
            style={{ padding: "5px 12px", fontSize: ".76rem", borderRadius: 6 }}
          >
            مسح
          </Link>
        )}
      </form>

      {/* Summary */}
      <p style={{ fontSize: ".82rem", color: "#6B7280", marginBottom: 16 }}>
        {totalCount.toLocaleString("ar-SA")} منشور
        {q && ` — نتائج: "${q}"`}
        {statusFilter === "published" && " — منشور"}
        {statusFilter === "draft" && " — مسودة"}
      </p>

      {/* Table + bulk bar + pagination (client component) */}
      <PostsTableClient
        posts={posts}
        totalCount={totalCount}
        page={page}
        totalPages={totalPages}
        currentSort={sortField}
        currentDir={sortAsc ? "asc" : "desc"}
        urlParams={{
          q,
          typeFilter,
          statusFilter,
          page: String(page),
        }}
      />
    </AdminShell>
  );
}
