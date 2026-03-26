import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { CategoriesPageClient } from "@/components/admin/CategoriesPageClient";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name_ar, name_en, slug, color, icon, parent_id, is_active, sort_order")
    .order("sort_order");

  const { data: postCounts } = await supabase
    .from("posts")
    .select("category_id")
    .eq("status", "published");

  return (
    <AdminShell title="التصنيفات" userEmail={user.email}>
      <CategoriesPageClient
        categories={categories ?? []}
        postCounts={postCounts ?? []}
      />
    </AdminShell>
  );
}
