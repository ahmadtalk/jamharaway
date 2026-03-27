/**
 * GET /api/share-image?id=POST_ID&size=square&locale=ar
 * ────────────────────────────────────────────────────────
 * يستدعي Puppeteer service على Railway ويُعيد صورة PNG عالية الجودة
 * معزول تماماً عن نظام html-to-image الحالي
 *
 * متغيرات البيئة المطلوبة:
 *   PUPPETEER_SERVICE_URL  — URL خدمة Railway (مثل: https://xxx.railway.app)
 *   PUPPET_SECRET          — مشترك مع الخدمة للمصادقة
 *   NEXT_PUBLIC_SITE_URL   — https://jamhara.com
 */

import { NextRequest, NextResponse } from "next/server";

const SIZES = {
  square:    { width: 1080, height: 1080 },
  landscape: { width: 1200, height:  628 },
  story:     { width: 1080, height: 1920 },
} as const;

type Size = keyof typeof SIZES;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id     = searchParams.get("id");
  const size   = (searchParams.get("size") ?? "square") as Size;
  const locale = (searchParams.get("locale") === "en" ? "en" : "ar");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const puppeteerUrl = process.env.PUPPETEER_SERVICE_URL;
  if (!puppeteerUrl) {
    return NextResponse.json(
      { error: "PUPPETEER_SERVICE_URL not configured" },
      { status: 503 }
    );
  }

  const { width, height } = SIZES[size] ?? SIZES.square;
  const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jamhara.com";
  const previewUrl = `${siteUrl}/share-preview/${id}?size=${size}&locale=${locale}`;

  try {
    const response = await fetch(`${puppeteerUrl}/screenshot`, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret":     process.env.PUPPET_SECRET ?? "",
      },
      body: JSON.stringify({ url: previewUrl, width, height, scale: 2 }),
      // Vercel Hobby = 60s max — Puppeteer عادةً 5-10s
      signal: AbortSignal.timeout(55_000),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const buffer = await response.arrayBuffer();

    const sizeLabel = `${width * 2}x${height * 2}`; // بالدقة المضاعفة
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":        "image/png",
        "Content-Disposition": `attachment; filename="jamhara-${size}-${sizeLabel}.png"`,
        "Cache-Control":       "public, max-age=3600",
      },
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[share-image] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
