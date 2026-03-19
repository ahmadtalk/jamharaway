import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/utils";

interface Props { locale: string; }

// Post type → SVG path (viewBox 0 0 20 20)
const TYPE_ICON: Record<string, string> = {
  article:    "M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z",
  quiz:       "M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
  chart:      "M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z",
  comparison: "M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z",
  timeline:   "M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z",
  ranking:    "M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z",
  numbers:    "M7 3a1 1 0 000 2h6a1 1 0 000-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z",
  factcheck:  "M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a2 2 0 012-2 3 3 0 006 0 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z",
  scenarios:  "M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z",
};

// Card title row with SVG icon
function CardTitle({ iconPath, label }: { iconPath: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: ".7rem" }}>
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"
        style={{ flexShrink: 0, color: "var(--green)", opacity: .85 }}>
        <path d={iconPath} />
      </svg>
      <p style={{
        fontFamily: "var(--font-cairo), 'Cairo', sans-serif",
        fontWeight: 700,
        fontSize: ".8rem",
        color: "var(--ink)",
        margin: 0,
      }}>
        {label}
      </p>
    </div>
  );
}

export default async function RightPanel({ locale }: Props) {
  const supabase = await createClient();
  const isAr = locale === "ar";

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
    supabase
      .from("posts")
      .select("id, title_ar, title_en, type, view_count, category:categories!posts_category_id_fkey(slug, color)")
      .eq("status", "published")
      .order("view_count", { ascending: false })
      .limit(5),
    supabase
      .from("posts")
      .select("id, title_ar, title_en, type, published_at, category:categories!posts_category_id_fkey(slug, color, name_ar, name_en)")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(3),
  ]);

  // Rank badge colors
  const RANK_COLORS = ["#E8534A", "#E07B2A", "#C9A820", "#4CB36C", "#5B8DEF"];

  return (
    <aside className="rpanel">

      {/* Stats card */}
      <div className="rcard">
        <CardTitle
          iconPath="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"
          label={isAr ? "إحصائيات جمهرة" : "Jamhara Stats"}
        />
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-num" style={{ fontSize: "1.3rem" }}>{postCount ?? 0}</div>
            <div className="stat-lbl">{isAr ? "منشور" : "Posts"}</div>
          </div>
          <div className="stat-box">
            <div className="stat-num" style={{ fontSize: "1.3rem" }}>{catCount ?? 0}</div>
            <div className="stat-lbl">{isAr ? "قسم معرفي" : "Sections"}</div>
          </div>
          <div className="stat-box">
            <div className="stat-num" style={{ fontSize: "1.3rem" }}>{jobCount ?? 0}</div>
            <div className="stat-lbl">{isAr ? "جلسة توليد" : "AI Sessions"}</div>
          </div>
          <div className="stat-box">
            <div className="stat-num" style={{ fontSize: "1.3rem" }}>24</div>
            <div className="stat-lbl">{isAr ? "تخصص" : "Disciplines"}</div>
          </div>
        </div>
      </div>

      {/* Most read card */}
      {topPosts && topPosts.length > 0 && (
        <div className="rcard">
          <CardTitle
            iconPath="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
            label={isAr ? "الأكثر قراءة" : "Most Read"}
          />
          {topPosts.map((post, i) => {
            const title = isAr ? post.title_ar : post.title_en;
            const href = locale === "en" ? `/en/p/${post.id}` : `/p/${post.id}`;
            const rankColor = RANK_COLORS[i] ?? "#7A7F99";
            const cat = (Array.isArray(post.category) ? post.category[0] : post.category) as { slug: string; color: string } | null;
            return (
              <Link
                key={post.id}
                href={href}
                className="trow"
                style={{ textDecoration: "none", alignItems: "flex-start" }}
              >
                <span style={{
                  width: 20, height: 20, minWidth: 20,
                  borderRadius: "50%",
                  background: rankColor,
                  color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700,
                  flexShrink: 0, marginTop: 1,
                }}>
                  {i + 1}
                </span>
                <span className="tn" style={{
                  fontSize: ".78rem", lineHeight: 1.45,
                  display: "-webkit-box",
                  WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {title}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Recent posts card */}
      {recentPosts && recentPosts.length > 0 && (
        <div className="rcard">
          <CardTitle
            iconPath="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            label={isAr ? "أحدث المنشورات" : "Latest Posts"}
          />
          {recentPosts.map((post) => {
            const title = isAr ? post.title_ar : post.title_en;
            const href = locale === "en" ? `/en/p/${post.id}` : `/p/${post.id}`;
            const typeIconPath = TYPE_ICON[post.type ?? "article"] ?? TYPE_ICON.article;
            const cat = (Array.isArray(post.category) ? post.category[0] : post.category) as { slug: string; color: string; name_ar: string; name_en: string } | null;
            const ago = post.published_at ? timeAgo(post.published_at, locale as "ar" | "en") : "";
            return (
              <Link
                key={post.id}
                href={href}
                style={{
                  display: "flex", gap: 9,
                  padding: "8px 0",
                  borderBottom: "1px solid var(--slate)",
                  textDecoration: "none", alignItems: "flex-start",
                  transition: "opacity .15s",
                }}
                className="recent-post-row"
              >
                {/* Type icon */}
                <span style={{
                  width: 26, height: 26, minWidth: 26,
                  borderRadius: 7,
                  background: "var(--slate3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: 1,
                }}>
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"
                    style={{ color: "var(--muted2)" }}>
                    <path d={typeIconPath} />
                  </svg>
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    fontSize: ".78rem", color: "var(--ink2)", lineHeight: 1.45, fontWeight: 500,
                  }}>
                    {title}
                  </span>
                  {ago && (
                    <span style={{ display: "block", fontSize: "10px", color: "var(--muted)", marginTop: 3 }}>
                      {ago}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      )}

    </aside>
  );
}
