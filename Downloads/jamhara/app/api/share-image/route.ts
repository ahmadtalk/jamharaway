/**
 * GET /api/share-image?id=POST_ID&locale=ar
 * ────────────────────────────────────────────────────────
 * يستدعي Puppeteer service على Railway ويُعيد صورة PNG 1080×1350 (4:5 Instagram)
 *
 * متغيرات البيئة المطلوبة:
 *   PUPPETEER_SERVICE_URL  — URL خدمة Railway (مثل: https://xxx.railway.app)
 *   PUPPET_SECRET          — مشترك مع الخدمة للمصادقة
 *   NEXT_PUBLIC_SITE_URL   — https://jamhara.com
 */

import { NextRequest, NextResponse } from "next/server";

const WIDTH  = 1080;
const HEIGHT = 1350;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id     = searchParams.get("id");
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

  const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jamhara.com";
  const previewUrl = `${siteUrl}/share-preview/${id}?locale=${locale}`;

  try {
    const response = await fetch(`${puppeteerUrl}/screenshot`, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret":     process.env.PUPPET_SECRET ?? "",
      },
      body: JSON.stringify({ url: previewUrl, width: WIDTH, height: HEIGHT, scale: 2 }),
      signal: AbortSignal.timeout(55_000),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":        "image/png",
        "Content-Disposition": `attachment; filename="jamhara-share-2160x2700.png"`,
        "Cache-Control":       "public, max-age=3600",
      },
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[share-image] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
