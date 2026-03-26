import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface Props { locale: string; }

// ── أيقونات التصنيفات — نفس نمط Sidebar (stroke SVG في مربع ملوّن) ──
// viewBox: 0 0 24 24 | fill: none | stroke | strokeWidth: 2 | strokeLinecap/Linejoin: round
const CAT_SVG: Record<string, { d: string; d2?: string }> = {
  "politics":               { d: "M3 21h18M5 21V7l7-5 7 5v14M9 21v-6h6v6" },
  "economics-and-business": { d: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" },
  "society":                { d: "M17 20H7m10 0a3 3 0 003-3v0a5 5 0 00-5-5H8a5 5 0 00-5 5v0a3 3 0 003 3m10 0v1m-10 0v-1", d2: "M12 10a4 4 0 100-8 4 4 0 000 8z" },
  "religions":              { d: "M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" },
  "technology":             { d: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" },
  "history":                { d: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" },
  "geography":              { d: "M12 2a10 10 0 100 20A10 10 0 0012 2z", d2: "M2 12h20M12 2c-2.76 0-5 4.48-5 10s2.24 10 5 10 5-4.48 5-10S14.76 2 12 2z" },
  "sciences":               { d: "M9 3v7.5L4 18h16l-5-7.5V3M6 3h12" },
  "medicine-and-health":    { d: "M9 12h6m-3-3v6", d2: "M12 22a10 10 0 100-20 10 10 0 000 20z" },
  "humanities":             { d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  "lifestyle":              { d: "M12 3v1m0 16v1M4.22 4.22l.707.707m12.727 12.727l.707.707M1 12h1m18 0h1M4.22 19.78l.707-.707M18.364 5.636l.707-.707", d2: "M16 12a4 4 0 11-8 0 4 4 0 018 0z" },
  "culture":                { d: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" },
  "sports":                 { d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  "misc":                   { d: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" },
};

export default async function RightPanel({ locale }: Props) {
  const supabase = await createClient();
  const isAr = locale === "ar";

  // جلب التصنيفات النشطة
  const { data: cats } = await supabase
    .from("categories")
    .select("id, name_ar, name_en, slug, color, icon, post_count")
    .eq("is_active", true)
    .is("parent_id", null)
    .order("sort_order");

  const categories = cats ?? [];

  /* ── محجوز لإعادة التفعيل لاحقاً ──────────────────────────────────────
  const [
    { count: postCount },
    { count: catCount },
    { count: jobCount },
    { data: topPosts },
    { data: recentPosts },
  ] = await Promise.all([
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("categories").select("*", { count: "exact", head: true }).is("parent_id", null),
    supabase.from("generation_jobs").select("*", { count: "exact", head: true }).eq("status", "done"),
    supabase.from("posts").select("id, title_ar, title_en, type, view_count, category:categories!posts_category_id_fkey(slug, color)").eq("status", "published").order("view_count", { ascending: false }).limit(5),
    supabase.from("posts").select("id, title_ar, title_en, type, published_at, category:categories!posts_category_id_fkey(slug, color, name_ar, name_en)").eq("status", "published").order("published_at", { ascending: false }).limit(3),
  ]);
  ──────────────────────────────────────────────────────────────────────── */

  return (
    <aside className="rpanel">

      {/* ── التصنيفات ─────────────────────────────────────────────────── */}
      <div className="rcard">
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "1rem", paddingBottom: ".5rem",
          borderBottom: "1px solid var(--slate)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 26, height: 26, borderRadius: 7,
              background: "var(--green-light)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" style={{ color: "var(--green-deep)" }}>
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </span>
            <p style={{
              fontFamily: "var(--font-cairo), 'Cairo', sans-serif",
              fontWeight: 700, fontSize: ".85rem",
              color: "var(--ink)", margin: 0,
            }}>
              {isAr ? "تصنيفات جمهرة" : "Jamhara Sections"}
            </p>
          </div>
          <Link
            href={isAr ? "/sections" : "/en/sections"}
            style={{ fontSize: ".72rem", color: "var(--green-deep)", fontWeight: 600, textDecoration: "none" }}
          >
            {isAr ? "الكل" : "All"}
          </Link>
        </div>

        {/* قائمة التصنيفات */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {categories.map((cat) => {
            const name = isAr ? cat.name_ar : (cat.name_en ?? cat.name_ar);
            const href = isAr ? `/${cat.slug}` : `/en/${cat.slug}`;
            const svgIcon = CAT_SVG[cat.slug];
            const color  = cat.color ?? "#4CB36C";
            const bg     = color + "15";
            return (
              <Link
                key={cat.id}
                href={href}
                className="rpanel-cat-row"
                style={{
                  display: "flex", alignItems: "center", gap: 9,
                  padding: "6px 8px", borderRadius: 9,
                  textDecoration: "none",
                }}
              >
                {/* أيقونة — نفس نمط Sidebar */}
                <span style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {svgIcon ? (
                    <svg
                      width="13" height="13" viewBox="0 0 24 24"
                      fill="none" stroke={color}
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <path d={svgIcon.d} />
                      {svgIcon.d2 && <path d={svgIcon.d2} />}
                    </svg>
                  ) : (
                    <svg
                      width="13" height="13" viewBox="0 0 24 24"
                      fill="none" stroke={color}
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="4" />
                    </svg>
                  )}
                </span>

                {/* الاسم */}
                <span style={{
                  flex: 1, fontSize: ".8rem", fontWeight: 600,
                  color: "var(--ink)", lineHeight: 1.3,
                }}>
                  {name}
                </span>

                {/* عدد المنشورات */}
                {cat.post_count > 0 && (
                  <span style={{
                    fontSize: ".68rem", fontWeight: 700,
                    color: color,
                    background: bg,
                    padding: "1px 7px", borderRadius: 100,
                    flexShrink: 0,
                  }}>
                    {cat.post_count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* رابط الإحصائيات — محجوز للتفعيل لاحقاً
        <Link href={isAr ? "/statistics" : "/en/statistics"} className="rpanel-stats-link" ...>
          إحصائيات جمهرة
        </Link>
        ── */}
      </div>

      {/* ── محجوزة لإعادة التفعيل ──────────────────────────────────────
      Most Read Card — يُعاد تفعيله عند الحاجة
      <div className="rcard"> ... </div>

      Latest Posts Card — يُعاد تفعيله عند الحاجة
      <div className="rcard"> ... </div>
      ──────────────────────────────────────────────────────────────── */}

    </aside>
  );
}
