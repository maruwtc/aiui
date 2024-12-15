'use client';

import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeSwitcher } from "@/components/theme-switcher";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-[100dvh]">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased h-[100dvh] bg-background transition-colors`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="chat-theme"
        >
          <div className="flex flex-col min-h-[100dvh] h-[100dvh] overflow-hidden">
            <main className="flex-1 overflow-hidden relative">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}