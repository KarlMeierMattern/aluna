# Aluna

Cycle tracking PWA — your inner tide.

## Stack

- **Next.js 16** PWA (Serwist)
- **IndexedDB** — all cycle logs stay on device
- **Neon Postgres** — Google auth (`users`/`accounts`), push subscriptions, partner share snapshots
- **Auth.js** — Google SSO, JWT in httpOnly cookie
- **Web Push** — Vercel cron → `/api/cron/reminders`

## Setup

1. Copy `.env.example` → `.env.local` and fill in values
2. Create Google OAuth client in [GCP Console](https://console.cloud.google.com/) (Web application; redirect URI `http://localhost:3000/api/auth/callback/google`)
3. Create Neon database and set `DATABASE_URL`
4. Push schema: `npm run db:push`
5. Generate VAPID keys: `npx web-push generate-vapid-keys`
6. Run: `npm run dev` (uses webpack for Serwist compatibility)

## Scripts

- `npm run dev` — local dev
- `npm run build` — production build
- `npm run db:push` — sync Drizzle schema to Neon

## Data model

| Where | What |
|---|---|
| IndexedDB | period start, cycle length, BC, daily logs, symptoms, notes |
| Neon | user identity, push endpoints, partner link tokens + share snapshots |

Export/import JSON backup from the app UI.

## Architecture

Open in a browser (offline, self-contained):

- [System context (C4 L1)](./docs/architecture/c4-context.html)
- [Containers (C4 L2)](./docs/architecture/c4-container.html)
- [Components (C4 L3)](./docs/architecture/c4-component.html)
- [Auth flow (sequence)](./docs/architecture/auth-sequence.html)
- [Push notifications (sequence)](./docs/architecture/push-sequence.html)
- [Partner sharing (sequence)](./docs/architecture/partner-sequence.html)

## Reference

Original static prototype: [Aluna.html](./Aluna.html)
