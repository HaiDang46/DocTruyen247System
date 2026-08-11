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
    if (activeCategory !== "Tất cả" && !story.tags?.some(tag => tag.toLowerCase() === activeCategory.toLowerCase())) return false;
    
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

      <section className="space-y-4">
        {/* Header equivalent to the NetTruyen style */}
        <div className="flex items-center justify-between border-b-2 border-netpurple pb-2 mb-2">
           <h2 className="text-xl font-bold text-[#2980b9] dark:text-blue-400">
            NetTruyen - Tìm truyện <span className="text-sm font-normal text-gray-500">&gt;</span>
          </h2>
          <span className="text-xs text-gray-500 font-bold hidden sm:block">
            {filteredStories.length} truyện
          </span>
        </div>

        {/* Story Grid */}
        <StoryGrid stories={filteredStories} />

        {/* Pagination - Square, netred active */}
        <div className="mt-8 flex items-center justify-center gap-1.5 pb-4">
          {["1", "2", "3", "4", "5"].map((page, index) => (
            <button
              key={page}
              className={`flex h-8 w-8 items-center justify-center border text-[13px] font-bold transition-colors rounded-sm ${
                index === 0
                  ? "border-netred bg-netred text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-netred hover:text-netred dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
          <button className="flex h-8 px-3 items-center justify-center border border-gray-300 bg-white text-[13px] font-bold text-gray-700 transition-colors hover:border-netred hover:text-netred rounded-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            &gt;
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
