"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ReaderToolbar } from "@/components/reader/reader-toolbar";
import { stories as mockStories, chapters as mockChapters } from "@/lib/mock-data";
import { isDbConnected, getStoriesDb, getChaptersDb, saveReadingHistoryDb } from "@/lib/actions";
import { useAuth } from "@/lib/auth-context";

function MangaReaderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const storyId = searchParams.get("storyId");
  const chapterId = searchParams.get("chapterId");

  const { user } = useAuth();

  const [stories, setStories] = useState(mockStories);
  const [chapters, setChapters] = useState<any[]>([]);
  const [currentChapter, setCurrentChapter] = useState<any>(null);

  useEffect(() => {
    if (user && storyId && currentChapter?.id) {
      isDbConnected().then((connected) => {
        if (connected) {
          saveReadingHistoryDb(user.id, storyId, currentChapter.id);
        }
      });
    }
  }, [user, storyId, currentChapter?.id]);

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
          } catch (e) {}
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!storyId) return;
    isDbConnected().then((connected) => {
      if (connected) {
        getChaptersDb(storyId).then((res) => {
          if (res.success && res.data) {
            setChapters(res.data);
          }
        });
      } else {
        const saved = localStorage.getItem("doc_truyen_chapters");
        if (saved) {
          try {
            const allChaps = JSON.parse(saved);
            setChapters(allChaps.filter((c: any) => c.storyId === storyId));
          } catch (e) {}
        } else {
          setChapters(mockChapters.map(c => ({ ...c, storyId: "story-1" })).filter((c) => c.storyId === storyId));
        }
      }
    });
  }, [storyId]);

  useEffect(() => {
    if (chapters.length > 0) {
      const active = chapterId 
        ? chapters.find((c) => c.id === chapterId) 
        : chapters.sort((a, b) => a.number - b.number)[0];
      setCurrentChapter(active);
    }
  }, [chapters, chapterId]);

  const images = currentChapter?.imageUrls || [];
  const story = stories.find((s) => s.id === storyId);

  if (!story || !currentChapter) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-bold text-subtle">Đang tải manga...</p>
      </div>
    );
  }

  const sortedChaps = [...chapters].sort((a, b) => a.number - b.number);
  const currentIndex = sortedChaps.findIndex((c) => c.id === currentChapter.id);
  const prevChapter = currentIndex > 0 ? sortedChaps[currentIndex - 1] : null;
  const nextChapter = currentIndex < sortedChaps.length - 1 ? sortedChaps[currentIndex + 1] : null;

  const navigateToChapter = (id: string) => {
    router.push(`/read/manga?storyId=${storyId}&chapterId=${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="pb-24">
      <ReaderToolbar mode="manga" />

      <section className="mx-auto max-w-4xl px-0 py-5 sm:px-4">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase text-primary">Tập {currentChapter.number}</p>
          <h1 className="text-xl font-black text-ink">{currentChapter.title}</h1>
        </div>

        {/* Vertical scrolling list of manga images */}
        <div className="mx-auto max-w-2xl flex flex-col items-center gap-1 select-none">
          {images.length > 0 ? (
            images.map((url: string, index: number) => (
              <img
                key={index}
                src={url}
                alt={`Trang ${index + 1}`}
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            ))
          ) : (
            <div className="py-20 text-center text-slate-400">
              <p className="text-sm">Chương này chưa có hình ảnh.</p>
            </div>
          )}
        </div>

        {/* Next/Prev Chapter inline buttons at the bottom of the list */}
        <div className="mt-8 flex justify-center gap-4 px-4">
          {prevChapter && (
            <button
              onClick={() => navigateToChapter(prevChapter.id)}
              className="rounded-lg border border-line bg-surface px-5 py-3 text-sm font-bold text-ink transition hover:border-primary hover:text-primary"
            >
              ← Tập trước
            </button>
          )}
          {nextChapter && (
            <button
              onClick={() => navigateToChapter(nextChapter.id)}
              className="rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary/95"
            >
              Tập tiếp theo →
            </button>
          )}
        </div>
      </section>

      {/* Floating navigation bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2">
          <button 
            disabled={!prevChapter}
            onClick={() => prevChapter && navigateToChapter(prevChapter.id)}
            className="rounded-lg border border-line px-3 py-3 text-sm font-bold text-subtle disabled:opacity-40"
          >
            Tập trước
          </button>
          <button 
            onClick={() => router.push(`/stories/${story.slug}`)}
            className="rounded-lg border border-line px-3 py-3 text-sm font-bold text-ink"
          >
            Chi tiết truyện
          </button>
          <button 
            disabled={!nextChapter}
            onClick={() => nextChapter && navigateToChapter(nextChapter.id)}
            className="rounded-lg bg-primary px-3 py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            Tập sau
          </button>
        </div>
      </nav>
    </div>
  );
}

export default function MangaReaderPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm font-bold text-subtle">Đang tải...</p>
      </div>
    }>
      <MangaReaderContent />
    </Suspense>
  );
}
