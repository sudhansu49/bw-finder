import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CommandPalette } from "@/components/layout/command-palette";
import { LocaleSync } from "@/components/layout/locale-sync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BW Finder - Find Businesses Without Websites",
  description: "Discover local businesses that need your digital services. Search, track, and close deals faster with BW Finder.",
  keywords: ["business finder", "lead generation", "website status", "digital services", "local businesses"],
  authors: [{ name: "BW Finder" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "BW Finder - Find Businesses Without Websites",
    description: "Discover local businesses that need your digital services",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BW Finder - Find Businesses Without Websites",
    description: "Discover local businesses that need your digital services",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={200}>
            {children}
            <CommandPalette />
            <LocaleSync />
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
