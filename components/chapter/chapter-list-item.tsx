import { TagBadge } from "@/components/tag-badge";
import type { Chapter } from "@/lib/mock-data";

type ChapterListItemProps = {
  chapter: Chapter;
};

export function ChapterListItem({ chapter }: ChapterListItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-black text-ink">Chapter {chapter.number}</p>
        <p className="mt-1 truncate text-sm text-subtle">{chapter.title}</p>
      </div>
      <TagBadge tone={chapter.isPremium ? "amber" : "green"}>
        {chapter.isPremium ? "premium" : "free"}
      </TagBadge>
    </div>
  );
}
