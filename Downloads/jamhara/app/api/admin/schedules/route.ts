import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/admin/schedules — list all scheduled jobs + last run per job
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: jobs, error } = await supabase
    .from("scheduled_jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ jobs: jobs ?? [] });
}

// POST /api/admin/schedules — create a new scheduled job
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  } = body;

  // Validate
  if (!name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!["once", "daily", "interval"].includes(recurrence)) {
    return NextResponse.json({ error: "invalid recurrence" }, { status: 400 });
  }
  if (!Array.isArray(post_types) || post_types.length === 0) {
    return NextResponse.json({ error: "at least one post_type required" }, { status: 400 });
  }
  const count = parseInt(posts_count, 10);
  if (isNaN(count) || count < 1 || count > 10) {
    return NextResponse.json({ error: "posts_count must be 1-10" }, { status: 400 });
  }

  // interval mode
  if (recurrence === "interval") {
    const mins = parseInt(interval_minutes, 10);
    if (isNaN(mins) || mins < 5) {
      return NextResponse.json({ error: "interval_minutes must be >= 5" }, { status: 400 });
    }
    const ahs = active_hours_start !== undefined && active_hours_start !== null ? parseInt(active_hours_start, 10) : null;
    const ahe = active_hours_end   !== undefined && active_hours_end   !== null ? parseInt(active_hours_end,   10) : null;
    const { data, error } = await supabase
      .from("scheduled_jobs")
      .insert({
        name:                name.trim(),
        recurrence,
        interval_minutes:    mins,
        active_hours_start:  !isNaN(ahs as number) && ahs !== null ? ahs : null,
        active_hours_end:    !isNaN(ahe as number) && ahe !== null ? ahe : null,
        post_types,
        posts_count:         count,
        category_slugs:      Array.isArray(category_slugs) && category_slugs.length > 0 ? category_slugs : null,
      })
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, job: data });
  }

  // once / daily mode
  const hour = parseInt(run_at_hour, 10);
  const min  = parseInt(run_at_minute, 10);
  if (isNaN(hour) || hour < 0 || hour > 23) {
    return NextResponse.json({ error: "invalid hour" }, { status: 400 });
  }
  if (min < 0 || min > 55 || min % 5 !== 0) {
    return NextResponse.json({ error: "minute must be a multiple of 5 (0-55)" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("scheduled_jobs")
    .insert({
      name:           name.trim(),
      recurrence,
      run_at_hour:    hour,
      run_at_minute:  min,
      post_types,
      posts_count:    count,
      category_slugs: Array.isArray(category_slugs) && category_slugs.length > 0
                        ? category_slugs
                        : null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, job: data });
}
