import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Auth: accept Vercel cron secret OR force=1 from admin
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization") ?? "";
  const forceRun = req.nextUrl.searchParams.get("force") === "1";
  const countParam = parseInt(req.nextUrl.searchParams.get("count") ?? "2", 10);
  const postsToGenerate = Math.min(Math.max(countParam, 1), 5);

  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !forceRun) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // Get active parent categories
  const { data: categories } = await supabase
    .from("categories")
    .select("slug")
    .eq("is_active", true)
    .is("parent_id", null);

  if (!categories?.length) {
    return NextResponse.json({ error: "No active categories found" }, { status: 400 });
  }

  // Pick random categories (no repeats)
  const shuffled = [...categories].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, postsToGenerate);

  // Build base URL for internal fetch
  const host = req.headers.get("host") ?? "jamhara.vercel.app";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const generateSecret =
    process.env.GENERATE_SECRET ??
    process.env.NEXT_PUBLIC_GENERATE_SECRET ??
    "jamhara-gen-2026";

  // Generate posts sequentially to avoid rate limits
  const results: unknown[] = [];
  for (const cat of picked) {
    try {
      const res = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: generateSecret,
        },
        body: JSON.stringify({ category_slug: cat.slug }),
      });
      const data = await res.json();
      results.push(data);
    } catch (e) {
      results.push({ error: e instanceof Error ? e.message : "fetch error" });
    }
  }

  const succeeded = results.filter(
    (r) => (r as { success?: boolean }).success
  ).length;

  return NextResponse.json({
    success: true,
    generated: postsToGenerate,
    succeeded,
    results,
  });
}
