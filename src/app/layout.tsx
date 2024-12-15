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
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 max-w-screen-2xl items-center">
                <div className="mr-4 hidden md:flex">
                  <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    Chat Assistant
                  </h1>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                  <div className="w-full flex-1 md:w-auto md:flex-none">
                    <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent md:hidden">
                      Chat Assistant
                    </h1>
                  </div>
                  <nav className="flex items-center">
                    <ThemeSwitcher />
                  </nav>
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-hidden relative">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}