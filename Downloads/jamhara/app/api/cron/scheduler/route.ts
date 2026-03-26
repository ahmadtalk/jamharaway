import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pickDiverseCombinations } from "@/lib/dedup";

// Mapping: post type → internal API path
const TYPE_API: Record<string, string> = {
  article:    "/api/generate",
  chart:      "/api/generate-chart",
  quiz:       "/api/generate-quiz",
  comparison: "/api/generate-comparison",
  ranking:    "/api/generate-ranking",
  numbers:    "/api/generate-numbers",
  scenarios:  "/api/generate-scenarios",
  timeline:   "/api/generate-timeline",
  factcheck:  "/api/generate-factcheck",
  profile:    "/api/generate-profile",
  briefing:   "/api/generate-briefing",
  quotes:     "/api/generate-quotes",
  explainer:  "/api/generate-explainer",
  debate:     "/api/generate-debate",
  guide:      "/api/generate-guide",
  network:    "/api/generate-network",
  interview:  "/api/generate-interview",
  map:        "/api/generate-map",
  news:       "/api/generate-news",
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  // ── Auth ─────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET?.trim();
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const isForced = req.nextUrl.searchParams.get("force") === "1";

  if (cronSecret && !isVercelCron && !isForced) {
    // Accept secret via Authorization header OR ?secret= URL param (easier for cron-job.org)
    const authHeader = (req.headers.get("authorization") ?? "").trim();
    const secretParam = (req.nextUrl.searchParams.get("secret") ?? "").trim();
    const isAuthorized =
      authHeader === `Bearer ${cronSecret}` ||
      authHeader === cronSecret ||
      secretParam === cronSecret;
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const generateSecret = process.env.GENERATE_SECRET ?? "jamhara-gen-2026";
  const host = req.headers.get("host") ?? "jamhara.vercel.app";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const supabase = createAdminClient();

  // ── Find due jobs ─────────────────────────────────────
  const now = new Date();
  const currentHour   = now.getUTCHours();
  const currentMinute = Math.floor(now.getUTCMinutes() / 5) * 5;
  const forcedJobId   = req.nextUrl.searchParams.get("job_id");

  // جلب جميع الجدولات النشطة دفعة واحدة ثم الفلترة في الكود
  let jobsQuery = supabase
    .from("scheduled_jobs")
    .select("*")
    .eq("is_active", true);

  if (forcedJobId) jobsQuery = jobsQuery.eq("id", forcedJobId);

  const { data: allJobs, error: jobsError } = await jobsQuery;

  if (jobsError) return NextResponse.json({ error: jobsError.message }, { status: 500 });
  if (!allJobs || allJobs.length === 0) {
    return NextResponse.json({ message: "No active jobs", time: `${currentHour}:${String(currentMinute).padStart(2,"0")} UTC` });
  }

  const today = now.toISOString().slice(0, 10);

  const dueJobs = forcedJobId ? allJobs : allJobs.filter((job) => {
    // ── interval: يعمل كل N دقيقة ──────────────────────
    if (job.recurrence === "interval") {
      const mins = job.interval_minutes as number;
      if (!mins || mins < 5) return false;

      // نافذة التشغيل اليومية (active_hours_start/end) — اختياري
      const hs = job.active_hours_start as number | null;
      const he = job.active_hours_end   as number | null;
      if (hs !== null && he !== null) {
        const inWindow = currentHour >= hs && currentHour < he;
        if (!inWindow) return false;
      }

      if (!job.last_run_at) return true; // لم يعمل قط → شغّله الآن
      const nextRun = new Date(job.last_run_at).getTime() + mins * 60_000;
      return now.getTime() >= nextRun;
    }

    // ── once/daily: يتحقق من الساعة والدقيقة ──────────
    const hourMatch   = job.run_at_hour   === currentHour;
    const minuteMatch = job.run_at_minute === currentMinute;
    if (!hourMatch || !minuteMatch) return false;

    if (job.recurrence === "once")  return !job.last_run_at;
    if (job.recurrence === "daily") {
      if (!job.last_run_at) return true;
      return new Date(job.last_run_at).toISOString().slice(0, 10) < today;
    }
    return false;
  });

  if (dueJobs.length === 0) {
    return NextResponse.json({ message: "No jobs due at this time", time: `${currentHour}:${String(currentMinute).padStart(2,"0")} UTC` });
  }

  // ── وظيفة واحدة فقط لكل استدعاء — الأكثر تأخراً ─────
  // هذا يضمن عدم تجاوز مهلة Vercel (60 ث) حتى لو تطابقت أوقات عدة جدولات
  // الوظائف المتبقية تُنجز في الدورات القادمة (cron-job.org كل 5 دقائق)
  const jobsToProcess = forcedJobId ? dueJobs : [
    [...dueJobs].sort((a, b) => {
      const aAge = a.last_run_at ? now.getTime() - new Date(a.last_run_at).getTime() : Infinity;
      const bAge = b.last_run_at ? now.getTime() - new Date(b.last_run_at).getTime() : Infinity;
      return bAge - aAge;
    })[0]
  ];

  // ── Get all active categories for random selection ────
  const { data: allCategories } = await supabase
    .from("categories")
    .select("slug, name_ar")
    .eq("is_active", true)
    .is("parent_id", null);

  const allCategorySlugs = (allCategories ?? []).map((c) => c.slug);

  // ── Run each job ──────────────────────────────────────
  const jobSummaries: unknown[] = [];

  for (const job of jobsToProcess) {
    // Generate UUID client-side so we don't need SELECT after INSERT
    // (anon RLS policy allows INSERT but not SELECT on scheduled_job_runs)
    const runId = crypto.randomUUID();

    const { error: runInsertErr } = await supabase
      .from("scheduled_job_runs")
      .insert({
        id:           runId,
        job_id:       job.id,
        job_name:     job.name,
        triggered_by: forcedJobId ? "manual" : "cron",
        status:       "running",
      });

    if (runInsertErr) {
      jobSummaries.push({ job: job.name, error: `Failed to create run record: ${runInsertErr.message}` });
      continue;
    }

    // ← تحديث last_run_at فوراً قبل التوليد — يمنع إعادة التشغيل عند timeout
    await supabase
      .from("scheduled_jobs")
      .update({ last_run_at: new Date().toISOString() })
      .eq("id", job.id);

    // حارس الوقت — نتوقف قبل 10 ثوانٍ من نهاية المهلة (55 ثانية max لكل منشور)
    const JOB_DEADLINE = Date.now() + 50_000; // 50 ثانية per job max

    // Determine categories to use
    const categorySlugsPool: string[] =
      job.category_slugs?.length ? job.category_slugs : allCategorySlugs;

    if (!categorySlugsPool.length) {
      await supabase
        .from("scheduled_job_runs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          error_message: "No active categories found",
          posts_attempted: 0,
        })
        .eq("id", runId);
      continue;
    }

    // حد أقصى 2 منشور لكل تشغيل — يضمن عدم تجاوز مهلة Vercel
    const safePostsCount = Math.min(job.posts_count, 2);

    // ── Layer 1: Diversity-aware selection ────────────────────────
    // بدل الاختيار العشوائي: نختار المجموعة (category+type) الأقدم استخداماً
    const diverseCombos = await pickDiverseCombinations(
      categorySlugsPool,
      job.post_types as string[],
      safePostsCount,
    );

    // Run each post generation
    const postResults: unknown[] = [];
    let succeeded = 0;
    let failed = 0;

    for (const { categorySlug, postType } of diverseCombos) {
      // توقف إذا اقتربنا من نهاية المهلة
      if (Date.now() > JOB_DEADLINE) {
        postResults.push({ type: "timeout", category: categorySlug, success: false, error: "Job time limit reached" });
        failed++;
        continue;
      }

      const apiPath  = TYPE_API[postType] ?? "/api/generate";

      try {
        const res = await fetch(`${baseUrl}${apiPath}`, {
          method: "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${generateSecret}`,
          },
          body: JSON.stringify({ category_slug: categorySlug }),
        });

        const data = await res.json() as {
          success?: boolean;
          post?: { id?: string; title_ar?: string };
          error?: string;
        };

        if (data.success) {
          succeeded++;
          postResults.push({
            type:      postType,
            category:  categorySlug,
            success:   true,
            title:     data.post?.title_ar ?? "منشور جديد",
            post_id:   data.post?.id,
          });
        } else {
          failed++;
          postResults.push({
            type:     postType,
            category: categorySlug,
            success:  false,
            error:    data.error ?? `HTTP ${res.status}`,
          });
        }
      } catch (e) {
        failed++;
        postResults.push({
          type:     postType,
          category: categorySlug,
          success:  false,
          error:    e instanceof Error ? e.message : "Network error",
        });
      }
    }

    // Determine final status
    const finalStatus =
      succeeded === 0 ? "failed"
      : failed === 0  ? "done"
      :                 "partial";

    // Update run record
    await supabase
      .from("scheduled_job_runs")
      .update({
        status:          finalStatus,
        completed_at:    new Date().toISOString(),
        posts_attempted: diverseCombos.length,
        posts_succeeded: succeeded,
        posts_failed:    failed,
        results:         postResults,
      })
      .eq("id", runId);

    // تحديث إحصائيات الوظيفة (last_run_at سبق تحديثه في البداية)
    const newTotalRuns      = (job.total_runs ?? 0) + 1;
    const newTotalSucceeded = (job.total_succeeded ?? 0) + succeeded;
    const newTotalFailed    = (job.total_failed ?? 0) + failed;

    await supabase
      .from("scheduled_jobs")
      .update({
        total_runs:      newTotalRuns,
        total_succeeded: newTotalSucceeded,
        total_failed:    newTotalFailed,
        ...(job.recurrence === "once" ? { is_active: false } : {}),
      })
      .eq("id", job.id);

    jobSummaries.push({
      job:       job.name,
      status:    finalStatus,
      succeeded,
      failed,
      results:   postResults,
    });
  }

  return NextResponse.json({
    success:   true,
    ran:       dueJobs.length,
    summaries: jobSummaries,
  });
}
