import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

// POST — إضافة تصنيف جديد
export async function POST(req: NextRequest) {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name_ar, name_en, slug, color, icon, parent_id } = await req.json();
  if (!name_ar || !slug)
    return NextResponse.json({ error: "الاسم والـ slug مطلوبان" }, { status: 400 });

  const { data: category, error } = await supabase
    .from("categories")
    .insert({ name_ar, name_en: name_en || null, slug, color: color || null, icon: icon || null, parent_id: parent_id || null, is_active: true })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, category });
}

// PUT — تعديل تصنيف موجود
export async function PUT(req: NextRequest) {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name_ar, name_en, slug, color, icon, is_active, sort_order } = await req.json();
  if (!id || !name_ar || !slug)
    return NextResponse.json({ error: "id والاسم والـ slug مطلوبة" }, { status: 400 });

  const { data: category, error } = await supabase
    .from("categories")
    .update({
      name_ar,
      name_en: name_en || null,
      slug,
      color: color || null,
      icon: icon || null,
      is_active: is_active ?? true,
      sort_order: sort_order ?? null,
    })
    .eq("id", id)
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, category });
}
