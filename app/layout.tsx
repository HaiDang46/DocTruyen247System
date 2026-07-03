import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocTruyen247",
  description: "Giao diện đọc truyện chữ và manga hiện đại."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
