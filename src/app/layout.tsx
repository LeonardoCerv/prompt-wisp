import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { NavbarProvider } from '@/context/navbarContext'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prompt Wisp",
  description: "A management tool for your AI prompts",
  icons: {
    icon: '/wisp.svg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark flex min-h-screen flex-col`}
      >
        <NavbarProvider>
          {children}
        </NavbarProvider>
        <Toaster />
      </body>
    </html>
  );
}
