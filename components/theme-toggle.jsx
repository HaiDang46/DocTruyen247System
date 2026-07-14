"use client";

import { useEffect, useState, useRef } from "react";

const themes = [
  { id: "light", label: "Light", icon: "☀️" },
  { id: "sepia", label: "Sepia", icon: "📖" },
  { id: "dark", label: "Dark", icon: "🌙" }
];

export function ThemeToggle() {
  const [theme, setTheme] = useState("light");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Apply theme
    const root = document.documentElement;
    root.classList.remove("light", "dark", "sepia");
    
    if (theme !== "light") {
      root.classList.add(theme);
    }
    
    // For color-scheme support in dark mode
    if (theme === "dark") {
      root.classList.add("dark");
    }
  }, [theme]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeTheme = themes.find(t => t.id === theme) || themes[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 items-center gap-2 rounded-lg border border-line bg-canvas px-3 text-xs font-black text-ink transition hover:border-primary hover:text-primary shadow-sm"
        title="Đổi giao diện"
      >
        <span className="text-sm">{activeTheme.icon}</span>
        <span className="hidden sm:inline">{activeTheme.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl border border-line bg-surface p-1.5 shadow-xl z-50">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold transition ${
                theme === t.id 
                  ? "bg-primary/10 text-primary" 
                  : "text-ink hover:bg-muted"
              }`}
            >
              <span className="text-sm">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
