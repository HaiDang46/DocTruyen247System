"use client";

import { useState } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/navigation/search-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { ActiveLink } from "./active-link";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";
import Image from "next/image";
import { Footer } from "@/components/layout/footer";

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
    <div className="app-frame flex flex-col min-h-screen">
      {/* Top Header - Dark Purple */}
      <header className="bg-netpurple">
        <div className="mx-auto flex min-h-[80px] max-w-[1200px] items-center justify-between px-4 py-2">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="NetTruyen" 
              width={250} 
              height={60} 
              className="h-[60px] w-auto object-contain"
              priority
            />
          </Link>

          <div className="hidden flex-1 items-center justify-center px-8 md:flex">
            <div className="w-full max-w-lg">
              <SearchBar />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 text-white hover:text-gray-200 transition"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span className="hidden text-sm font-semibold sm:inline">Tài khoản</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded border border-line bg-surface p-1 shadow-xl z-50">
                    <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="block px-3 py-2 text-sm text-ink hover:bg-muted">
                      Hồ sơ của tôi
                    </Link>
                    <button onClick={() => { logout(); setIsDropdownOpen(false); }} className="w-full text-left block px-3 py-2 text-sm text-rose-600 hover:bg-muted">
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="flex items-center gap-2 text-white hover:text-gray-200 transition text-sm font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Sub Header - Navigation */}
      <nav className="bg-[#f1f1f1] border-b border-gray-300 dark:bg-gray-800 dark:border-gray-700">
        <div className="mx-auto flex max-w-[1200px] items-center gap-1 px-4 overflow-x-auto no-scrollbar">
          <Link href="/" className="flex h-10 items-center px-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-300"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </Link>
          {navItems.filter(item => item.href !== "/" && item.href !== "/admin").map(item => (
            <Link key={item.href} href={item.href} className="flex h-10 items-center px-4 text-[15px] font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 transition whitespace-nowrap uppercase">
              {item.label}
            </Link>
          ))}
          {user && user.role === 99 && (
             <Link href="/admin" className="flex h-10 items-center px-4 text-[15px] font-bold text-netred hover:bg-gray-200 dark:hover:bg-gray-700 transition whitespace-nowrap uppercase">
              QUẢN TRỊ
            </Link>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="mx-auto max-w-[1200px] w-full px-4 pt-4 pb-8 flex-grow">
        {/* Alert Banner */}
        <div className="mb-4 flex items-center gap-2 border border-[#48b9ef] bg-white p-2 text-sm text-red-500 dark:bg-gray-800 dark:border-blue-500 dark:text-red-400 rounded-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <span className="font-semibold">Không truy cập web giả mạo để tránh bị hack tài khoản</span>
        </div>

        <main className="min-w-0 bg-white dark:bg-gray-900 shadow-sm p-3 md:p-4 rounded-sm">
          {children}
        </main>
      </div>

      <Footer />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
