/** Format number: 1200 → 1.2k */
export function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "م";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "ك";
  return String(n);
}

/** Generate a session ID for anonymous interactions */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("jmh_sid");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("jmh_sid", id);
  }
  return id;
}

/** Time since publication (Arabic) */
export function timeAgo(date: string, locale: "ar" | "en" = "ar"): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (seconds < 60) return rtf.format(-seconds, "second");
  if (seconds < 3600) return rtf.format(-Math.floor(seconds / 60), "minute");
  if (seconds < 86400) return rtf.format(-Math.floor(seconds / 3600), "hour");
  if (seconds < 2592000) return rtf.format(-Math.floor(seconds / 86400), "day");
  if (seconds < 31536000) return rtf.format(-Math.floor(seconds / 2592000), "month");
  return rtf.format(-Math.floor(seconds / 31536000), "year");
}

/** Build post URL */
export function postUrl(id: string, locale: "ar" | "en" = "ar"): string {
  return locale === "en" ? `/en/p/${id}` : `/p/${id}`;
}

/** Build category URL */
export function categoryUrl(slug: string, locale: "ar" | "en" = "ar"): string {
  return locale === "en" ? `/en/${slug}` : `/${slug}`;
}
