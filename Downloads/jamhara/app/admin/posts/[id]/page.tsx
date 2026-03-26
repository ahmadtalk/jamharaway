import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { EditPostForm } from "@/components/admin/EditPostForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { id } = await params;

  const { data: post } = await supabase
    .from("posts")
    .select("id, title_ar, title_en, body_ar, category_id, status, image_url")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name_ar, color")
    .eq("is_active", true)
    .order("sort_order");

  const pageTitle =
    post.title_ar.length > 40
      ? post.title_ar.slice(0, 40) + "…"
      : post.title_ar;

  return (
    <AdminShell title={pageTitle} userEmail={user.email}>
      <EditPostForm
        post={{
          id: post.id,
          title_ar: post.title_ar,
          title_en: post.title_en ?? null,
          body_ar: post.body_ar ?? null,
          category_id: post.category_id ?? null,
          status: post.status ?? "draft",
          image_url: (post as { image_url?: string | null }).image_url ?? null,
        }}
        categories={(categories ?? []).map((c) => ({
          id: c.id,
          name_ar: c.name_ar,
          color: c.color ?? null,
        }))}
      />
    </AdminShell>
  );
}
