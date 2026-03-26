"use client";

import { useEffect } from "react";

/** Reports the document height to the parent frame via postMessage for auto-height iframes */
export default function EmbedHeightReporter() {
  useEffect(() => {
    function report() {
      const h = document.documentElement.scrollHeight;
      window.parent.postMessage({ jamhara_embed_height: h }, "*");
    }
    // Initial report after layout settles
    const t = setTimeout(report, 120);
    // Watch for content changes (e.g. quiz expanding)
    const ro = new ResizeObserver(report);
    ro.observe(document.body);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, []);
  return null;
}
