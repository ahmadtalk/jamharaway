import type { Metadata } from "next";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./admin.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["600", "700", "900"],
  variable: "--font-cairo",
  display: "swap",
});

const ibm = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-ibm",
  display: "swap",
});

export const metadata: Metadata = {
  title: "لوحة التحكم | جمهرة",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${ibm.variable}`}>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
