type SectionHeaderProps = {
  title: string;
  action?: string;
};

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-xl font-black text-ink md:text-2xl">{title}</h2>
      {action ? (
        <button className="rounded-lg border border-line px-3 py-2 text-xs font-black text-subtle transition hover:border-primary hover:text-primary">
          {action}
        </button>
      ) : null}
    </div>
  );
}
