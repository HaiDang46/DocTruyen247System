import Link from "next/link";
import { RatingStars } from "@/components/rating-stars";
import { StoryCover } from "@/components/story/story-cover";
import { TagBadge } from "@/components/tag-badge";
import type { Story } from "@/lib/mock-data";

type HeroBannerProps = {
  stories: Story[];
};

export function HeroBanner({ stories }: HeroBannerProps) {
  const [featured, ...queue] = stories;

  return (
    <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-soft">
      <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
        <div className="p-5 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <TagBadge tone="blue">ALL</TagBadge>
            <TagBadge>{featured.latestChapter}</TagBadge>
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-black text-ink md:text-6xl">
            {featured.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-subtle md:text-base">
            {featured.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <RatingStars rating={featured.rating} />
            <span className="text-sm font-bold text-subtle">
              {featured.views} views
            </span>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={`/stories/${featured.slug}`}
              className="rounded-lg bg-primary px-5 py-3 text-sm font-black text-white transition hover:translate-y-[-1px]"
            >
              Read Now
            </Link>
            <Link
              href="/stories"
              className="rounded-lg border border-line bg-canvas px-5 py-3 text-sm font-black text-ink transition hover:border-primary hover:text-primary"
            >
              Browse Library
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_120px] gap-3 bg-muted p-5 md:p-6">
          <StoryCover story={featured} priority />
          <div className="grid gap-3">
            {queue.map((story) => (
              <StoryCover key={story.id} story={story} compact />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
