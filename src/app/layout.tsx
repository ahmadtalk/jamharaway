import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { arSA } from "@clerk/localizations";
import "./globals.css";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans-arabic",
});

export const metadata: Metadata = {
  title: "تدقيق - منصة التدقيق",
  description: "منصة تدقيق المحتوى الإعلامي",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={arSA} dynamic>
      <html lang="ar" dir="rtl">
        <body className={`${ibmPlexSansArabic.variable} font-sans`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
