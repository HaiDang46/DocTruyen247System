"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ReaderToolbar } from "@/components/reader/reader-toolbar";
import {
  stories as mockStories,
  chapters as mockChapters,
} from "@/lib/mock-data";
import {
  isDbConnected,
  getStoriesDb,
  getChaptersDb,
  saveReadingHistoryDb,
} from "@/lib/actions";
import { useAuth } from "@/lib/auth-context";

function NovelReaderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const storyId = searchParams.get("storyId");
  const chapterId = searchParams.get("chapterId");

  const { user } = useAuth();

  const [stories, setStories] = useState(mockStories);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);

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
            setChapters(allChaps.filter((c) => c.storyId === storyId));
          } catch (e) {}
        } else {
          setChapters(
            mockChapters
              .map((c) => ({ ...c, storyId: "story-1" }))
              .filter((c) => c.storyId === storyId),
          );
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

  const story = stories.find((s) => s.id === storyId);

  if (!story || !currentChapter) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-bold text-subtle">
          Đang tải nội dung đọc...
        </p>
      </div>
    );
  }

  // Find sorted chapters to handle Prev/Next buttons
  const sortedChaps = [...chapters].sort((a, b) => a.number - b.number);
  const currentIndex = sortedChaps.findIndex((c) => c.id === currentChapter.id);
  const prevChapter = currentIndex > 0 ? sortedChaps[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < sortedChaps.length - 1
      ? sortedChaps[currentIndex + 1]
      : null;

  const navigateToChapter = (id) => {
    router.push(`/read/novel?storyId=${storyId}&chapterId=${id}`);
  };

  const paragraphs = currentChapter.content
    ? currentChapter.content.split("\n").filter((p) => p.trim())
    : ["Chương này chưa có nội dung chữ."];

  return (
    <div className="pb-24">
      <ReaderToolbar mode="novel" />

      <article className="mx-auto max-w-3xl px-5 pb-16 pt-8 md:pt-12">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase text-primary">
            Chương {currentChapter.number}
          </p>
          <h1 className="mt-2 text-2xl font-black md:text-4xl">
            {currentChapter.title}
          </h1>
          <p className="mt-2 text-sm text-subtle">{story.title}</p>
        </div>

        <div className="reader-sheet reader-copy whitespace-pre-line leading-8 space-y-4">
          {paragraphs.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </article>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2">
          <button
            disabled={!prevChapter}
            onClick={() => prevChapter && navigateToChapter(prevChapter.id)}
            className="rounded-lg border border-line px-3 py-3 text-sm font-bold text-subtle disabled:opacity-40"
          >
            Trước
          </button>
          <button
            onClick={() => router.push(`/stories/${story.slug}`)}
            className="rounded-lg border border-line px-3 py-3 text-sm font-bold text-ink"
          >
            Chi tiết
          </button>
          <button
            disabled={!nextChapter}
            onClick={() => nextChapter && navigateToChapter(nextChapter.id)}
            className="rounded-lg bg-primary px-3 py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            Sau
          </button>
        </div>
      </nav>
    </div>
  );
}

export default function NovelReaderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <p className="text-sm font-bold text-subtle">Đang tải...</p>
        </div>
      }
    >
      <NovelReaderContent />
    </Suspense>
  );
}
