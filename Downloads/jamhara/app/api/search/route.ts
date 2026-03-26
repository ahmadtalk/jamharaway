import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const locale = req.nextUrl.searchParams.get("locale") ?? "ar";
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "8");

  if (q.length < 2) return NextResponse.json({ results: [] });

  const supabase = await createClient();

  const { data } = await supabase
    .from("posts")
    .select(
      "id, title_ar, title_en, body_ar, body_en, type, category:categories!posts_category_id_fkey(name_ar, name_en, slug, color)"
    )
    .eq("status", "published")
    .or(
      `title_ar.ilike.%${q}%,title_en.ilike.%${q}%,body_ar.ilike.%${q}%,body_en.ilike.%${q}%`
    )
    .order("published_at", { ascending: false })
    .limit(limit);

  const results = (data ?? []).map((p) => {
    const title =
      locale === "ar" ? p.title_ar : (p.title_en || p.title_ar);
    const body =
      locale === "ar" ? p.body_ar : (p.body_en || p.body_ar);
    const cat = (Array.isArray(p.category) ? p.category[0] : p.category) as {
      name_ar: string;
      name_en: string;
      slug: string;
      color: string;
    } | null;
    return {
      id: p.id,
      title,
      body_excerpt: body?.replace(/<[^>]*>/g, "").slice(0, 100) ?? "",
      type: p.type,
      category_name: cat
        ? locale === "ar"
          ? cat.name_ar
          : cat.name_en
        : "",
      category_slug: cat?.slug ?? "",
      category_color: cat?.color ?? "#4CB36C",
    };
  });

  return NextResponse.json({ results });
}
