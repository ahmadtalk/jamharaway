import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { GeneratePageClient } from "@/components/admin/GeneratePageClient";

export default async function GeneratePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: allCats } = await supabase
    .from("categories")
    .select("id, name_ar, name_en, slug, parent_id, color, is_active, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  const cats = allCats ?? [];
  const mainCats = cats.filter((c) => !c.parent_id);
  const subCats  = cats.filter((c) =>  c.parent_id);

  return (
    <AdminShell title="توليد المحتوى" userEmail={user.email}>
      <GeneratePageClient mainCats={mainCats} subCats={subCats} />
    </AdminShell>
  );
}
