import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 60;

// ============================================================
// SMART PROMPT BUILDER (simplified for regeneration use case)
// ============================================================
function buildSimpleImagePrompt(titleEn: string, categoryName: string): string {
  return [
    `A stunning, award-winning editorial visual for a knowledge article about "${titleEn}".`,
    `Subject domain: ${categoryName}.`,
    `Visual style: editorial photography, professional illustration.`,
    `Composition: rule of thirds, strong focal point, no human faces.`,
    `Technical quality: ultra-detailed, 8K resolution.`,
    `IMPORTANT: absolutely no text, no letters, no words, no numbers, no typography anywhere in the image.`,
  ].join(" ");
}

// ============================================================
// UPLOAD IMAGE BUFFER TO SUPABASE STORAGE
// ============================================================
async function uploadBufferToStorage(
  buffer: Buffer,
  postId: string,
  ext: string,
  contentType: string
): Promise<string | null> {
  try {
    const adminSupabase = createAdminClient();
    const fileName = `${postId}.${ext}`;

    const { error } = await adminSupabase.storage
      .from("post-images")
      .upload(fileName, buffer, { contentType, upsert: true });

    if (error) {
      console.error("[Storage] upload error:", error.message);
      return null;
    }

    const { data } = adminSupabase.storage.from("post-images").getPublicUrl(fileName);
    return data.publicUrl;
  } catch (e) {
    console.error("[Storage] exception:", e instanceof Error ? e.message : String(e));
    return null;
  }
}

// ============================================================
// POST /api/admin/posts/image
// ============================================================
export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = req.headers.get("content-type") ?? "";

  // ── Handle file upload (multipart/form-data) ──────────────
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const postId = formData.get("post_id") as string;
    const file = formData.get("file") as File | null;

    if (!postId || !file) {
      return NextResponse.json({ error: "post_id and file are required" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.type.includes("png") ? "png" : "jpg";
    const imageUrl = await uploadBufferToStorage(buffer, postId, ext, file.type);

    if (!imageUrl) {
      return NextResponse.json({ error: "Failed to upload image to storage" }, { status: 500 });
    }

    const adminSupabase = createAdminClient();
    await adminSupabase.from("posts").update({ image_url: imageUrl }).eq("id", postId);

    return NextResponse.json({ success: true, image_url: imageUrl });
  }

  // ── Handle JSON body (regenerate / remove) ─────────────────
  const body = await req.json() as { post_id?: string; action?: string };
  const { post_id, action } = body;

  if (!post_id) {
    return NextResponse.json({ error: "post_id required" }, { status: 400 });
  }

  const adminSupabase = createAdminClient();

  // ── Remove image ───────────────────────────────────────────
  if (action === "remove") {
    await adminSupabase.from("posts").update({ image_url: null }).eq("id", post_id);
    return NextResponse.json({ success: true, image_url: null });
  }

  // ── Regenerate image via Replicate ─────────────────────────
  if (action === "regenerate") {
    const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
    if (!REPLICATE_TOKEN) {
      return NextResponse.json(
        { error: "REPLICATE_API_TOKEN is not configured" },
        { status: 503 }
      );
    }

    // Fetch post info
    const { data: post } = await adminSupabase
      .from("posts")
      .select("title_en, category:categories!posts_category_id_fkey(name_en)")
      .eq("id", post_id)
      .single();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const categoryName = (post.category as { name_en?: string } | null)?.name_en ?? "general";
    const titleEn = (post.title_en as string | null) ?? "";

    const prompt = buildSimpleImagePrompt(titleEn, categoryName);

    type ReplicateResponse = {
      id: string;
      status: string;
      output?: string[];
      urls?: { get: string };
      error?: string;
    };

    // Call Replicate
    const startRes = await fetch(
      "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${REPLICATE_TOKEN}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify({
          input: {
            prompt,
            num_outputs: 1,
            aspect_ratio: "16:9",
            output_format: "jpg",
            output_quality: 85,
            go_fast: true,
          },
        }),
      }
    );

    const rawText = await startRes.text();

    if (!startRes.ok) {
      return NextResponse.json(
        { error: `Replicate HTTP ${startRes.status}: ${rawText.slice(0, 200)}` },
        { status: 500 }
      );
    }

    const startData = JSON.parse(rawText) as ReplicateResponse;
    let replicateUrl: string | null = null;

    if (startData.status === "succeeded" && startData.output?.[0]) {
      replicateUrl = startData.output[0];
    } else if (startData.urls?.get) {
      // Poll up to 6 × 5s = 30s
      for (let i = 0; i < 6; i++) {
        await new Promise((r) => setTimeout(r, 5000));
        const pollRes = await fetch(startData.urls.get, {
          headers: { Authorization: `Bearer ${REPLICATE_TOKEN}` },
        });
        const pollData = (await pollRes.json()) as ReplicateResponse;
        if (pollData.status === "succeeded" && pollData.output?.[0]) {
          replicateUrl = pollData.output[0];
          break;
        }
        if (pollData.status === "failed") break;
      }
    }

    if (!replicateUrl) {
      return NextResponse.json({ error: "Image generation failed or timed out" }, { status: 500 });
    }

    // Download and upload to Supabase Storage
    const imgRes = await fetch(replicateUrl);
    if (!imgRes.ok) {
      return NextResponse.json({ error: "Failed to download generated image" }, { status: 500 });
    }

    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imageUrl = await uploadBufferToStorage(buffer, post_id, "jpg", "image/jpeg");

    if (!imageUrl) {
      return NextResponse.json({ error: "Failed to upload image to storage" }, { status: 500 });
    }

    await adminSupabase.from("posts").update({ image_url: imageUrl }).eq("id", post_id);

    return NextResponse.json({ success: true, image_url: imageUrl });
  }

  return NextResponse.json({ error: "Invalid action. Use: regenerate | remove" }, { status: 400 });
}
