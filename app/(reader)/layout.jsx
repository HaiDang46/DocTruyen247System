import { AuthProvider } from "@/lib/auth-context";

export default function ReaderLayout({ children }) {
  return (
    <AuthProvider>
      <main className="min-h-screen bg-canvas text-ink">{children}</main>
    </AuthProvider>
  );
}
