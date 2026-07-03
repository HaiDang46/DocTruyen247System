export type StoryType = "NOVEL" | "MANGA";

export type Story = {
  id: string;
  title: string;
  slug: string;
  type: StoryType;
  status: "Ongoing" | "Completed" | "Hiatus";
  author: string;
  rating: number;
  views: string;
  latestChapter: string;
  tags: string[];
  description: string;
  coverClass: string;
};

export type Chapter = {
  id: string;
  number: number;
  title: string;
  isPremium: boolean;
};

export const categories = [
  "Fantasy",
  "Romance",
  "Action",
  "Mystery",
  "Slice of Life",
  "Cultivation",
  "Drama",
  "Comedy"
];

export const stories: Story[] = [
  {
    id: "story-1",
    title: "Shadow Library",
    slug: "shadow-library",
    type: "NOVEL",
    status: "Ongoing",
    author: "Mira Vale",
    rating: 4.8,
    views: "12.8M",
    latestChapter: "Chapter 124",
    tags: ["Fantasy", "Mystery", "Slow burn"],
    description:
      "A hidden archive collects unfinished lives, and one apprentice reader learns that some stories are waiting for their authors to disappear.",
    coverClass: "bg-gradient-to-br from-slate-950 via-blue-800 to-sky-500"
  },
  {
    id: "story-2",
    title: "Neon Blade Office",
    slug: "neon-blade-office",
    type: "MANGA",
    status: "Ongoing",
    author: "Jun Park",
    rating: 4.7,
    views: "9.4M",
    latestChapter: "Episode 48",
    tags: ["Action", "Cyberpunk", "Comedy"],
    description:
      "A courier with a borrowed sword takes impossible delivery jobs through a city that bills citizens for every memory.",
    coverClass: "bg-gradient-to-br from-fuchsia-700 via-slate-950 to-cyan-500"
  },
  {
    id: "story-3",
    title: "After School Alchemy",
    slug: "after-school-alchemy",
    type: "MANGA",
    status: "Completed",
    author: "Hana Li",
    rating: 4.6,
    views: "7.1M",
    latestChapter: "Episode 82",
    tags: ["School", "Magic", "Comedy"],
    description:
      "Three students accidentally turn detention into a gateway for small, inconvenient miracles.",
    coverClass: "bg-gradient-to-br from-emerald-700 via-teal-700 to-slate-900"
  },
  {
    id: "story-4",
    title: "The Last Tea Master",
    slug: "the-last-tea-master",
    type: "NOVEL",
    status: "Ongoing",
    author: "An Khoa",
    rating: 4.9,
    views: "5.6M",
    latestChapter: "Chapter 91",
    tags: ["Wuxia", "Drama", "Healing"],
    description:
      "An exiled artisan travels between rival courts, serving tea that can reveal a person's truest memory.",
    coverClass: "bg-gradient-to-br from-stone-800 via-emerald-900 to-lime-600"
  },
  {
    id: "story-5",
    title: "Moonlit Delivery Guild",
    slug: "moonlit-delivery-guild",
    type: "NOVEL",
    status: "Ongoing",
    author: "Sora Min",
    rating: 4.5,
    views: "4.8M",
    latestChapter: "Chapter 63",
    tags: ["Adventure", "Found family", "Magic"],
    description:
      "Every midnight delivery changes the map, but the guild's newest rider has never missed an address.",
    coverClass: "bg-gradient-to-br from-indigo-950 via-blue-900 to-amber-400"
  },
  {
    id: "story-6",
    title: "Crownless Runner",
    slug: "crownless-runner",
    type: "MANGA",
    status: "Hiatus",
    author: "Theo Vinh",
    rating: 4.3,
    views: "3.2M",
    latestChapter: "Episode 35",
    tags: ["Sports", "Drama", "Rivals"],
    description:
      "A fallen champion joins an underground relay where every race rewrites the leaderboard of the city.",
    coverClass: "bg-gradient-to-br from-rose-700 via-orange-600 to-slate-950"
  },
  {
    id: "story-7",
    title: "Garden of Broken Stars",
    slug: "garden-of-broken-stars",
    type: "NOVEL",
    status: "Completed",
    author: "N. Calder",
    rating: 4.4,
    views: "6.0M",
    latestChapter: "Chapter 140",
    tags: ["Sci-fi", "Romance", "Space"],
    description:
      "Two botanists grow impossible flowers on a dead orbital station and wake something ancient below the roots.",
    coverClass: "bg-gradient-to-br from-cyan-900 via-slate-950 to-pink-500"
  },
  {
    id: "story-8",
    title: "Tiny Dragon Payroll",
    slug: "tiny-dragon-payroll",
    type: "MANGA",
    status: "Ongoing",
    author: "Mai Studio",
    rating: 4.6,
    views: "2.9M",
    latestChapter: "Episode 22",
    tags: ["Comedy", "Office", "Fantasy"],
    description:
      "An office accountant discovers the company mascot is a fire-breathing executive with very strict expense policies.",
    coverClass: "bg-gradient-to-br from-yellow-500 via-red-500 to-slate-900"
  }
];

export const chapters: Chapter[] = [
  { id: "chapter-1", number: 124, title: "A Bell Under Stone", isPremium: true },
  { id: "chapter-2", number: 123, title: "The Ink Learns a Name", isPremium: false },
  { id: "chapter-3", number: 122, title: "Rain Against the Archive", isPremium: false },
  { id: "chapter-4", number: 121, title: "A Stair Between Sentences", isPremium: false },
  { id: "chapter-5", number: 120, title: "Borrowed Lanterns", isPremium: false }
];

export const episodes = [
  { id: "episode-1", number: 48, title: "Signal Over Glass" },
  { id: "episode-2", number: 47, title: "City Toll" },
  { id: "episode-3", number: 46, title: "Borrowed Sword" },
  { id: "episode-4", number: 45, title: "Late Delivery" }
];

export const profileItems = [
  { story: stories[0], chapter: "Chapter 124", progress: 68 },
  { story: stories[1], chapter: "Episode 48", progress: 42 },
  { story: stories[3], chapter: "Chapter 91", progress: 86 },
  { story: stories[6], chapter: "Chapter 140", progress: 100 }
];
