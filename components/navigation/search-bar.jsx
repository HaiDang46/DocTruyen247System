"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isDbConnected, getStoriesDb } from "@/lib/actions";
import { stories as mockStories } from "@/lib/mock-data";

export function SearchBar({
  placeholder = "Tìm truyện manga, tác giả",
  wide = false,
}) {
  const [query, setQuery] = useState("");
  const [stories, setStories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef(null);

  useEffect(() => {
    isDbConnected().then((connected) => {
      if (connected) {
        getStoriesDb().then((res) => {
          if (res.success && res.data) setStories(res.data);
        });
      } else {
        const saved = localStorage.getItem("doc_truyen_stories");
        if (saved) {
          try { setStories(JSON.parse(saved)); } catch (e) {}
        } else {
          setStories(mockStories);
        }
      }
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowDropdown(false);
    if (query.trim()) {
      router.push(`/stories?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/stories`);
    }
  };

  const suggestions = query.trim() ? stories.filter(s => 
    s.title.toLowerCase().includes(query.toLowerCase()) || 
    (s.author && s.author.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 6) : [];

  return (
    <div ref={wrapperRef} className={`relative ${wide ? "w-full" : "mx-auto max-w-xl"}`}>
      <form
        onSubmit={handleSearch}
        className="soft-control flex h-11 items-center gap-2 px-3 w-full"
      >
        <button type="submit" className="text-sm font-black text-subtle hover:text-primary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </button>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          className="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-subtle"
          placeholder={placeholder}
        />
      </form>

      {showDropdown && query.trim() && (
        <div className="absolute top-full left-0 mt-2 w-full z-50 rounded-lg border border-line bg-surface p-2 shadow-lg max-h-[80vh] overflow-y-auto">
          {suggestions.length > 0 ? (
            <div className="flex flex-col gap-1">
              {suggestions.map(story => (
                <Link 
                  key={story.id} 
                  href={`/stories/${story.slug}`} 
                  onClick={() => {
                    setShowDropdown(false);
                    setQuery("");
                  }} 
                  className="flex items-center gap-3 p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded bg-slate-200 shadow-sm">
                    {story.coverUrl ? (
                      <img src={story.coverUrl} alt={story.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className={`h-full w-full ${story.coverClass || "bg-primary"}`} />
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-bold text-ink hover:text-primary transition-colors">{story.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-subtle">
                        {story.status === "Completed" ? "Full" : "Đang ra"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
             <div className="p-3 text-center text-sm text-subtle">
              Không tìm thấy kết quả nào cho &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
