/**
 * oEmbed endpoint — https://oembed.com/
 * Enables WordPress and other CMS auto-embed: paste the post URL → auto-embeds.
 *
 * Discovery: post pages include <link rel="alternate" type="application/json+oembed" href="...">
 * which WordPress and Gutenberg detect automatically.
 */
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const SITE = "https://jamhara.vercel.app";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url") ?? "";

  // Accept URLs like: /p/[id]  /ar/p/[id]  /en/p/[id]
  const match = url.match(/\/p\/([0-9a-f-]{36})/i);
  if (!match) {
    return NextResponse.json({ error: "not a jamhara post URL" }, { status: 404 });
  }

  const id = match[1];
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("id, title_ar, title_en, image_url")
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (!post) {
    return NextResponse.json({ error: "post not found" }, { status: 404 });
  }

  const embedHtml =
    `<iframe src="${SITE}/embed/${id}" ` +
    `width="100%" height="600" frameborder="0" ` +
    `style="border:none;border-radius:14px;display:block;" loading="lazy">` +
    `</iframe>` +
    `<script src="${SITE}/embed.js" async><\/script>`;

  const response = {
    version: "1.0",
    type: "rich",
    provider_name: "جمهرة",
    provider_url: SITE,
    title: post.title_ar,
    thumbnail_url: post.image_url ?? undefined,
    thumbnail_width: post.image_url ? 600 : undefined,
    thumbnail_height: post.image_url ? 400 : undefined,
    width: 600,
    height: 600,
    html: embedHtml,
  };

  // Support JSONP (some older WordPress versions use it)
  const callback = req.nextUrl.searchParams.get("callback");
  if (callback && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(callback)) {
    return new Response(`${callback}(${JSON.stringify(response)})`, {
      headers: { "Content-Type": "application/javascript" },
    });
  }

  return NextResponse.json(response, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
