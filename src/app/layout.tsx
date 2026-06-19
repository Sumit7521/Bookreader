import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BookReader - Your Digital Library & Writing Workspace",
  description: "A comprehensive digital ecosystem for readers and writers. Read PDFs, annotate text, manage chapters, and export your next novel seamlessly.",
  keywords: ["PDF Reader", "Writing App", "Book Library", "Annotations", "E-reader", "Authors"],
  authors: [{ name: "BookReader Team" }],
  openGraph: {
    title: "BookReader - Your Digital Library & Writing Workspace",
    description: "A comprehensive digital ecosystem for readers and writers.",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

import ActivityTracker from "@/components/activity-tracker";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ActivityTracker />
        {children}
      </body>
    </html>
  );
}
