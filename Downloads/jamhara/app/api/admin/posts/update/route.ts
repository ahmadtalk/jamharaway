import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, title_ar, title_en, body_ar, category_id, status, content_config } = await req.json();
  if (!id || !title_ar) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatePayload: Record<string, any> = { title_ar, title_en, body_ar, category_id, status };
  if (content_config !== undefined) updatePayload.content_config = content_config;

  const { error } = await supabase
    .from("posts")
    .update(updatePayload)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
