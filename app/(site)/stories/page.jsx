"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FilterSidebar } from "@/components/filters/filter-sidebar";
import { SearchBar } from "@/components/navigation/search-bar";
import { SectionHeader } from "@/components/sections/section-header";
import { StoryGrid } from "@/components/story/story-grid";
import { stories as mockStories } from "@/lib/mock-data";
import { isDbConnected, getStoriesDb } from "@/lib/actions";

function StoryListContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [stories, setStories] = useState(mockStories);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [activeType, setActiveType] = useState("Tất cả");
  const [activeStatus, setActiveStatus] = useState("Tất cả");
  const [sortOption, setSortOption] = useState("Mới cập nhật");

  useEffect(() => {
    isDbConnected().then((connected) => {
      if (connected) {
        getStoriesDb().then((res) => {
          if (res.success && res.data) {
            setStories(res.data);
          }
        });
      } else {
        const saved = localStorage.getItem("doc_truyen_stories");
        if (saved) {
          try {
            setStories(JSON.parse(saved));
          } catch (e) {
            console.error(e);
          }
        }
      }
    });
  }, []);

  const filteredStories = [...stories].filter((story) => {
    if (activeCategory !== "Tất cả" && !story.tags.includes(activeCategory)) return false;
    
    if (activeType !== "Tất cả") {
      if (activeType.toLowerCase() !== "manga") return false;
    }
    
    if (activeStatus !== "Tất cả") {
      let mappedStatus = "";
      if (activeStatus === "Đang ra") mappedStatus = "Ongoing";
      else if (activeStatus === "Hoàn thành") mappedStatus = "Completed";
      else if (activeStatus === "Tạm ngưng") mappedStatus = "Hiatus";
      
      // Some mock data has lowercase status or different formats, ensure comparison is robust
      if (story.status.toLowerCase() !== mappedStatus.toLowerCase() && story.status !== activeStatus) return false;
    }
    
    if (q) {
      const lowerQ = q.toLowerCase();
      const matchTitle = story.title.toLowerCase().includes(lowerQ);
      const matchAuthor = story.author?.toLowerCase().includes(lowerQ);
      const matchTags = story.tags?.some(t => t.toLowerCase().includes(lowerQ));
      if (!matchTitle && !matchAuthor && !matchTags) return false;
    }

    return true;
  });

  if (sortOption === "Đánh giá cao") {
    filteredStories.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortOption === "Xem nhiều nhất") {
    filteredStories.sort((a, b) => Number(b.views || 0) - Number(a.views || 0));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <FilterSidebar 
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        activeType={activeType}
        setActiveType={setActiveType}
        activeStatus={activeStatus}
        setActiveStatus={setActiveStatus}
        sortOption={sortOption}
        setSortOption={setSortOption}
      />

      <section className="space-y-5">
        <div className="rounded-lg border border-line bg-surface p-4 shadow-soft">
          <SectionHeader
            title="Thư viện truyện"
            action={`${filteredStories.length} truyện`}
          />
          <div className="mt-4">
            <SearchBar placeholder="Tìm tên truyện, tác giả, thể loại" wide />
          </div>
        </div>

        <StoryGrid stories={filteredStories} />

        <div className="flex items-center justify-center gap-2 pb-3">
          {["1", "2", "3"].map((page, index) => (
            <button
              key={page}
              className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-semibold transition-colors ${
                index === 0
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-600 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {page}
            </button>
          ))}
          <button className="flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-blue-600 transition-colors hover:border-blue-600 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-800">
            Cuộn vô hạn
          </button>
        </div>
      </section>
    </div>
  );
}

export default function StoryListPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-subtle">Đang tải...</div>}>
      <StoryListContent />
    </Suspense>
  );
}
