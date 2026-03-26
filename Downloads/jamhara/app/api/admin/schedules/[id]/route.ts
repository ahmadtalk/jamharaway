import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PUT /api/admin/schedules/[id] — update job
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const {
    name,
    recurrence,
    run_at_hour,
    run_at_minute,
    interval_minutes,
    active_hours_start,
    active_hours_end,
    post_types,
    posts_count,
    category_slugs,
    is_active,
  } = body;

  // Build update object (only include provided fields)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = {};

  if (name !== undefined)             update.name = name.trim();
  if (recurrence !== undefined)       update.recurrence = recurrence;
  if (run_at_hour !== undefined)      update.run_at_hour = parseInt(run_at_hour, 10);
  if (run_at_minute !== undefined)    update.run_at_minute = parseInt(run_at_minute, 10);
  if (interval_minutes !== undefined) update.interval_minutes = parseInt(interval_minutes, 10);
  if (active_hours_start !== undefined) update.active_hours_start = active_hours_start !== null ? parseInt(active_hours_start, 10) : null;
  if (active_hours_end   !== undefined) update.active_hours_end   = active_hours_end   !== null ? parseInt(active_hours_end,   10) : null;
  if (post_types !== undefined)       update.post_types = post_types;
  if (posts_count !== undefined)      update.posts_count = parseInt(posts_count, 10);
  if (is_active !== undefined)        update.is_active = is_active;

  if (category_slugs !== undefined) {
    update.category_slugs = Array.isArray(category_slugs) && category_slugs.length > 0
      ? category_slugs
      : null;
  }

  const { data, error } = await supabase
    .from("scheduled_jobs")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, job: data });
}

// DELETE /api/admin/schedules/[id] — delete job (runs cascade to job_runs via SET NULL)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { error } = await supabase
    .from("scheduled_jobs")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

// POST /api/admin/schedules/[id] — actions: toggle | run
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { action } = await req.json();

  // ── Toggle ───────────────────────────────────────────
  if (action === "toggle") {
    const { data: job } = await supabase
      .from("scheduled_jobs")
      .select("is_active")
      .eq("id", id)
      .single();

    const { data, error } = await supabase
      .from("scheduled_jobs")
      .update({ is_active: !job?.is_active })
      .eq("id", id)
      .select("is_active")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, is_active: data?.is_active });
  }

  // ── Run now ──────────────────────────────────────────
  if (action === "run") {
    const host = req.headers.get("host") ?? "jamhara.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";

    const res = await fetch(
      `${protocol}://${host}/api/cron/scheduler?force=1&job_id=${id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET ?? ""}`,
        },
      }
    );
    const data = await res.json();
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
