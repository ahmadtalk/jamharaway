import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";

type CheckStatus = "ok" | "warn" | "error";
type CheckResult = {
  id: string;
  label: string;
  status: CheckStatus;
  value?: string;
  fix?: string;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DiagnosticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const checks: CheckResult[] = [];
  const now = Date.now();

  // ── GROUP 1: Environment Variables ──
  const envChecks: Array<{
    key: string;
    label: string;
    required: boolean;
    secret?: boolean;
  }> = [
    {
      key: "NEXT_PUBLIC_SUPABASE_URL",
      label: "Supabase URL",
      required: true,
    },
    {
      key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      label: "Supabase Anon Key",
      required: true,
      secret: true,
    },
    {
      key: "ANTHROPIC_API_KEY",
      label: "Anthropic API Key",
      required: true,
      secret: true,
    },
    {
      key: "GENERATE_SECRET",
      label: "Generate Secret",
      required: false,
      secret: true,
    },
    {
      key: "CRON_SECRET",
      label: "Cron Secret",
      required: false,
      secret: true,
    },
    {
      key: "NEXT_PUBLIC_SITE_URL",
      label: "Site URL",
      required: false,
    },
  ];

  for (const env of envChecks) {
    const val = process.env[env.key];
    if (!val) {
      checks.push({
        id: `env_${env.key}`,
        label: env.label,
        status: env.required ? "error" : "warn",
        value: "غير مضبوط",
        fix: env.required
          ? `أضف ${env.key} في Vercel → Settings → Environment Variables`
          : `يُنصح بضبط ${env.key} في Vercel`,
      });
    } else {
      const display = env.secret
        ? val.slice(0, 6) + "••••••" + val.slice(-4)
        : val;
      checks.push({
        id: `env_${env.key}`,
        label: env.label,
        status: "ok",
        value: display,
      });
    }
  }

  // ── GROUP 2: Supabase Database ──
  const [
    postsCountRes,
    publishedCountRes,
    draftCountRes,
    categoriesRes,
    genJobsRes,
    interactionsRes,
    topPostRes,
    typeBreakdownRes,
  ] = await Promise.allSettled([
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase
      .from("categories")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("generation_jobs")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("post_interactions")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("posts")
      .select("id, title_ar, view_count")
      .order("view_count", { ascending: false })
      .limit(1),
    supabase
      .from("posts")
      .select("type")
      .eq("status", "published"),
  ]);

  // Posts total
  if (postsCountRes.status === "fulfilled" && !postsCountRes.value.error) {
    const total = postsCountRes.value.count ?? 0;
    const published =
      publishedCountRes.status === "fulfilled"
        ? (publishedCountRes.value.count ?? 0)
        : 0;
    const drafts =
      draftCountRes.status === "fulfilled"
        ? (draftCountRes.value.count ?? 0)
        : 0;
    checks.push({
      id: "db_posts",
      label: "جدول المنشورات (posts)",
      status: "ok",
      value: `${total} إجمالي — ${published} منشور، ${drafts} مسودة`,
    });
  } else {
    const err =
      postsCountRes.status === "fulfilled"
        ? postsCountRes.value.error?.message
        : "خطأ في الاتصال";
    checks.push({
      id: "db_posts",
      label: "جدول المنشورات (posts)",
      status: "error",
      value: err ?? "لا يمكن الوصول",
      fix: "تحقق من اتصال Supabase وسياسات RLS",
    });
  }

  // Categories
  if (
    categoriesRes.status === "fulfilled" &&
    !categoriesRes.value.error
  ) {
    checks.push({
      id: "db_categories",
      label: "جدول التصنيفات (categories)",
      status: categoriesRes.value.count === 0 ? "warn" : "ok",
      value: `${categoriesRes.value.count ?? 0} تصنيف`,
      fix:
        categoriesRes.value.count === 0
          ? "أضف تصنيفات من لوحة التحكم → التصنيفات"
          : undefined,
    });
  } else {
    checks.push({
      id: "db_categories",
      label: "جدول التصنيفات (categories)",
      status: "error",
      value:
        categoriesRes.status === "fulfilled"
          ? (categoriesRes.value.error?.message ?? "خطأ")
          : "فشل الاتصال",
      fix: "تحقق من سياسات RLS على جدول categories",
    });
  }

  // Generation jobs
  if (genJobsRes.status === "fulfilled" && !genJobsRes.value.error) {
    checks.push({
      id: "db_genjobs",
      label: "جدول عمليات التوليد (generation_jobs)",
      status: "ok",
      value: `${genJobsRes.value.count ?? 0} عملية`,
    });
  } else {
    checks.push({
      id: "db_genjobs",
      label: "جدول عمليات التوليد (generation_jobs)",
      status: "warn",
      value: "لا يمكن الوصول أو الجدول فارغ",
      fix: "تحقق من وجود الجدول في Supabase",
    });
  }

  // Post interactions
  if (
    interactionsRes.status === "fulfilled" &&
    !interactionsRes.value.error
  ) {
    checks.push({
      id: "db_interactions",
      label: "جدول التفاعلات (post_interactions)",
      status: "ok",
      value: `${interactionsRes.value.count ?? 0} تفاعل`,
    });
  } else {
    checks.push({
      id: "db_interactions",
      label: "جدول التفاعلات (post_interactions)",
      status: "warn",
      value: "تعذّر الوصول",
    });
  }

  // Type breakdown
  if (
    typeBreakdownRes.status === "fulfilled" &&
    !typeBreakdownRes.value.error
  ) {
    const rows = typeBreakdownRes.value.data ?? [];
    const counts: Record<string, number> = {};
    rows.forEach((r: { type: string }) => {
      counts[r.type] = (counts[r.type] ?? 0) + 1;
    });
    const breakdown =
      Object.entries(counts)
        .map(([t, n]) => `${t}:${n}`)
        .join(" · ") || "لا منشورات";
    checks.push({
      id: "db_types",
      label: "توزيع أنواع المحتوى",
      status: rows.length === 0 ? "warn" : "ok",
      value: breakdown,
      fix:
        rows.length === 0
          ? "ولّد محتوى من صفحة التوليد"
          : undefined,
    });
  }

  // Most viewed post
  if (
    topPostRes.status === "fulfilled" &&
    !topPostRes.value.error &&
    topPostRes.value.data?.[0]
  ) {
    const top = topPostRes.value.data[0] as {
      title_ar: string;
      view_count: number;
    };
    checks.push({
      id: "db_top_post",
      label: "أكثر منشور مشاهدة",
      status: "ok",
      value: `"${top.title_ar?.slice(0, 40)}…" — ${top.view_count ?? 0} مشاهدة`,
    });
  }

  // ── GROUP 3: RLS Policies ──
  const readTestRes = await supabase.from("posts").select("id").limit(1);

  if (!readTestRes.error) {
    checks.push({
      id: "rls_posts_read",
      label: "RLS — قراءة المنشورات (authenticated)",
      status: "ok",
      value: "الوصول للقراءة يعمل",
    });
  } else {
    checks.push({
      id: "rls_posts_read",
      label: "RLS — قراءة المنشورات (authenticated)",
      status: "error",
      value: readTestRes.error.message,
      fix: 'شغّل في Supabase SQL: CREATE POLICY "posts_authenticated_all" ON posts FOR ALL TO authenticated USING (true) WITH CHECK (true);',
    });
  }

  // Write test: DELETE on a non-existent ID (safe — deletes 0 rows but tests RLS)
  const writeTestRes = await supabase
    .from("posts")
    .delete()
    .eq("id", "00000000-0000-0000-0000-000000000000");

  if (!writeTestRes.error) {
    checks.push({
      id: "rls_posts_write",
      label: "RLS — كتابة المنشورات (authenticated)",
      status: "ok",
      value: "صلاحيات الكتابة تعمل",
    });
  } else {
    checks.push({
      id: "rls_posts_write",
      label: "RLS — كتابة المنشورات (authenticated)",
      status: "error",
      value: writeTestRes.error.message,
      fix: 'شغّل في Supabase SQL Editor: CREATE POLICY "posts_authenticated_all" ON posts FOR ALL TO authenticated USING (true) WITH CHECK (true);',
    });
  }

  // ── GROUP 4: API Routes ──
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://jamhara.vercel.app";

  const [searchApiRes, generateAuthRes] = await Promise.allSettled([
    fetch(`${siteUrl}/api/search?q=test&locale=ar&limit=1`, {
      signal: AbortSignal.timeout(5000),
    }),
    fetch(`${siteUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(5000),
    }),
  ]);

  // Search API
  if (searchApiRes.status === "fulfilled") {
    const res = searchApiRes.value;
    checks.push({
      id: "api_search",
      label: "مسار البحث (/api/search)",
      status: res.ok ? "ok" : "warn",
      value: `HTTP ${res.status}`,
      fix: !res.ok ? "تحقق من /api/search/route.ts" : undefined,
    });
  } else {
    checks.push({
      id: "api_search",
      label: "مسار البحث (/api/search)",
      status: "error",
      value: "لا يستجيب",
      fix: "تحقق من Vercel logs",
    });
  }

  // Generate API (should return 401/403 without valid secret)
  if (generateAuthRes.status === "fulfilled") {
    const res = generateAuthRes.value;
    const isProtected = res.status === 401 || res.status === 403;
    checks.push({
      id: "api_generate_auth",
      label: "حماية مسار التوليد (/api/generate)",
      status: isProtected ? "ok" : res.status === 200 ? "warn" : "ok",
      value: isProtected
        ? "محمي بكلمة المرور ✓"
        : `HTTP ${res.status} — ${res.status === 200 ? "مفتوح بدون حماية" : "يستجيب"}`,
      fix:
        !isProtected && res.status === 200
          ? "أضف GENERATE_SECRET في متغيرات البيئة"
          : undefined,
    });
  } else {
    checks.push({
      id: "api_generate_auth",
      label: "حماية مسار التوليد (/api/generate)",
      status: "warn",
      value: "لا يستجيب",
      fix: "تحقق من Vercel logs",
    });
  }

  // ── GROUP 5: Anthropic API Key format ──
  const anthropicKey = process.env.ANTHROPIC_API_KEY ?? "";
  if (anthropicKey) {
    const validFormat = anthropicKey.startsWith("sk-ant-");
    checks.push({
      id: "anthropic_format",
      label: "صيغة مفتاح Anthropic",
      status: validFormat ? "ok" : "warn",
      value: validFormat ? "صيغة صحيحة (sk-ant-…)" : "صيغة غير معتادة",
      fix: !validFormat
        ? "تأكد من نسخ المفتاح بشكل صحيح من console.anthropic.com"
        : undefined,
    });
  }

  // ── GROUP 6: Performance ──
  const elapsed = Date.now() - now;
  checks.push({
    id: "perf_diag",
    label: "زمن تشغيل التشخيص",
    status: elapsed < 3000 ? "ok" : elapsed < 6000 ? "warn" : "error",
    value: `${elapsed}ms`,
    fix:
      elapsed >= 3000 ? "الاتصال ببعض الخدمات بطيء" : undefined,
  });

  // ── Summary counts ──
  const okCount = checks.filter((c) => c.status === "ok").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;
  const errCount = checks.filter((c) => c.status === "error").length;

  return (
    <AdminShell title="تشخيص النظام" userEmail={user.email}>
      {/* Summary bar */}
      <div className="a-diag-summary">
        <div className="a-diag-sum-item ok">
          <span className="a-diag-sum-num">{okCount}</span>
          <span>يعمل</span>
        </div>
        <div className="a-diag-sum-item warn">
          <span className="a-diag-sum-num">{warnCount}</span>
          <span>تحذير</span>
        </div>
        <div className="a-diag-sum-item error">
          <span className="a-diag-sum-num">{errCount}</span>
          <span>خطأ</span>
        </div>
        <div style={{ flex: 1 }} />
        <a
          href="/admin/diagnostics"
          className="a-btn-ghost"
          style={{ fontSize: ".82rem", padding: "6px 14px" }}
        >
          تحديث
        </a>
      </div>

      {/* Overall status banner */}
      {errCount === 0 && warnCount === 0 && (
        <div className="a-diag-banner ok">
          كل شيء يعمل بشكل مثالي
        </div>
      )}
      {errCount === 0 && warnCount > 0 && (
        <div className="a-diag-banner warn">
          النظام يعمل مع {warnCount} تحذير — راجع التفاصيل أدناه
        </div>
      )}
      {errCount > 0 && (
        <div className="a-diag-banner error">
          يوجد {errCount} مشكلة تحتاج إصلاحاً
        </div>
      )}

      {/* Checks grouped */}
      {(
        [
          { group: "متغيرات البيئة", prefix: "env_", icon: "🔑" },
          { group: "قاعدة البيانات", prefix: "db_", icon: "🗄️" },
          { group: "سياسات الأمان (RLS)", prefix: "rls_", icon: "🛡️" },
          { group: "مسارات API", prefix: "api_", icon: "🔌" },
          { group: "Anthropic", prefix: "anthropic_", icon: "🤖" },
          { group: "الأداء", prefix: "perf_", icon: "⚡" },
        ] as const
      ).map(({ group, prefix, icon }) => {
        const groupChecks = checks.filter((c) => c.id.startsWith(prefix));
        if (groupChecks.length === 0) return null;
        return (
          <div key={prefix} className="a-card" style={{ marginBottom: 16 }}>
            <p className="a-card-title">
              {icon} {group}
            </p>
            <div className="a-diag-list">
              {groupChecks.map((check) => (
                <div key={check.id} className={`a-diag-row ${check.status}`}>
                  <span className="a-diag-icon">
                    {check.status === "ok"
                      ? "✅"
                      : check.status === "warn"
                        ? "⚠️"
                        : "❌"}
                  </span>
                  <div className="a-diag-content">
                    <span className="a-diag-label">{check.label}</span>
                    {check.value && (
                      <span className="a-diag-value">{check.value}</span>
                    )}
                    {check.fix && (
                      <div className="a-diag-fix">🔧 {check.fix}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Timestamp */}
      <p
        style={{
          fontSize: ".75rem",
          color: "#C0C4D4",
          textAlign: "center",
          marginTop: 8,
        }}
      >
        آخر فحص:{" "}
        {new Date().toLocaleString("ar-SA", {
          dateStyle: "medium",
          timeStyle: "medium",
        })}{" "}
        — {elapsed}ms
      </p>
    </AdminShell>
  );
}
