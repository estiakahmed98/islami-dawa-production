import type { Metadata, Viewport } from "next";
import React, { Suspense } from "react";
import { Geist, Geist_Mono, Anek_Bangla, Tiro_Bangla } from "next/font/google";
import { getLocale } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import AppSessionProvider from "@/providers/session-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import TreeProvider from "@/providers/treeProvider";
import PwaRegister from "./pwa-register";
import "./globals.css";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import GlobalLoading from "@/components/GlobalLoading";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anekBangla = Anek_Bangla({
  weight: ["400", "500", "600", "700"],
  subsets: ["bengali"],
  display: "swap",
});

const tiroBangla = Tiro_Bangla({
  weight: ["400"],
  subsets: ["bengali"],
  display: "swap",
  variable: "--font-tiro-bangla",
});

const metadataBase = process.env.NEXTAUTH_URL
  ? new URL(process.env.NEXTAUTH_URL)
  : undefined;

export const metadata: Metadata = {
  metadataBase,
  title: "ইসলামি দাওয়াহ ইনস্টিটিউট বাংলাদেশ",
  description: "ইসলামি দাওয়াহ ইনস্টিটিউট বাংলাদেশ",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${anekBangla.className} ${tiroBangla.variable} antialiased`}
      >
        <PwaRegister />
        <AppSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            <GlobalLoading />
            <Suspense fallback={<LoadingSkeleton />}>
              <TreeProvider>{children}</TreeProvider>
            </Suspense>
            <Toaster />
          </ThemeProvider>
        </AppSessionProvider>
      </body>
    </html>
  );
}
