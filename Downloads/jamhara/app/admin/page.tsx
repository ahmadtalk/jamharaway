import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { DashboardCharts } from "@/components/admin/DashboardCharts";

/* ── خريطة 18 نوع محتوى كاملة ──────────────────────────────────── */
const TYPE_META: Record<string, { emoji: string; label: string; color: string }> = {
  article:    { emoji: "✍️",  label: "مقالات",       color: "#3B6CC4" },
  chart:      { emoji: "📈",  label: "مخططات",       color: "#2D7A46" },
  quiz:       { emoji: "🎯",  label: "اختبارات",     color: "#7C3AED" },
  comparison: { emoji: "⚡",  label: "مقارنات",      color: "#C05E1A" },
  ranking:    { emoji: "🥇",  label: "ترتيب",        color: "#D97706" },
  numbers:    { emoji: "🔣",  label: "بالأرقام",     color: "#4338CA" },
  scenarios:  { emoji: "🌀",  label: "سيناريوهات",   color: "#BE185D" },
  timeline:   { emoji: "⏳",  label: "خط زمني",      color: "#0D9488" },
  factcheck:  { emoji: "🔍",  label: "تحقق",         color: "#DC2626" },
  profile:    { emoji: "🪪",  label: "بروفايل",      color: "#7B5EA7" },
  briefing:   { emoji: "🗞️", label: "موجز",         color: "#1D4ED8" },
  quotes:     { emoji: "🗣️", label: "اقتباسات",     color: "#9333EA" },
  explainer:  { emoji: "💡",  label: "أسئلة شارحة", color: "#16A34A" },
  debate:     { emoji: "🏛️", label: "مناظرة",       color: "#C2410C" },
  guide:      { emoji: "🧭",  label: "خطوات",        color: "#0891B2" },
  network:    { emoji: "🔗",  label: "خريطة الصلات", color: "#9333EA" },
  interview:  { emoji: "🎙️", label: "مقابلة",       color: "#D97706" },
  map:        { emoji: "🌍",  label: "توزيع",        color: "#059669" },
};

