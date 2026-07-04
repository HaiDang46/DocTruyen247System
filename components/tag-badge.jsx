const toneClass = {
  neutral: "bg-muted text-subtle",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200",
  violet:
    "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-200",
  green:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200",
};

export function TagBadge({ children, tone = "neutral" }) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-black uppercase ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}
