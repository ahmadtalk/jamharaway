import type { Metadata, Viewport } from "next";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "900"],
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
  title: { default: "جمهرة | المعرفة الموثوقة", template: "%s | جمهرة" },
  description: "منصة عربية للمعرفة المنظّمة والموثوقة",
  keywords: ["معرفة", "علوم", "ثقافة", "jamhara"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    siteName: "جمهرة",
    locale: "ar_SA",
  },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "جمهرة" },
};

export const viewport: Viewport = {
  themeColor: "#373C55",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={`${cairo.variable} ${ibm.variable}`}>{children}</body>
    </html>
  );
}
