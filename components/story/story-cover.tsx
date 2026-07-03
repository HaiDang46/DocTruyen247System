import type { Story } from "@/lib/mock-data";

type StoryCoverProps = {
  story: Story;
  compact?: boolean;
  priority?: boolean;
};

export function StoryCover({ story }: StoryCoverProps) {
  return (
    <div
      className={`story-cover ${story.coverClass}`}
    >
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="line-clamp-2 text-sm font-black text-white drop-shadow">
          {story.title}
        </p>
        <p className="mt-1 text-xs font-bold text-white/80">{story.type}</p>
      </div>
    </div>
  );
}
