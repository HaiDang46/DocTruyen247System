"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { formatStoryType } from "@/lib/display";
import type { Story } from "@/lib/mock-data";

type HeroBannerProps = {
  stories: Story[];
};

export function HeroBanner({ stories }: HeroBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (stories.length === 0) return;

    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % stories.length);
      }, 5000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [stories.length, isPaused]);

  if (stories.length === 0) return null;

  const activeStory = stories[activeIndex];
  
  // Setup background style
  const backgroundStyle = activeStory.coverUrl
    ? { backgroundImage: `url(${activeStory.coverUrl})` }
    : undefined;

  return (
    <section 
      className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-lg min-h-[480px] lg:min-h-[550px] flex items-center group transition duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image / Gradient */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out scale-105 group-hover:scale-100 ${activeStory.coverUrl ? "" : activeStory.coverClass}`}
        style={backgroundStyle}
      />
      
      {/* Dark overlay gradients for readable text */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/20" />

      {/* Main content area */}
      <div className="relative z-10 w-full px-6 py-10 md:px-12 lg:px-16 flex flex-col justify-between min-h-[480px] lg:min-h-[550px]">
        
        {/* Top Spacer or Tagline */}
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/25 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary">
            🔥 Đang Thịnh Hành
          </span>
        </div>

        {/* Mid area: Details */}
        <div className="max-w-2xl space-y-4 my-auto">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-white/90">
            <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-black uppercase text-white">
              TOP 10
            </span>
            <span>•</span>
            <span>2026</span>
            <span>•</span>
            <span className="rounded border border-white/20 bg-white/10 px-2 py-0.5 uppercase tracking-wide text-white">
              {formatStoryType(activeStory.type)}
            </span>
            <span>•</span>
            <span className="text-primary font-black uppercase">
              {activeStory.status === "Ongoing" ? "Đang Ra" : activeStory.status === "Completed" ? "Hoàn Thành" : "Tạm Ngưng"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl drop-shadow-md line-clamp-2 transition-all">
            {activeStory.title}
          </h1>

          {/* Genres/Tags */}
          <div className="flex flex-wrap gap-1.5">
            {activeStory.tags.map((tag) => (
              <span 
                key={tag} 
                className="rounded-full bg-white/10 hover:bg-white/20 px-3 py-0.5 text-[11px] font-semibold text-white/90 cursor-pointer transition"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed text-white/80 drop-shadow line-clamp-3 md:text-base max-w-xl">
            {activeStory.description || "Chưa có tóm tắt chi tiết cho truyện này."}
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={`/stories/${activeStory.slug}`}
              className="flex items-center gap-2 rounded-xl bg-primary hover:bg-primary/90 px-6 py-3.5 text-sm font-black text-white shadow-md transition duration-200 hover:-translate-y-[1px]"
            >
              <span className="text-lg">▶</span> Xem Ngay
            </Link>
            
            <button 
              type="button"
              className="flex items-center justify-center rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 h-12 w-12 text-white transition"
              title="Yêu thích"
            >
              ❤️
            </button>
            
            <Link
              href={`/stories/${activeStory.slug}`}
              className="flex items-center justify-center rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 h-12 w-12 text-white font-black transition"
              title="Thông tin chi tiết"
            >
              ℹ️
            </Link>
          </div>
        </div>

        {/* Bottom area: Thumbnail Navigation */}
        <div className="flex justify-start md:justify-end items-center gap-3 mt-4 overflow-x-auto pb-2 no-scrollbar">
          {stories.map((story, index) => {
            const isActive = index === activeIndex;
            const thumbStyle = story.coverUrl
              ? { backgroundImage: `url(${story.coverUrl})` }
              : undefined;

            return (
              <button
                key={story.id}
                onClick={() => setActiveIndex(index)}
                className={`relative flex-shrink-0 h-14 w-24 rounded-lg overflow-hidden border bg-cover bg-center transition-all duration-300 text-left shadow-sm ${
                  isActive 
                    ? "border-primary ring-2 ring-primary/40 scale-105" 
                    : "border-white/10 opacity-60 hover:opacity-100 hover:scale-102"
                }`}
                style={thumbStyle}
              >
                {!story.coverUrl && (
                  <div className={`absolute inset-0 ${story.coverClass}`} />
                )}
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-x-0 bottom-0 p-1">
                  <p className="truncate text-[8px] font-black text-white">
                    {story.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
