import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, title_ar, title_en, body_ar, category_id, status } = await req.json();
  if (!id || !title_ar) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { error } = await supabase
    .from("posts")
    .update({ title_ar, title_en, body_ar, category_id, status })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
