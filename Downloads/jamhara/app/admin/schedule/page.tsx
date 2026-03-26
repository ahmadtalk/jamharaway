import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { SchedulePageClient } from "@/components/admin/SchedulePageClient";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // Fetch scheduled jobs
  const { data: jobs } = await supabase
    .from("scheduled_jobs")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch last 30 runs
  const { data: runs } = await supabase
    .from("scheduled_job_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(30);

  // Fetch active categories for the selector
  const { data: categories } = await supabase
    .from("categories")
    .select("slug, name_ar")
    .eq("is_active", true)
    .is("parent_id", null)
    .order("name_ar");

  return (
    <AdminShell title="الجدولة التلقائية" userEmail={user.email}>
      <SchedulePageClient
        initialJobs={jobs ?? []}
        initialRuns={runs ?? []}
        categories={categories ?? []}
      />
    </AdminShell>
  );
}
