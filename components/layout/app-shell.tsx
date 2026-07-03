import Link from "next/link";
import { SearchBar } from "@/components/navigation/search-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { ActiveLink } from "./active-link";

const tabs = [
  { label: "TẤT CẢ", href: "/stories" },
  { label: "TRUYỆN CHỮ", href: "/stories?type=novel" },
  { label: "MANGA", href: "/stories?type=manga" }
];

const sidebar = [
  { label: "Trang chủ", href: "/" },
  { label: "Thư viện", href: "/stories" },
  { label: "Đọc chữ", href: "/read/novel" },
  { label: "Đọc manga", href: "/read/manga" },
  { label: "Hồ sơ", href: "/profile" },
  { label: "Quản trị", href: "/admin" }
];

const bottomNavItems = [
  {
    label: "Trang chủ",
    href: "/",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mx-auto">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    )
  },
  {
    label: "Thư viện",
    href: "/stories",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mx-auto">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    )
  },
  {
    label: "Đọc truyện",
    href: "/read/novel",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mx-auto">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    label: "Quản trị",
    href: "/admin",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mx-auto">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    label: "Cá nhân",
    href: "/profile",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mx-auto">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    )
  }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-frame">
      <header className="top-nav">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4">
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
            {tabs.map((tab) => (
              <ActiveLink
                key={tab.label}
                href={tab.href}
                checkQuery
                className="rounded-lg px-3 py-2 text-xs font-black transition text-subtle hover:text-ink"
                activeClassName="!bg-surface !text-primary shadow-sm"
              >
                {tab.label}
              </ActiveLink>
            ))}
          </nav>

          <ThemeToggle />
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-xs font-black text-subtle"
          >
            TÔI
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-6 px-4 pb-24 pt-20 lg:grid-cols-[220px_1fr] lg:pb-8">
        <aside className="surface-panel hidden p-3 lg:sticky lg:top-24 lg:block lg:self-start">
          <nav className="space-y-1">
            {sidebar.map((item) => (
              <ActiveLink
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm font-bold transition text-subtle hover:bg-muted hover:text-ink"
                activeClassName="!bg-primary !text-white"
              >
                {item.label}
              </ActiveLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 px-2 py-1.5 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {bottomNavItems.map((item) => (
            <ActiveLink
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center rounded-lg py-1.5 text-center text-[10px] font-bold text-subtle transition hover:bg-muted hover:text-ink"
              activeClassName="!text-primary"
            >
              {item.icon}
              <span className="mt-1">{item.label}</span>
            </ActiveLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
