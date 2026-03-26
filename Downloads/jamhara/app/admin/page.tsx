import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { DashboardCharts } from "@/components/admin/DashboardCharts";

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
  article: "مقالات",
  chart: "مخططات",
  quiz: "اختبارات",
  comparison: "مقارنات",
  ranking: "تصنيفات",
  numbers: "أرقام",
  scenarios: "سيناريوهات",
  timeline: "خط زمني",
  factcheck: "تحقق من الحقيقة",
};

const TYPE_COLORS: Record<string, string> = {
  article: "#6B7280",
  chart: "#2196F3",
  quiz: "#7B5EA7",
  comparison: "#E05A2B",
  ranking: "#F59E0B",
  numbers: "#06B6D4",
  scenarios: "#8B5CF6",
  timeline: "#373C55",
  factcheck: "#4CB36C",
};

type PostRow = {
  id: string;
  title_ar: string;
  type: string;
  published_at: string | null;
  view_count: number;
  like_count: number;
  categories:
    | { name_ar: string; color: string | null }
    | { name_ar: string; color: string | null }[]
    | null;
};

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // Posts per last 14 days
  const since14 = new Date();
  since14.setDate(since14.getDate() - 14);

  const [postsRes, metricsRes, recentRes, datesRes, topViewsRes] = await Promise.all([
    supabase.from("posts").select("type", { count: "exact" }).eq("status", "published"),
    supabase.from("posts").select("view_count, like_count").eq("status", "published"),
    supabase
      .from("posts")
      .select(
        "id, title_ar, type, published_at, view_count, like_count, categories!posts_category_id_fkey(name_ar, color)"
      )
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(10),
    supabase
      .from("posts")
      .select("published_at")
      .eq("status", "published")
      .gte("published_at", since14.toISOString()),
    supabase
      .from("posts")
      .select("title_ar, view_count")
      .eq("status", "published")
      .order("view_count", { ascending: false })
      .limit(5),
  ]);

  const totalPosts = postsRes.count ?? 0;
  const totalViews = (metricsRes.data ?? []).reduce((s, p) => s + (p.view_count ?? 0), 0);
  const totalLikes = (metricsRes.data ?? []).reduce((s, p) => s + (p.like_count ?? 0), 0);

  // Count by type
  const typeCounts: Record<string, number> = {};
  (postsRes.data ?? []).forEach((p) => {
    typeCounts[p.type] = (typeCounts[p.type] ?? 0) + 1;
  });

  const recentPosts = (recentRes.data ?? []) as PostRow[];

  // Build 14-day array
  const dailyMap: Record<string, number> = {};
  (datesRes.data ?? []).forEach((p) => {
    if (p.published_at) {
      const key = p.published_at.slice(0, 10);
      dailyMap[key] = (dailyMap[key] ?? 0) + 1;
    }
  });
  const dailyData: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyData.push({ date: key.slice(5), count: dailyMap[key] ?? 0 });
  }

  // Type chart data
  const typeChartData = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => ({
      name: TYPE_LABEL[type] ?? type,
      value: count,
      color: TYPE_COLORS[type] ?? "#6B7280",
    }));

  // Top posts data
  const topPostsData = (topViewsRes.data ?? []).map((p) => ({
    title: p.title_ar.length > 30 ? p.title_ar.slice(0, 30) + "…" : p.title_ar,
    views: p.view_count ?? 0,
  }));

  return (
    <AdminShell title="الرئيسية" userEmail={user.email}>
      {/* Stat cards */}
      <div className="a-stat-grid">
        <div className="a-stat">
          <span className="a-stat-num" style={{ color: "#4CB36C" }}>
            {totalPosts}
          </span>
          <span className="a-stat-label">منشور منشور</span>
        </div>
        <div className="a-stat">
          <span className="a-stat-num" style={{ color: "#2196F3" }}>
            {totalViews.toLocaleString("ar-SA")}
          </span>
          <span className="a-stat-label">إجمالي المشاهدات</span>
        </div>
        <div className="a-stat">
          <span className="a-stat-num" style={{ color: "#E05A2B" }}>
            {totalLikes.toLocaleString("ar-SA")}
          </span>
          <span className="a-stat-label">إجمالي الإعجابات</span>
        </div>
        <div className="a-stat">
          <span className="a-stat-num" style={{ color: "#7B5EA7" }}>
            9
          </span>
          <span className="a-stat-label">أنواع المحتوى</span>
        </div>
      </div>

      {/* Charts row */}
      <DashboardCharts
        dailyData={dailyData}
        typeChartData={typeChartData}
        topPostsData={topPostsData}
      />

      {/* Recent posts */}
      <div className="a-card" style={{ marginTop: 20 }}>
        <p className="a-card-title">آخر المنشورات</p>
        <div className="a-type-list">
          {recentPosts.length === 0 && (
            <p
              style={{
                fontSize: ".82rem",
                color: "#9CA3AF",
                textAlign: "center",
                padding: "20px 0",
              }}
            >
              لا توجد منشورات بعد
            </p>
          )}
          {recentPosts.map((post) => {
            const cat = Array.isArray(post.categories)
              ? post.categories[0]
              : (post.categories as { name_ar: string; color: string | null } | null);
            return (
              <div key={post.id} className="a-recent-row">
                <span style={{ fontSize: "1rem", flexShrink: 0 }}>
                  {TYPE_EMOJI[post.type] ?? ""}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    href={`/ar/p/${post.id}`}
                    target="_blank"
                    style={{
                      color: "#1E2130",
                      fontSize: ".82rem",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontWeight: 500,
                    }}
                  >
                    {post.title_ar}
                  </Link>
                  <span style={{ fontSize: ".72rem", color: "#9BA0B8" }}>
                    {cat?.name_ar && <span style={{ marginLeft: 6 }}>{cat.name_ar}</span>}
                    {new Date(post.published_at ?? Date.now()).toLocaleDateString("ar-SA")}
                  </span>
                </div>
                <span style={{ fontSize: ".72rem", color: "#6B7280", flexShrink: 0 }}>
                  {(post.view_count ?? 0).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Link href="/admin/posts" className="a-btn-ghost">
          📝 إدارة المنشورات
        </Link>
        <Link href="/admin/generate" className="a-btn">
          ✨ توليد محتوى
        </Link>
      </div>
    </AdminShell>
  );
}
