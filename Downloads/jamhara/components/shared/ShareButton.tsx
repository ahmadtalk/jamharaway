"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { PostWithRelations } from "@/lib/supabase/types";

const ShareCardModal = dynamic(() => import("./ShareCardModal"), { ssr: false });

interface Props {
  post:   PostWithRelations;
  locale: "ar" | "en";
  isAr:   boolean;
}

export default function ShareButton({ post, locale, isAr }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={isAr ? "مشاركة كصورة" : "Share as image"}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          background: "var(--slate3)", border: "none",
          borderRadius: 8, padding: "5px 11px",
          cursor: "pointer", fontSize: ".75rem", fontWeight: 700,
          color: "var(--muted)", transition: "background .15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--green-light)")}
        onMouseLeave={e => (e.currentTarget.style.background = "var(--slate3)")}
      >
        <span>📸</span>
        <span>{isAr ? "مشاركة" : "Share"}</span>
      </button>
      {open && (
        <ShareCardModal
          post={post}
          locale={locale}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
