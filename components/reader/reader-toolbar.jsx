"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function ReaderToolbar({ mode, imageSize, setImageSize }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY - 10) { // scrolling up
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY + 10) { // scrolling down
        setIsVisible(false);
      }
      
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 group pointer-events-none">
      {/* Invisible hover area */}
      <div className="absolute inset-x-0 top-0 h-8 pointer-events-auto" />
      
      <header 
        className={`relative pointer-events-auto border-b border-line bg-surface/95 px-4 py-3 backdrop-blur transition-transform duration-300 ${
          isVisible ? "translate-y-0 shadow-sm" : "-translate-y-full group-hover:translate-y-0 group-hover:shadow-sm"
        }`}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
          <Link href="/" className="text-sm font-black text-primary">
            DocTruyen247
          </Link>
          <span className="rounded-lg bg-muted px-2 py-1 text-xs font-bold uppercase text-subtle">
            {mode === "novel" ? "truyện chữ" : "manga"}
          </span>
          <div className="ml-auto flex min-w-0 items-center gap-2">
            {mode === "novel" ? (
              <>
                <label className="hidden items-center gap-2 text-xs font-bold text-subtle sm:flex">
                  Cỡ chữ
                  <input className="w-28 accent-blue-600" type="range" />
                </label>
                <div className="flex rounded-lg border border-line bg-canvas p-1">
                  {["Sáng", "Tối", "Sepia"].map((theme, index) => (
                    <button
                      key={theme}
                      className={`rounded-lg px-2 py-1 text-xs font-bold ${
                        index === 0
                          ? "bg-primary text-white"
                          : "text-subtle hover:text-ink"
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex rounded-lg border border-line bg-canvas p-1">
                {["Vừa màn", "Rộng", "Phóng to"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setImageSize && setImageSize(item)}
                    className={`rounded-lg px-2 py-1 text-xs font-bold transition-colors ${
                      item === imageSize
                        ? "bg-primary text-white shadow-sm"
                        : "text-subtle hover:text-ink hover:bg-muted/50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
