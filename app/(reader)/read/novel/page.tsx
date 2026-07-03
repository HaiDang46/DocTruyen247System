import { ReaderToolbar } from "@/components/reader/reader-toolbar";

const paragraphs = [
  "The city below the archive was already asleep, but the ink on Mira's page kept moving. Every line rearranged itself as if the book was breathing with the rain.",
  "She held the lamp closer. The chapter title faded, returned, and changed into a name she had not heard since childhood. Somewhere beneath the stone floor, a bell answered.",
  "By dawn, the library would open to ordinary readers. Tonight, it belonged to those who knew that stories could become doors, and doors could decide who was allowed to leave.",
  "Mira turned the page carefully. A narrow stair appeared between two sentences, written in blue fire and edged with dust."
];

export default function NovelReaderPage() {
  return (
    <div className="pb-24">
      <ReaderToolbar mode="novel" />

      <article className="mx-auto max-w-3xl px-5 pb-16 pt-8 md:pt-12">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase text-primary">Chapter 24</p>
          <h1 className="mt-2 text-2xl font-black md:text-4xl">
            The Door Written in Rain
          </h1>
          <p className="mt-2 text-sm text-subtle">Shadow Library</p>
        </div>

        <div className="reader-sheet reader-copy">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2">
          <button className="rounded-lg border border-line px-3 py-3 text-sm font-bold text-subtle">
            Prev
          </button>
          <button className="rounded-lg border border-line px-3 py-3 text-sm font-bold text-ink">
            Chapters
          </button>
          <button className="rounded-lg bg-primary px-3 py-3 text-sm font-bold text-white">
            Next
          </button>
        </div>
      </nav>
    </div>
  );
}
