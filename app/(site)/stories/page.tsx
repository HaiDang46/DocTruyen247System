"use client";

import { useEffect, useState } from "react";
import { FilterSidebar } from "@/components/filters/filter-sidebar";
import { SearchBar } from "@/components/navigation/search-bar";
import { SectionHeader } from "@/components/sections/section-header";
import { StoryGrid } from "@/components/story/story-grid";
import { stories as mockStories, type Story } from "@/lib/mock-data";
import { isDbConnected, getStoriesDb } from "@/lib/actions";

export default function StoryListPage() {
  const [stories, setStories] = useState<Story[]>(mockStories);

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

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <FilterSidebar />

      <section className="space-y-5">
        <div className="rounded-lg border border-line bg-surface p-4 shadow-soft">
          <SectionHeader title="Thư viện truyện" action={`${stories.length} truyện`} />
          <div className="mt-4">
            <SearchBar placeholder="Tìm tên truyện, tác giả, thể loại" wide />
          </div>
        </div>

        <StoryGrid stories={stories} />

        <div className="flex items-center justify-center gap-2 pb-3">
          {["1", "2", "3"].map((page, index) => (
            <button
              key={page}
              className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-semibold transition hover:border-primary hover:text-primary ${
                index === 0
                  ? "border-primary bg-primary text-white"
                  : "border-line bg-surface text-subtle"
              }`}
            >
              {page}
            </button>
          ))}
          <button className="h-10 rounded-lg border border-line bg-surface px-4 text-sm font-semibold text-subtle transition hover:border-primary hover:text-primary">
            Cuộn vô hạn
          </button>
        </div>
      </section>
    </div>
  );
}

