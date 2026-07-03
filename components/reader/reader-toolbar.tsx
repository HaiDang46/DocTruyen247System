import Link from "next/link";

type ReaderToolbarProps = {
  mode: "novel" | "manga";
};

export function ReaderToolbar({ mode }: ReaderToolbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
        <Link href="/" className="text-sm font-black text-primary">
          DocTruyen247
        </Link>
        <span className="rounded-lg bg-muted px-2 py-1 text-xs font-bold uppercase text-subtle">
          {mode}
        </span>
        <div className="ml-auto flex min-w-0 items-center gap-2">
          {mode === "novel" ? (
            <>
              <label className="hidden items-center gap-2 text-xs font-bold text-subtle sm:flex">
                Font
                <input className="w-28 accent-blue-600" type="range" />
              </label>
              <div className="flex rounded-lg border border-line bg-canvas p-1">
                {["Light", "Dark", "Sepia"].map((theme, index) => (
                  <button
                    key={theme}
                    className={`rounded-lg px-2 py-1 text-xs font-bold ${
                      index === 0
                        ? "bg-primary text-white"
                        : "text-subtle hover:text-ink"
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex rounded-lg border border-line bg-canvas p-1">
              {["Fit", "Wide", "Zoom"].map((item, index) => (
                <button
                  key={item}
                  className={`rounded-lg px-2 py-1 text-xs font-bold ${
                    index === 0
                      ? "bg-primary text-white"
                      : "text-subtle hover:text-ink"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
