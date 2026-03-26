"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("هل تريد حذف هذا المنشور نهائياً؟")) return;
    setLoading(true);
    try {
      await fetch("/api/admin/posts/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postId }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className="a-btn-danger" onClick={handleDelete} disabled={loading}>
      {loading ? "..." : "حذف"}
    </button>
  );
}
