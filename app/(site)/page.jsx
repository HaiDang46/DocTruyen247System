"use client";

import { useEffect, useState } from "react";
import { RecommendedStories } from "@/components/sections/recommended-stories";
import { LeaderboardSidebar } from "@/components/sections/leaderboard-sidebar";
import { StoryGrid } from "@/components/story/story-grid";
import { isDbConnected, getStoriesDb } from "@/lib/actions";

export default function HomePage() {
  const [stories, setStories] = useState([]);

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
    <div className="flex flex-col gap-6">
      <div className="w-full">
        <RecommendedStories stories={stories} />

        <div className="mb-4 flex items-center justify-between border-b-2 border-netpurple pb-2">
          <h2 className="text-xl font-bold text-[#2980b9] dark:text-blue-400">
            NetTruyen - Truyện gì cũng có! <span className="text-sm font-normal text-gray-500">&gt;</span>
          </h2>
          <button className="text-netyellow hover:text-orange-500 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          </button>
        </div>

        <StoryGrid stories={stories} />
      </div>
    </div>
  );
}
