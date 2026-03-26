import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { post_id, reason, name, note } = await req.json() as {
    post_id: string;
    reason: string;
    name?: string;
    note?: string;
  };

  if (!post_id || !reason) {
    return NextResponse.json({ error: "post_id and reason are required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("post_flags").insert({
    post_id,
    reason: reason.trim(),
    name: name?.trim() || null,
    note: note?.trim() || null,
  });

  if (error) {
    console.error("[flag-post] DB error:", error.message);
    return NextResponse.json({ error: "Failed to save flag" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
