/**
 * app/share-preview/[id]/page.tsx
 * ────────────────────────────────
 * صفحة معاينة نظيفة — بلا Header/Sidebar/Footer
 * تستخدمها خدمة Puppeteer لأخذ screenshot 1080×1350 (4:5 Instagram)
 *
 * ?locale=ar|en  (default: ar)
 */

import { createClient } from "@/lib/supabase/server";
import SharePreviewCard from "@/components/shared/SharePreviewCard";
import type { PostWithRelations } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ locale?: string }>;
}

export default async function SharePreviewPage({ params, searchParams }: Props) {
  const { id }  = await params;
  const sp      = await searchParams;
  const locale  = (sp.locale === "en" ? "en" : "ar") as "ar" | "en";

  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select(`
      *,
      category:categories!posts_category_id_fkey(*),
      subcategory:categories!posts_subcategory_id_fkey(*),
      source:sources(*)
    `)
    .eq("id", id)
    .single();

  if (!post) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
        width: 1080, height: 1350, fontFamily: "sans-serif", color: "#999", background: "#fff" }}>
        Post not found
      </div>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jamhara.com";
  const logoSrc = `${siteUrl}/logo.png`;

  return (
    <div
      style={{ width: 1080, height: 1350, overflow: "hidden" }}
      data-share-preview="true"
    >
      <SharePreviewCard
        post={post as PostWithRelations}
        locale={locale}
        logoSrc={logoSrc}
      />
    </div>
  );
}
