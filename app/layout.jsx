import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "900"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "DocTruyen247",
  description: "Giao diện đọc truyện tranh (manga) hiện đại.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${inter.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased">{children}</body>
    </html>
  );
}
