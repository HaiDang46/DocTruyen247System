import { StoryCard } from "@/components/story/story-card";
import type { Story } from "@/lib/mock-data";

type StoryGridProps = {
  stories: Story[];
  compact?: boolean;
};

export function StoryGrid({ stories, compact = false }: StoryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-5">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} compact={compact} />
      ))}
    </div>
  );
}
