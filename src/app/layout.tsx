import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/components/layout/QueryProvider";
import { SessionProvider } from "@/components/layout/SessionProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Engage — Internal Audit Management",
  description: "Internal Audit Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} antialiased`}>
        <SessionProvider>
          <QueryProvider>{children}</QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
