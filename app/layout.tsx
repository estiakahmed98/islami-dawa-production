import type { Metadata } from "next";
import { Geist, Geist_Mono, Anek_Bangla, Tiro_Bangla } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import AppSessionProvider from "@/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";
import TreeProvider from "@/providers/treeProvider";
import { getLocale } from "next-intl/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Bangla
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

export const metadata: Metadata = {
  title: "ইসলামি দাওয়াহ ইনস্টিটিউট বাংলাদেশ",
  description: "ইসলামি দাওয়াহ ইনস্টিটিউট বাংলাদেশ",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
   const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${anekBangla.className} ${tiroBangla.variable} antialiased`}
      >
        <AppSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            <TreeProvider>{children}</TreeProvider>
            <Toaster />
          </ThemeProvider>
        </AppSessionProvider>
      </body>
    </html>
  );
}
