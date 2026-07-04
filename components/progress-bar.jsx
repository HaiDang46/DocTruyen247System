export function ProgressBar({ value }) {
  return (
    <div className="h-2 overflow-hidden rounded-lg bg-muted">
      <div
        className="h-full rounded-lg bg-primary"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
