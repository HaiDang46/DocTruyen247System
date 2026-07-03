# DocTruyen247 UI Skeleton

Modern reading website UI skeleton for both novels and manga/manhwa.

## Stack

- React + Next.js App Router
- TypeScript
- TailwindCSS
- Prisma + SQL Server
- Static mock data only

## Structure

- `app/(site)` - homepage, story list, story detail, profile, admin dashboard
- `app/(reader)` - distraction-light novel and manga reader layouts
- `components` - reusable UI system
- `lib/mock-data.ts` - static sample stories, chapters, profile items
- `lib/prisma.ts` - shared Prisma Client helper
- `prisma/schema.prisma` - SQL Server Prisma data model
- `db/sql-server-schema.sql` - equivalent SQL Server DDL
- `tailwind.config.ts` - design tokens and dark mode setup

## Pages

- `/` - home with hero, trending, latest, novels, manga
- `/stories` - story grid with filter sidebar
- `/stories/shadow-library` - story detail with novel/manga mode UI
- `/read/novel` - novel reader
- `/read/manga` - webtoon-style manga reader
- `/profile` - reading history and progress
- `/admin` - admin skeleton

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## Database

Copy `.env.example` to `.env`, then update `DATABASE_URL` for your SQL Server.

```bash
npm run db:validate
npm run db:generate
npm run db:push
npm run db:studio
```

Use `npm run db:migrate` when you want Prisma migration files instead of direct `db push`.
