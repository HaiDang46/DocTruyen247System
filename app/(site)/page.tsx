import { HeroBanner } from "@/components/sections/hero-banner";
import { SectionHeader } from "@/components/sections/section-header";
import { StoryGrid } from "@/components/story/story-grid";
import { stories } from "@/lib/mock-data";

export default function HomePage() {
  const trending = stories.slice(0, 5);
  const latest = stories.slice(3, 8);
  const novels = stories.filter((story) => story.type === "NOVEL").slice(0, 5);
  const mangas = stories.filter((story) => story.type === "MANGA").slice(0, 5);

  return (
    <div className="space-y-10">
      <HeroBanner stories={trending.slice(0, 3)} />

      <section className="space-y-4">
        <SectionHeader title="Trending" action="Xem tat ca" />
        <StoryGrid stories={trending} />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Moi cap nhat" action="Moi nhat" />
        <StoryGrid stories={latest} compact />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Popular novels" action="Novel" />
        <StoryGrid stories={novels} />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Popular manga" action="Manga" />
        <StoryGrid stories={mangas} />
      </section>
    </div>
  );
}