type PostRow = {
  id: string;
  title_ar: string;
  type: string;
  published_at: string | null;
  view_count: number;
  like_count: number;
  categories: { name_ar: string; color: string | null } | { name_ar: string; color: string | null }[] | null;
};

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const since14 = new Date();
  since14.setDate(since14.getDate() - 14);
  const since7  = new Date();
  since7.setDate(since7.getDate() - 7);
  const since24 = new Date();
  since24.setHours(since24.getHours() - 24);

  const [
    postsRes,
    metricsRes,
    recentRes,
    datesRes,
    topViewsRes,
    todayRes,
    weekRes,
    draftRes,
    jobsRes,
    runsRes,
    topicsRes,
  ] = await Promise.all([
    supabase.from("posts").select("type", { count: "exact" }).eq("status", "published"),
    supabase.from("posts").select("view_count, like_count").eq("status", "published"),
    supabase
      .from("posts")
      .select("id, title_ar, type, published_at, view_count, like_count, categories!posts_category_id_fkey(name_ar, color)")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(10),
    supabase.from("posts").select("published_at").eq("status", "published").gte("published_at", since14.toISOString()),
    supabase.from("posts").select("title_ar, view_count").eq("status", "published").order("view_count", { ascending: false }).limit(5),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "published").gte("published_at", since24.toISOString()),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "published").gte("published_at", since7.toISOString()),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("scheduled_jobs").select("id, name, is_active, total_succeeded, total_failed").eq("is_active", true),
    supabase.from("scheduled_job_runs").select("status").gte("started_at", since24.toISOString()),
    supabase.from("topic_registry").select("*", { count: "exact", head: true }),
  ]);

  const totalPosts  = postsRes.count ?? 0;
  const totalViews  = (metricsRes.data ?? []).reduce((s, p) => s + (p.view_count ?? 0), 0);
  const totalLikes  = (metricsRes.data ?? []).reduce((s, p) => s + (p.like_count ?? 0), 0);
  const todayPosts  = todayRes.count ?? 0;
  const weekPosts   = weekRes.count ?? 0;
  const draftPosts  = draftRes.count ?? 0;
  const activeJobs  = (jobsRes.data ?? []).length;
  const topicsCount = topicsRes.count ?? 0;

  const runs24h    = runsRes.data ?? [];
  const todayOk    = runs24h.filter(r => r.status === "done").length;
  const todayFail  = runs24h.filter(r => r.status === "failed").length;
  const successRate = runs24h.length > 0 ? Math.round((todayOk / runs24h.length) * 100) : 0;

  // Type counts
  const typeCounts: Record<string, number> = {};
  (postsRes.data ?? []).forEach(p => { typeCounts[p.type] = (typeCounts[p.type] ?? 0) + 1; });

  const recentPosts = (recentRes.data ?? []) as PostRow[];

  // 14-day chart
  const dailyMap: Record<string, number> = {};
  (datesRes.data ?? []).forEach(p => {
    if (p.published_at) { const k = p.published_at.slice(0, 10); dailyMap[k] = (dailyMap[k] ?? 0) + 1; }
  });
  const dailyData: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    dailyData.push({ date: k.slice(5), count: dailyMap[k] ?? 0 });
  }

  // Type chart — كل 18 نوع بألوانها الصحيحة
  const typeChartData = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => ({
      name:  TYPE_META[type]?.label ?? type,
      value: count,
      color: TYPE_META[type]?.color ?? "#6B7280",
    }));

  const topPostsData = (topViewsRes.data ?? []).map(p => ({
    title: p.title_ar.length > 35 ? p.title_ar.slice(0, 35) + "…" : p.title_ar,
    views: p.view_count ?? 0,
  }));

  /* ── مؤشر صحة الجدولة ── */
  const schedulerStatus =
    successRate >= 70 ? { label: "ممتاز", color: "#4CB36C", bg: "#E8F6ED" }
    : successRate >= 40 ? { label: "متوسط", color: "#D97706", bg: "#FEF3C7" }
    : { label: "يحتاج مراجعة", color: "#DC2626", bg: "#FEF2F2" };

  return (
    <AdminShell title="لوحة التحكم" userEmail={user.email}>

      {/* ── صف 1: KPIs رئيسية ───────────────────────────────────────── */}
      <div className="a-stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
        <StatCard
          value={totalPosts.toLocaleString("en")}
          label="منشور نشط"
          color="#4CB36C"
          icon={<IconPosts />}
          sub={`+${weekPosts} هذا الأسبوع`}
          subColor="#4CB36C"
        />
        <StatCard
          value={todayPosts.toLocaleString("en")}
          label="منشور اليوم"
          color="#3B6CC4"
          icon={<IconToday />}
          sub={`${weekPosts} في 7 أيام`}
          subColor="#3B6CC4"
        />
        <StatCard
          value={totalViews.toLocaleString("en")}
          label="إجمالي المشاهدات"
          color="#0891B2"
          icon={<IconViews />}
        />
        <StatCard
          value={totalLikes.toLocaleString("en")}
          label="إجمالي الإعجابات"
          color="#E05A2B"
          icon={<IconLike />}
        />
      </div>

      {/* ── صف 2: صحة النظام ────────────────────────────────────────── */}
      <div className="a-stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", marginBottom: 24 }}>
        <StatCard
          value={String(activeJobs)}
          label="جدولات نشطة"
          color="#7C3AED"
          icon={<IconSchedule />}
          sub="الكرون يعمل"
          subColor="#7C3AED"
        />
        <StatCard
          value={`${todayOk}/${runs24h.length}`}
          label="نجاحات الجدولة (24س)"
          color={schedulerStatus.color}
          icon={<IconCheck color={schedulerStatus.color} />}
          sub={`${successRate}% نسبة نجاح — ${schedulerStatus.label}`}
          subColor={schedulerStatus.color}
        />
        <StatCard
          value={String(draftPosts)}
          label="مسودات"
          color="#9BA0B8"
          icon={<IconDraft />}
        />
        <StatCard
          value={topicsCount.toLocaleString("en")}
          label="مواضيع مسجّلة (dedup)"
          color="#BE185D"
          icon={<IconDedup />}
          sub="نظام منع التكرار"
          subColor="#BE185D"
        />
      </div>

      {/* ── المخططات ────────────────────────────────────────────────── */}
      <DashboardCharts
        dailyData={dailyData}
        typeChartData={typeChartData}
        topPostsData={topPostsData}
      />

      {/* ── آخر المنشورات ───────────────────────────────────────────── */}
      <div className="a-card" style={{ marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p className="a-card-title" style={{ margin: 0 }}>آخر المنشورات</p>
          <Link href="/admin/posts" style={{ fontSize: ".78rem", color: "#4CB36C", fontWeight: 600 }}>
            عرض الكل ←
          </Link>
        </div>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>العنوان</th>
                <th>النوع</th>
                <th>التصنيف</th>
                <th>التاريخ</th>
                <th style={{ textAlign: "left" }}>مشاهدات</th>
              </tr>
            </thead>
            <tbody>
              {recentPosts.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#9CA3AF", padding: "24px 0" }}>
                    لا توجد منشورات بعد
                  </td>
                </tr>
              )}
              {recentPosts.map(post => {
                const cat = Array.isArray(post.categories) ? post.categories[0] : post.categories as { name_ar: string; color: string | null } | null;
                const meta = TYPE_META[post.type];
                return (
                  <tr key={post.id}>
                    <td style={{ maxWidth: 300 }}>
                      <Link
                        href={`/ar/p/${post.id}`}
                        target="_blank"
                        style={{ color: "#1E2130", fontWeight: 500, fontSize: ".83rem", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {post.title_ar}
                      </Link>
                    </td>
                    <td>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "2px 8px", borderRadius: 20, fontSize: ".7rem", fontWeight: 600,
                        background: (meta?.color ?? "#6B7280") + "18",
                        color: meta?.color ?? "#6B7280",
                        whiteSpace: "nowrap",
                      }}>
                        {meta?.emoji} {meta?.label ?? post.type}
                      </span>
                    </td>
                    <td style={{ fontSize: ".78rem", color: "#6B7280" }}>
                      {cat?.name_ar ?? "—"}
                    </td>
                    <td style={{ fontSize: ".78rem", color: "#9BA0B8", whiteSpace: "nowrap" }}>
                      {new Date(post.published_at ?? Date.now()).toLocaleDateString("ar-SA")}
                    </td>
                    <td style={{ fontSize: ".78rem", color: "#6B7280", textAlign: "left" }}>
                      {(post.view_count ?? 0).toLocaleString("en")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── إجراءات سريعة ───────────────────────────────────────────── */}
      <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/admin/generate" className="a-btn">
          ✨ توليد محتوى
        </Link>
        <Link href="/admin/posts" className="a-btn-ghost">
          📝 إدارة المنشورات
        </Link>
        <Link href="/admin/schedule" className="a-btn-ghost">
          ⏱ الجدولة التلقائية
        </Link>
        <Link href="/admin/diagnostics" className="a-btn-ghost">
          🔧 تشخيصات
        </Link>
      </div>

    </AdminShell>
  );
}

/* ── مكوّن بطاقة إحصائية مع أيقونة ──────────────────────────────── */
function StatCard({
  value, label, color, icon, sub, subColor,
}: {
  value: string; label: string; color: string;
  icon: React.ReactNode; sub?: string; subColor?: string;
}) {
  return (
    <div className="a-stat" style={{ gap: 0, position: "relative", overflow: "hidden" }}>
      {/* أيقونة في الزاوية */}
      <div style={{
        position: "absolute", top: 16, left: 16,
        width: 34, height: 34, borderRadius: 9,
        background: color + "18",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <span className="a-stat-num" style={{ color, marginTop: 4, fontSize: "1.8rem" }}>
        {value}
      </span>
      <span className="a-stat-label" style={{ marginTop: 4 }}>{label}</span>
      {sub && (
        <span style={{ fontSize: ".68rem", color: subColor ?? "#9BA0B8", marginTop: 5, fontWeight: 600 }}>
          {sub}
        </span>
      )}
    </div>
  );
}

/* ── أيقونات SVG للبطاقات ────────────────────────────────────────── */
function IconPosts() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4CB36C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}
function IconToday() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B6CC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function IconViews() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0891B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function IconLike() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E05A2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  );
}
function IconSchedule() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function IconCheck({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function IconDraft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9BA0B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  );
}
function IconDedup() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#BE185D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
    </svg>
  );
}
