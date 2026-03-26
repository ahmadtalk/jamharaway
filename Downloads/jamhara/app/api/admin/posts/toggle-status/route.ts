import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, currentStatus } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const newStatus = currentStatus === "published" ? "draft" : "published";
  const update: Record<string, unknown> = { status: newStatus };
  if (newStatus === "published" && currentStatus !== "published") {
    update.published_at = new Date().toISOString();
  }

  const { error } = await supabase.from("posts").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, newStatus });
}
