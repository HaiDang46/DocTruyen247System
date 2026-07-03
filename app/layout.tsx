import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocTruyen247 UI",
  description: "Modern UI skeleton for novel and comic reading experiences."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
