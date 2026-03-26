"use client";

import { useState, useTransition } from "react";
import PostCard from "./PostCard";
import type { PostWithRelations } from "@/lib/supabase/types";

interface Props {
  initialPosts: PostWithRelations[];
  locale: string;
}

export default function LatestFeedClient({ initialPosts, locale }: Props) {
  const isAr = locale === "ar";
  const [posts, setPosts] = useState<PostWithRelations[]>(initialPosts);
  const [offset, setOffset] = useState(initialPosts.length);
  const [hasMore, setHasMore] = useState(initialPosts.length === 20);
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    startTransition(async () => {
      const res = await fetch(`/api/posts?offset=${offset}&limit=20`);
      if (!res.ok) return;
      const { posts: newPosts, hasMore: more } = await res.json();
      setPosts((prev) => [...prev, ...(newPosts as PostWithRelations[])]);
      setOffset((prev) => prev + newPosts.length);
      setHasMore(more);
    });
  }

  return (
    <>
      <div className="feed">
        {posts.map((post, i) => (
          <PostCard key={post.id} post={post} index={i} />
        ))}
      </div>

      {hasMore && (
        <div style={{ textAlign: "center", margin: "24px 0 8px" }}>
          <button
            onClick={loadMore}
            disabled={isPending}
            style={{
              background: isPending ? "var(--slate3)" : "var(--green)",
              color: isPending ? "var(--muted)" : "#fff",
              border: "none",
              borderRadius: 100,
              padding: "10px 32px",
              fontFamily: "var(--font-cairo), sans-serif",
              fontWeight: 700,
              fontSize: ".9rem",
              cursor: isPending ? "not-allowed" : "pointer",
              transition: "all .18s",
            }}
          >
            {isPending
              ? (isAr ? "جاري التحميل…" : "Loading…")
              : (isAr ? "عرض المزيد" : "Load More")}
          </button>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div style={{
          textAlign: "center",
          padding: "20px 0 8px",
          color: "var(--muted)",
          fontSize: ".8rem",
        }}>
          {isAr ? "لقد وصلت إلى آخر المنشورات" : "You've reached the end"}
        </div>
      )}
    </>
  );
}
