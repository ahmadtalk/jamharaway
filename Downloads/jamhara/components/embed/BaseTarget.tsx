"use client";

import { useEffect } from "react";

/** Injects <base target="_top"> so all links inside the iframe open in the parent page */
export default function BaseTarget() {
  useEffect(() => {
    const base = document.createElement("base");
    base.target = "_top";
    document.head.insertBefore(base, document.head.firstChild);
    return () => { base.remove(); };
  }, []);
  return null;
}
