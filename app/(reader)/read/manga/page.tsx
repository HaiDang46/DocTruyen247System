import { ModalDrawer } from "@/components/modal-drawer";
import { ReaderToolbar } from "@/components/reader/reader-toolbar";

const panels = Array.from({ length: 8 }, (_, index) => index + 1);

export default function MangaReaderPage() {
  return (
    <div className="pb-24">
      <ReaderToolbar mode="manga" />

      <section className="mx-auto max-w-4xl px-0 py-5 sm:px-4">
        <div className="mx-auto max-w-3xl overflow-hidden bg-slate-950">
          {panels.map((panel) => (
            <div
              key={panel}
              className="manga-panel"
            >
              <div className="relative flex min-h-[420px] items-center justify-center p-6 text-center sm:min-h-[620px]">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Webtoon panel
                  </p>
                  <p className="mt-2 text-3xl font-black text-white">
                    {String(panel).padStart(2, "0")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ModalDrawer title="Chapter list drawer">
        <div className="grid grid-cols-3 gap-2 text-sm">
          {["21", "22", "23", "24", "25", "26"].map((chapter) => (
            <button
              key={chapter}
              className="rounded-lg border border-line px-3 py-2 font-bold text-ink"
            >
              {chapter}
            </button>
          ))}
        </div>
      </ModalDrawer>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2">
          <button className="rounded-lg border border-line px-3 py-3 text-sm font-bold text-subtle">
            Prev
          </button>
          <button className="rounded-lg border border-line px-3 py-3 text-sm font-bold text-ink">
            List
          </button>
          <button className="rounded-lg bg-primary px-3 py-3 text-sm font-bold text-white">
            Next
          </button>
        </div>
      </nav>
    </div>
  );
}
