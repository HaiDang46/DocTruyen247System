"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export function RecommendedStories({ stories }) {
  const scrollRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    
    const scrollInterval = setInterval(() => {
      if (!isHovering) {
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: 200, behavior: 'smooth' });
        }
      }
    }, 3000);

    return () => clearInterval(scrollInterval);
  }, [isHovering]);

  if (!stories || stories.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-medium text-[#2980b9] dark:text-blue-400 hover:text-netred transition">
          <Link href="/stories">Truyện đề cử <span className="text-sm">&gt;</span></Link>
        </h2>
      </div>
      
      <div 
        ref={scrollRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 scroll-smooth"
      >
        {stories.slice(0, 10).map((story) => (
          <Link key={story.id} href={`/stories/${story.slug}`} className="group relative block flex-none w-[160px] sm:w-[180px] md:w-[190px] overflow-hidden rounded border border-gray-200 dark:border-gray-700 shadow-sm snap-start">
            <div className="aspect-[3/4] relative w-full bg-gray-100 dark:bg-gray-800">
              {story.coverImage ? (
                <img 
                  src={story.coverImage} 
                  alt={story.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className={`w-full h-full ${story.coverClass || 'bg-gradient-to-br from-gray-700 to-gray-900'} transition-transform duration-300 group-hover:scale-110`}></div>
              )}
            </div>
            {/* Dark overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/75 px-2 py-1.5 text-white backdrop-blur-sm">
              <h3 className="truncate text-sm font-bold shadow-sm">{story.title}</h3>
              <div className="mt-0.5 flex items-center justify-between text-[11px] font-semibold text-gray-200">
                <span>{story.latestChapter || 'Chapter 1'}</span>
                <span>{story.timeAgo || 'Vừa xong'}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
