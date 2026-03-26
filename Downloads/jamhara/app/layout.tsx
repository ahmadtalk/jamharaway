import type { Metadata, Viewport } from "next";
import { Cairo, IBM_Plex_Sans_Arabic, Rubik } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-cairo",
  display: "swap",
});

const ibm = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-ibm",
  display: "swap",
});

const rubik = Rubik({
  subsets: ["arabic", "latin"],
  weight: ["700", "800", "900"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "جمهرة - قيمة المرء ما يعرفه", template: "%s | جمهرة" },
  description: "منصة معرفية عربية توفر محتوى موثوقاً ومنظماً في العلوم والثقافة والفكر",
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
    <html suppressHydrationWarning className={`${cairo.variable} ${ibm.variable} ${rubik.variable}`}>
      <body>{children}</body>
    </html>
  );
}
