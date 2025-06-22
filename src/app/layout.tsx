
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

import { createClient } from '../lib/utils/supabase/server';

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
    icon: '/wisplogo.svg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark flex min-h-screen flex-col`}
      >
        <Header user={user} />
        <div className="flex-1">{children}</div>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
