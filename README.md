# Star Haven Strength

> Train like a Star, Feel like a Star.

Online personal training platform for civilians and military members. Built with
the Next.js 14 App Router, deployed on Vercel.

**Live:** https://www.starhavenstrength.com

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript strict mode)
- **Styling:** Tailwind CSS
- **Database:** Vercel Postgres
- **ORM:** Prisma
- **Auth:** Auth.js v5 (`next-auth@beta`) with the Prisma adapter — credentials +
  Google OAuth
- **File storage:** Vercel Blob
- **Payments:** Stripe
- **Scheduling:** Google Calendar API / Google Meet
- **Video:** YouTube (unlisted)
- **Wearables:** Terra API
- **Nutrition:** Nutritionix
- **Exercise data:** RapidAPI (ExerciseDB)
- **Charts:** Recharts
- **Icons:** lucide-react

## Brand

| Token        | Value     |
| ------------ | --------- |
| Deep Green   | `#1B4332` |
| Gold         | `#C9A84C` |
| White        | `#FFFFFF` |
| Charcoal     | `#1A1A1A` |
| Light Grey   | `#F9FAFB` |

- **Display / headings:** Oswald
- **Body:** Inter
- **Monospace / stats:** JetBrains Mono

## Project Structure

```
app/
  (auth)/            login, register, forgot-password, reset-password
  (dashboard)/       authenticated client dashboard
  (marketing)/       public marketing pages (pricing, …)
  api/               route handlers (auth, register, health, cron, …)
  page.tsx           public "Coming Soon" landing page
  layout.tsx         root layout (fonts + metadata)
  globals.css        Tailwind + brand CSS custom properties
components/          ui / layout / forms
lib/
  auth/              Auth.js config, guards, api helpers
  db/                Prisma client, query helpers, seed script
  env.ts             Zod-validated environment variables
prisma/
  schema.prisma      full data model
types/               shared TS types + Auth.js module augmentation
```

## Getting Started

### Prerequisites

- Node.js 20.x
- A Vercel account (Postgres + Blob)
- Accounts / API keys for the services below

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in the values. Each key is documented in `.env.local.example` with a note
on where to find it. At minimum you need the Postgres connection strings and
`AUTH_SECRET` (`npx auth secret`) to run locally.

### 3. Generate the Prisma client

```bash
npx prisma generate
```

Once a database is connected, push the schema:

```bash
npx prisma db push
```

### 4. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000.

### 5. Create an admin

Register a user through the app, then:

```bash
npm run seed:admin -- you@example.com
```

## Scripts

| Script               | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start the dev server                 |
| `npm run build`      | `prisma generate` + `next build`     |
| `npm run start`      | Start the production server          |
| `npm run lint`       | Run ESLint                           |
| `npm run type-check` | `tsc --noEmit`                       |
| `npm run format`     | Prettier write                       |
| `npm run db:push`    | Push the Prisma schema to the DB     |
| `npm run seed:admin` | Promote a user to admin              |

## Required Accounts / Services

- **Vercel** — hosting, Postgres, Blob storage, Cron
- **Google Cloud** — OAuth credentials + service account (Calendar/Meet),
  YouTube Data API key
- **Stripe** — subscriptions, coupons, webhooks
- **Terra** — wearable integrations
- **Nutritionix** — nutrition lookups
- **RapidAPI** — ExerciseDB exercise data

## Health Check

`GET /api/health` returns `{ status: 'ok', database: 'connected' }` when the
database is reachable.
