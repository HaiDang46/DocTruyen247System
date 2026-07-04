import { StoryCard } from "@/components/story/story-card";

export function StoryGrid({ stories, compact = false }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-5">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} compact={compact} />
      ))}
    </div>
  );
}
