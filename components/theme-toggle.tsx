"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <button
      type="button"
      onClick={() => setDark((value) => !value)}
      className="flex h-9 items-center gap-2 rounded-lg border border-line bg-canvas px-3 text-xs font-black text-subtle transition hover:border-primary hover:text-primary"
      aria-pressed={dark}
    >
      <span className="h-3 w-3 rounded-full bg-current" />
      {dark ? "Dark" : "Light"}
    </button>
  );
}
