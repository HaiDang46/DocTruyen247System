import { ProgressBar } from "@/components/progress-bar";
import { SectionHeader } from "@/components/sections/section-header";
import { StoryCover } from "@/components/story/story-cover";
import { profileItems } from "@/lib/mock-data";

const tabs = ["Lịch sử đọc", "Yêu thích", "Đang theo dõi", "Đọc tiếp"];

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-surface p-5 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primarySoft text-xl font-black text-primary">
              DT
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink">Hồ sơ độc giả</h1>
              <p className="mt-1 text-sm text-subtle">
                38 truyện đang theo dõi
              </p>
            </div>
          </div>
          <button className="rounded-lg border border-line px-4 py-2 text-sm font-bold text-ink transition hover:border-primary hover:text-primary">
            Sửa hồ sơ
          </button>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            className={`whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-bold transition ${
              index === 0
                ? "border-primary bg-primary text-white"
                : "border-line bg-surface text-subtle hover:border-primary hover:text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="rounded-lg border border-line bg-surface p-4 shadow-soft">
        <SectionHeader title="Đọc tiếp" action="Đồng bộ" />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {profileItems.map((item) => (
            <article
              key={item.story.id}
              className="grid grid-cols-[88px_1fr] gap-3 rounded-lg border border-line bg-canvas p-3 transition hover:border-primary"
            >
              <StoryCover story={item.story} compact />
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-ink">
                  {item.story.title}
                </p>
                <p className="mt-1 text-xs font-semibold text-subtle">
                  {item.chapter}
                </p>
                <div className="mt-4">
                  <ProgressBar value={item.progress} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
