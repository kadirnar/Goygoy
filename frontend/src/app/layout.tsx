import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SessionHistoryProvider } from "@/contexts/SessionHistoryContext";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quantum VRM - Next-Gen AI Avatar System",
  description: "Experience the future of AI interaction with Quantum VRM. Real-time voice chat, emotional intelligence, and stunning 3D avatars.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <SessionHistoryProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </SessionHistoryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
