import { FilterSidebar } from "@/components/filters/filter-sidebar";
import { SearchBar } from "@/components/navigation/search-bar";
import { SectionHeader } from "@/components/sections/section-header";
import { StoryGrid } from "@/components/story/story-grid";
import { stories } from "@/lib/mock-data";

export default function StoryListPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <FilterSidebar />

      <section className="space-y-5">
        <div className="rounded-lg border border-line bg-surface p-4 shadow-soft">
          <SectionHeader title="Thu vien truyen" action="128 ket qua" />
          <div className="mt-4">
            <SearchBar placeholder="Tim ten truyen, tac gia, the loai" wide />
          </div>
        </div>

        <StoryGrid stories={stories} />

        <div className="flex items-center justify-center gap-2 pb-3">
          {["1", "2", "3"].map((page, index) => (
            <button
              key={page}
              className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-semibold transition hover:border-primary hover:text-primary ${
                index === 0
                  ? "border-primary bg-primary text-white"
                  : "border-line bg-surface text-subtle"
              }`}
            >
              {page}
            </button>
          ))}
          <button className="h-10 rounded-lg border border-line bg-surface px-4 text-sm font-semibold text-subtle transition hover:border-primary hover:text-primary">
            Infinite scroll
          </button>
        </div>
      </section>
    </div>
  );
}
