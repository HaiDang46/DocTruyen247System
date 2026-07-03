import type { Story } from "@/lib/mock-data";
import { formatStoryType } from "@/lib/display";

type StoryCoverProps = {
  story: Story;
  compact?: boolean;
  priority?: boolean;
};

export function StoryCover({ story }: StoryCoverProps) {
  const inlineStyle = story.coverUrl
    ? { backgroundImage: `url(${story.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined;

  return (
    <div
      className={`story-cover ${story.coverUrl ? "" : story.coverClass}`}
      style={inlineStyle}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="line-clamp-2 text-sm font-black text-white drop-shadow">
          {story.title}
        </p>
        <p className="mt-1 text-xs font-bold text-white/80">
          {formatStoryType(story.type)}
        </p>
      </div>
    </div>
  );
}
