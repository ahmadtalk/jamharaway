/**
 * app/share-preview/[id]/page.tsx
 * ────────────────────────────────
 * صفحة معاينة نظيفة — بلا Header/Sidebar/Footer
 * تستخدمها خدمة Puppeteer لأخذ screenshot احترافي
 *
 * ?size=square|landscape|story   (default: square)
 * ?locale=ar|en                  (default: ar)
 */

import { createClient } from "@/lib/supabase/server";
import { buildShareCardData } from "@/lib/share-card-data";
import SharePreviewRenderer from "@/components/shared/SharePreviewRenderer";
import type { PostWithRelations } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const SIZES = {
  square:    { w: 1080, h: 1080 },
  landscape: { w: 1200, h:  628 },
  story:     { w: 1080, h: 1920 },
} as const;

type Size = keyof typeof SIZES;

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ size?: string; locale?: string }>;
}

export default async function SharePreviewPage({ params, searchParams }: Props) {
  const { id }     = await params;
  const sp         = await searchParams;
  const size       = ((sp.size ?? "square") as Size) in SIZES ? (sp.size as Size) : "square";
  const locale     = (sp.locale === "en" ? "en" : "ar") as "ar" | "en";

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
        width: "100vw", height: "100vh", fontFamily: "sans-serif", color: "#999" }}>
        Post not found
      </div>
    );
  }

  const { w, h } = SIZES[size];
  const shareData = buildShareCardData(post as PostWithRelations);

  // الشعار والصورة كروابط مباشرة — Puppeteer (Chrome حقيقي) يحمّلها بلا مشاكل
  const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jamhara.com";
  const logoSrc  = `${siteUrl}/logo.png`;
  const imgSrc   = post.image_url ?? undefined;

  return (
    <div
      style={{
        width:    w,
        height:   h,
        overflow: "hidden",
        // هذا العنصر هو ما يُصوِّره Puppeteer بالضبط
      }}
      data-share-preview="true"
    >
      <SharePreviewRenderer
        data={shareData}
        size={size}
        locale={locale}
        logoSrc={logoSrc}
        imgSrc={imgSrc}
      />
    </div>
  );
}
