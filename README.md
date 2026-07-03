# DocTruyen247 UI Skeleton

Modern reading website UI skeleton for both novels and comics/manhwa.

## Stack

- React + Next.js App Router
- TypeScript
- TailwindCSS
- Static mock data only

## Structure

- `app/(site)` - homepage, story list, story detail, profile, admin dashboard
- `app/(reader)` - distraction-light novel and comic reader layouts
- `components` - reusable UI system
- `lib/mock-data.ts` - static sample stories, chapters, profile items
- `tailwind.config.ts` - design tokens and dark mode setup

## Pages

- `/` - home with hero, trending, latest, novels, comics
- `/stories` - story grid with filter sidebar
- `/stories/shadow-library` - story detail with novel/comic mode UI
- `/read/novel` - novel reader
- `/read/comic` - webtoon-style comic reader
- `/profile` - reading history and progress
- `/admin` - admin skeleton

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

The UI intentionally has no API calls, authentication, database access, or backend logic.
