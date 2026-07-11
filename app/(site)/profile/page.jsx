"use client";

import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/progress-bar";
import { SectionHeader } from "@/components/sections/section-header";
import { StoryCover } from "@/components/story/story-cover";
import { profileItems as mockProfileItems } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { isDbConnected, getReadingHistoryDb, getFavoritesDb, getFollowsDb, getStoriesDb } from "@/lib/actions";
import { stories as mockStories } from "@/lib/mock-data";
import Link from "next/link";

const tabs = ["Lịch sử đọc", "Yêu thích", "Đang theo dõi"];

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [items, setItems] = useState([]);
  useEffect(() => {
    async function loadData() {
      const connected = await isDbConnected();

      if (activeTab === 0) {
        // Lịch sử đọc
        if (user && connected) {
          const res = await getReadingHistoryDb(user.id);
          if (res.success && res.data) {
            setItems(res.data);
          }
        } else {
          setItems(mockProfileItems);
        }
      } else if (activeTab === 1 || activeTab === 2) {
        // Yêu thích hoặc Đang theo dõi
        if (user && connected) {
          const fetchFn = activeTab === 1 ? getFavoritesDb : getFollowsDb;
          const res = await fetchFn(user.id);
          if (res.success && res.data) {
            setItems(res.data.map(story => ({ story }))); // map to { story } format for rendering
          }
        } else {
          // LocalStorage fallback
          const storageKey = activeTab === 1 ? "doc_truyen_favorites" : "doc_truyen_follows";
          const ids = JSON.parse(localStorage.getItem(storageKey) || "[]");
          
          let allStories = mockStories;
          if (connected) {
            const storiesRes = await getStoriesDb();
            if (storiesRes.success && storiesRes.data) {
              allStories = storiesRes.data;
            }
          } else {
             const savedStories = localStorage.getItem("doc_truyen_stories");
             if (savedStories) {
               try { allStories = JSON.parse(savedStories); } catch(e){}
             }
          }
          
          const filtered = allStories.filter(s => ids.includes(s.id)).map(story => ({ story }));
          setItems(filtered);
        }
      }
    }
    loadData();
  }, [user, activeTab]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-surface p-5 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primarySoft text-xl font-black text-primary uppercase">
              {user ? user.name.charAt(0) : "DT"}
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink">
                {user ? user.name : "Độc giả ẩn danh"}
              </h1>
              <p className="mt-1 text-sm text-subtle">
                {user ? user.email : "Đăng nhập để theo dõi và đồng bộ truyện"}
              </p>
            </div>
          </div>
          {user && (
            <div className="rounded-lg border border-line px-4 py-2 text-xs font-bold text-ink bg-muted/30">
              Vai trò: {user.role === 99 ? "Quản trị viên" : "Độc giả"}
            </div>
          )}
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActiveTab(index)}
            className={`whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-bold transition ${
              index === activeTab
                ? "border-primary bg-primary text-white"
                : "border-line bg-surface text-subtle hover:border-primary hover:text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="rounded-lg border border-line bg-surface p-4 shadow-soft">
        <SectionHeader
          title={tabs[activeTab]}
          action={`${items.length} bộ truyện`}
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {items.length > 0 ? (
            items.map((item) => (
              <Link
                href={`/stories/${item.story.slug}`}
                key={item.story.id}
                className="grid grid-cols-[88px_1fr] gap-3 rounded-lg border border-line bg-canvas p-3 transition hover:border-primary group cursor-pointer"
              >
                <StoryCover story={item.story} compact />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-ink">
                    {item.story.title}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-subtle">
                    Đang xem: {item.chapter}
                  </p>
                  {activeTab === 0 && item.chapter && (
                    <div className="mt-4">
                      <ProgressBar value={item.progress || 0} />
                    </div>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <p className="col-span-2 py-12 text-sm text-subtle text-center">
              Danh sách trống. Hãy khám phá và thêm truyện vào danh sách nhé!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
