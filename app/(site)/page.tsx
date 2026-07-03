"use client";

import { useEffect, useState } from "react";
import { HeroBanner } from "@/components/sections/hero-banner";
import { SectionHeader } from "@/components/sections/section-header";
import { StoryGrid } from "@/components/story/story-grid";
import { stories as mockStories, type Story } from "@/lib/mock-data";
import { isDbConnected, getStoriesDb } from "@/lib/actions";

export default function HomePage() {
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

  const trending = stories.slice(0, 5);
  const latest = stories.slice(3, 8);
  const novels = stories.filter((story) => story.type === "NOVEL").slice(0, 5);
  const mangas = stories.filter((story) => story.type === "MANGA").slice(0, 5);

  return (
    <div className="space-y-10">
      {trending.length > 0 ? (
        <HeroBanner stories={trending.slice(0, 3)} />
      ) : null}

      <section className="space-y-4">
        <SectionHeader title="Đang thịnh hành" action="Xem tất cả" />
        <StoryGrid stories={trending} />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Mới cập nhật" action="Mới nhất" />
        <StoryGrid stories={latest} compact />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Truyện chữ nổi bật" action="Truyện chữ" />
        <StoryGrid stories={novels} />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Manga nổi bật" action="Manga" />
        <StoryGrid stories={mangas} />
      </section>
    </div>
  );
}

