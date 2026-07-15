import Link from "next/link";
import { RatingStars } from "@/components/rating-stars";
import { StoryCover } from "@/components/story/story-cover";
import { TagBadge } from "@/components/tag-badge";
import { formatStoryType } from "@/lib/display";

export function StoryCard({ story, compact = false }) {
  return (
    <Link
      href={`/stories/${story.slug}`}
      className="story-card group animate-fade-up"
    >
      <StoryCover story={story} compact={compact} />
      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <TagBadge tone="violet">
            {formatStoryType(story.type)}
          </TagBadge>
          <span className="flex items-center gap-1 text-xs font-bold text-subtle">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {story.views}
          </span>
        </div>
        <h3 className="line-clamp-2 min-h-10 text-sm font-black text-ink">
          {story.title}
        </h3>
        <RatingStars rating={story.rating} />
        <p className="truncate text-xs font-semibold text-subtle">
          {story.latestChapter}
        </p>
      </div>
    </Link>
  );
}
