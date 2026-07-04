export function ChapterListItem({ chapter }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-black text-ink">Chương {chapter.number}</p>
        <p className="mt-1 truncate text-sm text-subtle">{chapter.title}</p>
      </div>
    </div>
  );
}
