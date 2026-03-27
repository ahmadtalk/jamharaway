/**
 * SharePreviewRenderer — wrapper لـ ShareCard بلا ref
 * يُستخدم في صفحة /share-preview/[id] لـ Puppeteer
 * معزول تماماً عن نظام html-to-image الحالي
 */
"use client";

import ShareCard from "./ShareCard";
import type { ShareCardData } from "@/lib/share-card-data";
import type { ShareCardSize } from "./ShareCard";

interface Props {
  data:     ShareCardData;
  size:     ShareCardSize;
  locale:   "ar" | "en";
  logoSrc?: string;
  imgSrc?:  string;
}

// لا نحتاج ref هنا — Puppeteer يصوّر الصفحة كاملاً
export default function SharePreviewRenderer({ data, size, locale, logoSrc, imgSrc }: Props) {
  return (
    <ShareCard
      data={data}
      size={size}
      locale={locale}
      logoSrc={logoSrc}
      imgSrc={imgSrc}
    />
  );
}
