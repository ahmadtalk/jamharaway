"use client";

import { useState, useCallback } from "react";
import type { PostWithRelations } from "@/lib/supabase/types";
import { fmt, getSessionId, postUrl } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface Props {
  post: PostWithRelations;
  locale: "ar" | "en";
}

export default function PostDetailActions({ post, locale }: Props) {
  const [likes, setLikes] = useState(post.like_count);
  const [liked, setLiked] = useState(false);

  const title = locale === "ar" ? post.title_ar : (post.title_en || post.title_ar);

  const handleLike = useCallback(async () => {
    if (liked) return;
    setLiked(true);
    setLikes((n) => n + 1);
    const supabase = createClient();
    const sid = getSessionId();
    await Promise.all([
      supabase.from("post_interactions").insert({ post_id: post.id, session_id: sid, action: "like" }),
      supabase.from("posts").update({ like_count: likes + 1 }).eq("id", post.id),
    ]);
  }, [liked, likes, post.id]);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}${postUrl(post.id, locale)}`;
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, [post.id, title, locale]);

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        marginTop: 28,
        paddingTop: 20,
        borderTop: "1px solid var(--border)",
      }}
    >
      <button
        className={`like-btn ${liked ? "liked" : ""}`}
        onClick={handleLike}
        style={{ fontSize: ".9rem", padding: "8px 18px" }}
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8}>
          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
        </svg>
        {locale === "ar" ? `أعجبني · ${fmt(likes)}` : `Like · ${fmt(likes)}`}
      </button>

      <button
        className="share-btn"
        onClick={handleShare}
        style={{ fontSize: ".9rem", padding: "8px 18px" }}
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47A3 3 0 1015 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {locale === "ar" ? "مشاركة" : "Share"}
      </button>
    </div>
  );
}
