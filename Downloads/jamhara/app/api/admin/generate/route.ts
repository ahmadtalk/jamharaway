import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

// Allowed internal generate endpoints
const ALLOWED_APIS = [
  "/api/generate",
  "/api/generate-chart",
  "/api/generate-quiz",
  "/api/generate-comparison",
  "/api/generate-ranking",
  "/api/generate-numbers",
  "/api/generate-scenarios",
  "/api/generate-timeline",
  "/api/generate-factcheck",
  "/api/generate-profile",
  "/api/generate-briefing",
  "/api/generate-quotes",
  "/api/generate-explainer",
  "/api/generate-debate",
  "/api/generate-guide",
  "/api/generate-network",
  "/api/generate-interview",
  "/api/generate-map",
  "/api/generate-news",
];

export async function POST(req: NextRequest) {
  // 1. Verify admin session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Parse request
  const body = await req.json();
  const { _api, ...payload } = body as { _api: string; [key: string]: unknown };

  if (!_api || !ALLOWED_APIS.includes(_api)) {
    return NextResponse.json({ error: "Invalid API endpoint" }, { status: 400 });
  }

  // 3. Build internal URL
  const host = req.headers.get("host") ?? "";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const targetUrl = `${protocol}://${host}${_api}`;

  // 4. Forward with GENERATE_SECRET
  const secret = process.env.GENERATE_SECRET?.trim();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (secret) headers["Authorization"] = `Bearer ${secret}`;

  try {
    const upstream = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upstream error" },
      { status: 502 }
    );
  }
}
