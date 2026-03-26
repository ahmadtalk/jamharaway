"use client";

import { useEffect } from "react";

/**
 * Add to any page that renders jamhara embed iframes (e.g. article detail).
 * Listens for postMessage from /embed/[id] pages and auto-sizes the iframe.
 * Handles the dangerouslySetInnerHTML case where <script> tags won't execute.
 */
export default function EmbedResizer() {
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const h = e.data?.jamhara_embed_height;
      if (!h || typeof h !== "number" || h < 50) return;

      const frames = document.querySelectorAll<HTMLIFrameElement>(
        'iframe[src*="jamhara.vercel.app/embed/"]'
      );
      frames.forEach((frame) => {
        try {
          if (frame.contentWindow === e.source) {
            frame.style.height = h + "px";
            frame.style.overflow = "hidden";
          }
        } catch { /* cross-origin guard */ }
      });
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return null;
}
