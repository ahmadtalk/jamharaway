"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TogglePublishButtonProps {
  postId: string;
  currentStatus: string;
}

export function TogglePublishButton({ postId, currentStatus }: TogglePublishButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isPublished = currentStatus === "published";

  async function handleToggle() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/posts/toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postId, currentStatus }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <button disabled className={isPublished ? "a-btn-unpublish" : "a-btn-publish"}>
        ...
      </button>
    );
  }

  if (isPublished) {
    return (
      <button className="a-btn-unpublish" onClick={handleToggle}>
        إلغاء النشر
      </button>
    );
  }

  return (
    <button className="a-btn-publish" onClick={handleToggle}>
      نشر
    </button>
  );
}
