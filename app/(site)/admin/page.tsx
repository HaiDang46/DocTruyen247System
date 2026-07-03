import { ProgressBar } from "@/components/progress-bar";
import { SectionHeader } from "@/components/sections/section-header";
import { stories } from "@/lib/mock-data";

const menu = ["Stories", "Chapters", "Upload", "Users", "Analytics"];
const stats = [
  { label: "Stories", value: "2,480" },
  { label: "Monthly reads", value: "18.6M" },
  { label: "Uploads", value: "742" },
  { label: "Reports", value: "31" }
];

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[240px_1fr]">
      <aside className="rounded-lg border border-line bg-surface p-3 shadow-soft">
        <p className="px-2 py-2 text-xs font-black uppercase text-subtle">
          Admin
        </p>
        <nav className="space-y-1">
          {menu.map((item, index) => (
            <button
              key={item}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm font-bold transition ${
                index === 0
                  ? "bg-primary text-white"
                  : "text-subtle hover:bg-muted hover:text-ink"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="space-y-6">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-line bg-surface p-4 shadow-soft"
            >
              <p className="text-xs font-bold uppercase text-subtle">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-black text-ink">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-lg border border-line bg-surface p-4 shadow-soft">
            <SectionHeader title="Stories table" action="Export" />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead className="text-xs uppercase text-subtle">
                  <tr className="border-b border-line">
                    <th className="py-3 pr-4">Title</th>
                    <th className="py-3 pr-4">Type</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Views</th>
                    <th className="py-3 pr-4">Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {stories.slice(0, 6).map((story) => (
                    <tr key={story.id}>
                      <td className="py-3 pr-4 font-bold text-ink">
                        {story.title}
                      </td>
                      <td className="py-3 pr-4 text-subtle">{story.type}</td>
                      <td className="py-3 pr-4 text-subtle">{story.status}</td>
                      <td className="py-3 pr-4 text-subtle">{story.views}</td>
                      <td className="py-3 pr-4">
                        <ProgressBar value={story.type === "NOVEL" ? 78 : 64} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-line bg-surface p-4 shadow-soft">
              <SectionHeader title="Create story" action="Draft" />
              <form className="mt-4 space-y-3">
                <input
                  className="w-full rounded-lg border border-line bg-canvas px-3 py-3 text-sm outline-none transition focus:border-primary"
                  placeholder="Story title"
                />
                <select className="w-full rounded-lg border border-line bg-canvas px-3 py-3 text-sm outline-none transition focus:border-primary">
                  <option>Novel</option>
                  <option>Comic</option>
                </select>
                <textarea
                  className="min-h-28 w-full rounded-lg border border-line bg-canvas px-3 py-3 text-sm outline-none transition focus:border-primary"
                  placeholder="Short description"
                />
                <button className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white">
                  Save draft
                </button>
              </form>
            </div>

            <div className="rounded-lg border border-dashed border-line bg-surface p-6 text-center shadow-soft">
              <div className="mx-auto h-24 max-w-40 rounded-lg bg-muted" />
              <p className="mt-4 text-sm font-black text-ink">
                Comic image upload
              </p>
              <p className="mt-1 text-xs text-subtle">
                JPG, PNG, WEBP placeholders
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
