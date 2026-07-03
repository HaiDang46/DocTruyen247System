import Link from "next/link";
import { SearchBar } from "@/components/navigation/search-bar";
import { ThemeToggle } from "@/components/theme-toggle";

const tabs = [
  { label: "ALL", href: "/stories" },
  { label: "NOVEL", href: "/stories?type=novel" },
  { label: "MANGA", href: "/stories?type=manga" }
];

const sidebar = [
  { label: "Home", href: "/" },
  { label: "Library", href: "/stories" },
  { label: "Novel Reader", href: "/read/novel" },
  { label: "Manga Reader", href: "/read/manga" },
  { label: "Profile", href: "/profile" },
  { label: "Admin", href: "/admin" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-frame">
      <header className="top-nav">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-black text-white">
              D7
            </span>
            <span className="hidden text-lg font-black text-ink sm:inline">
              DocTruyen247
            </span>
          </Link>

          <div className="hidden flex-1 md:block">
            <SearchBar />
          </div>

          <nav className="hidden items-center rounded-lg bg-muted p-1 lg:flex">
            {tabs.map((tab, index) => (
              <Link
                key={tab.label}
                href={tab.href}
                className={`rounded-lg px-3 py-2 text-xs font-black transition ${
                  index === 0
                    ? "bg-surface text-primary shadow-sm"
                    : "text-subtle hover:text-ink"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>

          <ThemeToggle />
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-xs font-black text-subtle"
          >
            ME
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 pb-24 pt-20 lg:grid-cols-[220px_1fr] lg:pb-8">
        <aside className="surface-panel hidden p-3 lg:sticky lg:top-24 lg:block lg:self-start">
          <nav className="space-y-1">
            {sidebar.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm font-bold transition ${
                  index === 0
                    ? "bg-primary text-white"
                    : "text-subtle hover:bg-muted hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 px-3 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
          {sidebar.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-2 py-2 text-center text-xs font-bold text-subtle transition hover:bg-muted hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
