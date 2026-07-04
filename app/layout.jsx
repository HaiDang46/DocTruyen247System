import "./globals.css";

export const metadata = {
  title: "DocTruyen247",
  description: "Giao diện đọc truyện chữ và manga hiện đại.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
