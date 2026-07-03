export default function ReaderLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="min-h-screen bg-canvas text-ink">{children}</main>;
}
