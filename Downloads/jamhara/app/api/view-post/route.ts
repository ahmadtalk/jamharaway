import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { post_id, session_id } = await req.json();
    if (!post_id || !session_id) return NextResponse.json({ ok: false }, { status: 400 });

    const supabase = createAdminClient();
    await supabase.rpc("increment_post_view", {
      p_post_id: post_id,
      p_session_id: session_id,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
