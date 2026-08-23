# Smile

A small community website connecting older adults who need help — translating
letters and forms, setting up a phone, a ride to the doctor, groceries, and
more — with younger volunteers nearby who can help. Bilingual (English /
Vietnamese), built for a small trusted pilot community.

## Stack

Next.js 16 (App Router, Server Actions), TypeScript, Tailwind CSS, Prisma ORM
(Postgres via `DATABASE_URL`, same connection string for local dev and a real
deploy), a lightweight JWT-cookie session (no third-party auth provider), and a
notification abstraction that's Viber-ready but works with zero external
setup out of the box (see [Notifications](#notifications) below).

## Getting started

```bash
npm install
docker compose up -d  # starts a local Postgres matching .env.example
cp .env.example .env
# generate a session secret and paste it into .env as SESSION_SECRET
openssl rand -base64 32

npm run db:migrate   # applies the schema to the local Postgres
npm run db:seed      # seeds default categories + demo accounts (see below)
npm run dev
```

Open http://localhost:3000 — it redirects to the default locale, `/vi`.

### Seeded accounts

| Role | Email | Password | Status |
| --- | --- | --- | --- |
| Admin | `admin@smile.local` | `smile-admin-123` | Active |
| Helper | `helper@smile.local` | `smile-demo-123` | Active |
| Requester | `requester@smile.local` | `smile-demo-123` | Pending (needs admin approval) |

Sign in as the admin at `/vi/admin` to approve new accounts, manage help
categories, edit site content (home page, etc.), and view the notification
log.

## How it's put together

- `prisma/schema.prisma` — `User`, `HelpCategory`, `HelpRequest`,
  `RequestMessage`, `Page` (admin-editable site content), and
  `NotificationLog`. Role/status/urgency fields are plain strings validated
  with zod, not Prisma enums — kept from an earlier version of this schema
  that also targeted SQLite locally.
- `src/lib/session.ts` + `src/lib/dal.ts` — cookie-based session (signed with
  `jose`) and a small data-access layer (`requireUser` /
  `requireActiveUser` / `requireAdmin`) that gates pages and Server Actions.
  `src/proxy.ts` does the same check optimistically (cookie only, no DB hit)
  to redirect unauthenticated visitors before a protected page even renders.
- `src/server/actions/*` — Server Actions for auth, requests (create, claim,
  message, status transitions), and admin operations. Every action
  re-verifies the session and role itself rather than trusting the UI.
- `src/i18n/` — a plain dictionary-based i18n setup (`en.json` / `vi.json`)
  under `app/[locale]/...`, following the pattern in the Next.js docs rather
  than a third-party i18n library.
- Accessibility: a text-size cycle (base/large/extra-large) and a
  high-contrast toggle, both persisted in a cookie and applied via
  `data-*` attributes on `<html>` so there's no flash on reload.

### Notifications

`src/server/notifications/service.ts` fans every event out to all configured
channels and logs one `NotificationLog` row per channel per event (visible at
`/admin/notifications`):

- **console** — always on, logs to the server console.
- **email** — no-ops (`SKIPPED`) until `SMTP_*` env vars are set.
- **viber** — no-ops (`SKIPPED`) until `VIBER_BOT_TOKEN` and `VIBER_GROUP_ID`
  are set, but logs the exact payload it *would* POST to the Viber Bot REST
  API, so you can verify the shape before registering a real bot. Once you
  have a Viber Public Account / bot token, fill in the env vars in `.env` —
  no code changes needed.

## Scripts

```bash
npm run dev          # start the dev server
npm run build         # production build
npm run lint          # eslint
npm run test           # vitest
npm run db:migrate    # prisma migrate dev
npm run db:seed        # prisma db seed
npm run db:studio      # prisma studio (browse the local database)
```
