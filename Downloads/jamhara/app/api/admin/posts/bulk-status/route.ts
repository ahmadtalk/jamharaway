import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids, status } = (await req.json()) as { ids: string[]; status: "published" | "draft" };
  if (!ids?.length || !["published", "draft"].includes(status)) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const update: Record<string, unknown> = { status };
  if (status === "published") {
    update.published_at = new Date().toISOString();
  }

  const { error } = await supabase.from("posts").update(update).in("id", ids);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, updated: ids.length });
}
