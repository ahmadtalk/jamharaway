"use client";

import { useEffect } from "react";

export default function ViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    if (!postId) return;

    // Get or create a persistent browser session ID
    let sid = localStorage.getItem("jamhara_sid");
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem("jamhara_sid", sid);
    }

    fetch("/api/view-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, session_id: sid }),
    }).catch(() => {}); // fire-and-forget
  }, [postId]);

  return null;
}
