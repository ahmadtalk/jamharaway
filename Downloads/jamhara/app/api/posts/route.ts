import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);
  const limit  = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);
  const type   = searchParams.get("type"); // optional filter

  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select(
      `*, type, chart_config, quiz_config, comparison_config, content_config,
       category:categories!posts_category_id_fkey(*),
       subcategory:categories!posts_subcategory_id_fkey(*),
       source:sources(*)`
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = (query as any).eq("type", type);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ posts: data ?? [], hasMore: (data?.length ?? 0) === limit });
}
