"use client";

import { useState } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/navigation/search-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { ActiveLink } from "./active-link";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";

const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Thư viện", href: "/stories" },
  { label: "Hồ sơ", href: "/profile" },
  { label: "Quản trị", href: "/admin" },
];

const bottomNavItems = [
  {
    label: "Trang chủ",
    href: "/",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-5 h-5 mx-auto"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        />
      </svg>
    ),
  },
  {
    label: "Thư viện",
    href: "/stories",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-5 h-5 mx-auto"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
        />
      </svg>
    ),
  },
  {
    label: "Quản trị",
    href: "/admin",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-5 h-5 mx-auto"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    label: "Cá nhân",
    href: "/profile",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-5 h-5 mx-auto"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    ),
  },
];

export function AppShell({ children }) {
  return (
    <AuthProvider>
      <AppShellContent>{children}</AppShellContent>
    </AuthProvider>
  );
}

function AppShellContent({ children }) {
  const { user, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="app-frame">
      <header className="top-nav">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-black text-white">
                D7
              </span>
              <span className="hidden text-lg font-black text-ink sm:inline">
                DocTruyen247
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {navItems.filter(item => item.href !== "/admin" || (user && user.role === 99)).map((item) => (
                <ActiveLink
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3.5 py-2 text-sm font-bold transition text-subtle hover:text-ink hover:bg-muted"
                  activeClassName="!bg-primary !text-white shadow-sm"
                >
                  {item.label}
                </ActiveLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden w-64 md:block">
              <SearchBar />
            </div>

            <ThemeToggle />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex h-9 items-center gap-2 rounded-lg bg-muted px-3 text-xs font-black text-ink hover:bg-muted/80 transition"
                  type="button"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-[10px] font-black text-white uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline">{user.name}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-line bg-surface p-1.5 shadow-xl z-50">
                    <div className="px-3 py-2 border-b border-line mb-1.5">
                      <p className="text-[10px] text-subtle font-bold uppercase tracking-wider">
                        Tài khoản
                      </p>
                      <p className="text-xs font-bold text-ink truncate mt-0.5">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-subtle truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block rounded-lg px-3 py-2 text-xs font-semibold text-ink hover:bg-muted transition"
                    >
                      Hồ sơ của tôi
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left block rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition mt-1"
                      type="button"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex h-9 items-center justify-center rounded-lg bg-primary hover:bg-primary/95 px-4 text-xs font-black text-white shadow-sm transition hover:-translate-y-[1px]"
                type="button"
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 pb-24 pt-24 lg:pb-8">
        <main className="min-w-0">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 px-2 py-1.5 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
          {bottomNavItems.filter(item => item.href !== "/admin" || (user && user.role === 99)).map((item) => (
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

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
