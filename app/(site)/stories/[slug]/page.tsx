import { ChapterListItem } from "@/components/chapter/chapter-list-item";
import { ModeSwitchToggle } from "@/components/mode-switch-toggle";
import { RatingStars } from "@/components/rating-stars";
import { SectionHeader } from "@/components/sections/section-header";
import { StoryCover } from "@/components/story/story-cover";
import { TagBadge } from "@/components/tag-badge";
import { chapters, episodes, stories } from "@/lib/mock-data";

type StoryDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function StoryDetailPage({ params }: StoryDetailPageProps) {
  const { slug } = await params;
  const story = stories.find((item) => item.slug === slug) ?? stories[0];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <StoryCover story={story} priority />
          <div className="grid grid-cols-3 gap-2">
            <button className="col-span-3 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:translate-y-[-1px]">
              Read Now
            </button>
            <button className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink transition hover:border-primary">
              Follow
            </button>
            <button className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink transition hover:border-primary">
              Favorite
            </button>
            <button className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink transition hover:border-primary">
              Share
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface p-5 shadow-soft">
          <div className="flex flex-wrap items-center gap-2">
            <TagBadge tone={story.type === "NOVEL" ? "blue" : "violet"}>
              {story.type}
            </TagBadge>
            <TagBadge>{story.status}</TagBadge>
          </div>

          <h1 className="mt-4 text-3xl font-black text-ink md:text-5xl">
            {story.title}
          </h1>
          <p className="mt-2 text-sm font-semibold text-subtle">
            by {story.author}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <RatingStars rating={story.rating} />
            <span className="text-sm font-semibold text-subtle">
              {story.views} views
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {story.tags.map((tag) => (
              <TagBadge key={tag}>{tag}</TagBadge>
            ))}
          </div>

          <details className="mt-6 rounded-lg border border-line bg-muted/60 p-4 open:bg-muted">
            <summary className="cursor-pointer text-sm font-bold text-ink">
              Description
            </summary>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-subtle">
              {story.description}
            </p>
          </details>
        </div>
      </section>

      <section className="space-y-4">
        <ModeSwitchToggle active="NOVEL" />
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="rounded-lg border border-line bg-surface p-4 shadow-soft">
            <SectionHeader title="Novel chapters" action="128 chapters" />
            <div className="mt-4 divide-y divide-line">
              {chapters.map((chapter) => (
                <ChapterListItem key={chapter.id} chapter={chapter} />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface p-4 shadow-soft">
            <SectionHeader title="Comic episodes" action="Grid view" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              {episodes.map((episode) => (
                <div
                  key={episode.id}
                  className="group overflow-hidden rounded-lg border border-line bg-muted transition hover:-translate-y-1 hover:shadow-soft"
                >
                  <div className="aspect-[4/3] bg-slate-200 p-3 dark:bg-slate-800">
                    <div className="h-full rounded-lg border border-white/40 bg-white/40 dark:border-white/10 dark:bg-white/10" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-ink">
                      Episode {episode.number}
                    </p>
                    <p className="mt-1 truncate text-xs text-subtle">
                      {episode.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
