import { categories } from "@/lib/mock-data";

const status = ["All", "Ongoing", "Completed", "Hiatus"];
const types = ["All", "Novel", "Comic"];

export function FilterSidebar() {
  return (
    <aside className="space-y-4 rounded-lg border border-line bg-surface p-4 shadow-soft lg:sticky lg:top-24 lg:self-start">
      <div>
        <p className="text-sm font-black text-ink">Categories</p>
        <div className="mt-3 flex flex-wrap gap-2 lg:block lg:space-y-2">
          {categories.map((category) => (
            <button
              key={category}
              className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm font-semibold text-subtle transition hover:border-primary hover:text-primary lg:w-full lg:text-left"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-black text-ink">Type</p>
        <div className="mt-3 grid grid-cols-3 gap-2 lg:grid-cols-1">
          {types.map((type, index) => (
            <button
              key={type}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                index === 0
                  ? "border-primary bg-primary text-white"
                  : "border-line bg-canvas text-subtle hover:border-primary hover:text-primary"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-black text-ink">Status</p>
        <select className="mt-3 w-full rounded-lg border border-line bg-canvas px-3 py-3 text-sm font-semibold text-ink outline-none transition focus:border-primary">
          {status.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-sm font-black text-ink">Sort</p>
        <select className="mt-3 w-full rounded-lg border border-line bg-canvas px-3 py-3 text-sm font-semibold text-ink outline-none transition focus:border-primary">
          <option>Trending</option>
          <option>Latest update</option>
          <option>Top rating</option>
          <option>Most viewed</option>
        </select>
      </div>
    </aside>
  );
}
