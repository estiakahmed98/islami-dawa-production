import type { Metadata } from "next";
import { Geist, Geist_Mono, Anek_Bangla, Tiro_Bangla } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import TreeProvider from "@/providers/treeProvider";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${anekBangla.className} ${tiroBangla.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <TreeProvider>{children}</TreeProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
