"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ChapterListItem } from "@/components/chapter/chapter-list-item";
import { ModeSwitchToggle } from "@/components/mode-switch-toggle";
import { RatingStars } from "@/components/rating-stars";
import { SectionHeader } from "@/components/sections/section-header";
import { StoryCover } from "@/components/story/story-cover";
import { TagBadge } from "@/components/tag-badge";
import { formatStoryStatus, formatStoryType } from "@/lib/display";
import { chapters as mockChapters, episodes, stories as mockStories } from "@/lib/mock-data";
import { isDbConnected, getStoriesDb, getChaptersDb } from "@/lib/actions";

type StoryDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default function StoryDetailPage({ params }: StoryDetailPageProps) {
  const { slug } = use(params);
  
  const [stories, setStories] = useState(mockStories);
  const [chapters, setChapters] = useState<any[]>([]);

  useEffect(() => {
    isDbConnected().then((connected) => {
      if (connected) {
        getStoriesDb().then((res) => {
          if (res.success && res.data) {
            setStories(res.data);
            const foundStory = res.data.find((item) => item.slug === slug);
            if (foundStory) {
              getChaptersDb(foundStory.id).then((chapRes) => {
                if (chapRes.success && chapRes.data) {
                  setChapters(chapRes.data);
                }
              });
            }
          }
        });
      } else {
        const savedStories = localStorage.getItem("doc_truyen_stories");
        if (savedStories) {
          try {
            setStories(JSON.parse(savedStories));
          } catch (e) {
            console.error(e);
          }
        }

        const savedChapters = localStorage.getItem("doc_truyen_chapters");
        if (savedChapters) {
          try {
            setChapters(JSON.parse(savedChapters));
          } catch (e) {
            console.error(e);
          }
        } else {
          setChapters(mockChapters.map(c => ({ ...c, storyId: "story-1" }))); // Fallback for default stories
        }
      }
    });
  }, [slug]);

  const story = stories.find((item) => item.slug === slug) ?? stories[0];

  // Filter chapters belonging to this story
  const storyChapters = chapters.filter(c => c.storyId === story.id).sort((a, b) => b.number - a.number);

  return (
    <div className="space-y-8">
      {story && (
        <>
          <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <div className="space-y-4">
              <StoryCover story={story} priority />
              <div className="grid grid-cols-3 gap-2">
                <Link
                  href={
                    storyChapters.length > 0
                      ? `/read/${story.type.toLowerCase()}?storyId=${story.id}&chapterId=${storyChapters[storyChapters.length - 1].id}`
                      : `/read/${story.type.toLowerCase()}?storyId=${story.id}`
                  }
                  className="button-primary col-span-3 text-center block"
                >
                  Đọc ngay
                </Link>
                <button className="button-ghost">Theo dõi</button>
                <button className="button-ghost">Yêu thích</button>
                <button className="button-ghost">Chia sẻ</button>
                {story.sourceUrl ? (
                  <a
                    href={story.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="button-ghost col-span-3 text-center"
                  >
                    Mở link nguồn
                  </a>
                ) : null}
              </div>
            </div>

            <div className="rounded-lg border border-line bg-surface p-5 shadow-soft">
              <div className="flex flex-wrap items-center gap-2">
                <TagBadge tone={story.type === "NOVEL" ? "blue" : "violet"}>
                  {formatStoryType(story.type)}
                </TagBadge>
                <TagBadge>{formatStoryStatus(story.status)}</TagBadge>
              </div>

              <h1 className="mt-4 text-3xl font-black text-ink md:text-5xl">
                {story.title}
              </h1>
              <p className="mt-2 text-sm font-semibold text-subtle">
                bởi {story.author}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <RatingStars rating={story.rating} />
                <span className="text-sm font-semibold text-subtle">
                  {story.views} lượt xem
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {story.tags.map((tag) => (
                  <TagBadge key={tag}>{tag}</TagBadge>
                ))}
              </div>

              <details className="mt-6 rounded-lg border border-line bg-muted/60 p-4 open:bg-muted" open>
                <summary className="cursor-pointer text-sm font-bold text-ink">
                  Giới thiệu
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-subtle whitespace-pre-line">
                  {story.description}
                </p>
                {story.sourceUrl ? (
                  <a
                    href={story.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex text-sm font-bold text-primary hover:underline"
                  >
                    Xem truyện tại nguồn
                  </a>
                ) : null}
              </details>
            </div>
          </section>

          <section className="space-y-4">
            <ModeSwitchToggle active={story.type} />
            <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
              <div className="rounded-lg border border-line bg-surface p-4 shadow-soft">
                <SectionHeader title="Danh sách chương" action={`${storyChapters.length} chương`} />
                <div className="mt-4 divide-y divide-line">
                  {storyChapters.length > 0 ? (
                    storyChapters.map((chapter) => (
                      <Link
                        key={chapter.id}
                        href={`/read/${story.type.toLowerCase()}?storyId=${story.id}&chapterId=${chapter.id}`}
                        className="block hover:bg-muted/40 transition px-2 rounded-lg"
                      >
                        <ChapterListItem chapter={chapter} />
                      </Link>
                    ))
                  ) : (
                    <p className="py-6 text-sm text-subtle text-center">Truyện chưa có chương nào.</p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-line bg-surface p-4 shadow-soft">
                <SectionHeader title="Danh sách tập manga" action="Dạng lưới" />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {story.type === "MANGA" && storyChapters.length > 0 ? (
                    storyChapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="group overflow-hidden rounded-lg border border-line bg-muted transition hover:-translate-y-1 hover:shadow-soft"
                      >
                        <div className="aspect-[4/3] bg-slate-200 overflow-hidden dark:bg-slate-800 relative">
                          {chapter.imageUrls?.[0] ? (
                            <img src={chapter.imageUrls[0]} alt={chapter.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="h-full rounded-lg border border-white/40 bg-white/40 dark:border-white/10 dark:bg-white/10" />
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-bold text-ink">
                            Tập {chapter.number}
                          </p>
                          <p className="mt-1 truncate text-xs text-subtle">
                            {chapter.title}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    episodes.map((episode) => (
                      <div
                        key={episode.id}
                        className="group overflow-hidden rounded-lg border border-line bg-muted transition hover:-translate-y-1 hover:shadow-soft"
                      >
                        <div className="aspect-[4/3] bg-slate-200 p-3 dark:bg-slate-800">
                          <div className="h-full rounded-lg border border-white/40 bg-white/40 dark:border-white/10 dark:bg-white/10" />
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-bold text-ink">
                            Tập {episode.number}
                          </p>
                          <p className="mt-1 truncate text-xs text-subtle">
                            {episode.title}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

