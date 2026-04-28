# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Crate is a portable taste identity for verified humans, built as a World Mini App.

AI made data infinite. When data goes infinite, creation stops being valuable — selection does. What a real human chose, returned to, and outgrew is taste, and taste is becoming the most important identity signal on the internet. But online, taste is fakeable: bots fake likes, AI fakes reviews, accounts fake people. Without proof of humanity, a taste graph is just another bot farm.

Crate proposes a different model: let the human curate the signal directly. Each day you input a new Record — a person, a place, or a thing. Small acts of curation that capture evolving taste. Each pick is signed by World ID, so your Crate becomes taste that is provably human. Instead of agents guessing who you are from data exhaust, they read what you intentionally chose to attach to your identity.

This only works on World. World ID provides the trust layer: proof that a signal came from a real, unique human, without exposing who that human is. That is the foundation — Crate is not a curation app, it is a taste primitive for the agentic web.

## Commands

- `pnpm dev` — start Next.js dev server
- `pnpm build` — production build
- `pnpm lint` — ESLint (flat config, ESLint 9)
- `pnpm test` — run all Vitest tests (`vitest run`)
- `pnpm test src/tests/canon-domain.test.ts` — run a single test file
- `pnpm db:generate` — generate Drizzle migrations from schema changes
- `pnpm db:push` — apply migrations to Neon Postgres

## Architecture

### Layer structure

```
src/
├── app/           Next.js App Router — pages and API routes only
├── features/      Domain modules — each owns its service, types, and UI
├── lib/           Shared utilities (db, session, crypto, env, http)
├── providers/     React context providers
├── abi/           Contract ABIs
└── tests/         Vitest unit tests
```

### Feature modules

Each feature in `src/features/` encapsulates a domain boundary with its own service class, domain types, and UI components:

- **auth** — Wallet Auth via MiniKit SIWE, session management
- **worldid** — World ID 4.0 human binding (RP context + proof verification)
- **canon** — Crate CRUD (create/evolve person/place/thing slots), evolution history
- **earth** — Global aggregation feed ("Taste of Humanity"), groups by normalized title
- **twins** — Taste twin discovery (self-join on title + tag overlap scoring)
- **agents** — Managed agent wallet provisioning, signing, AgentBook registration
- **demo** — Claude-powered gift recommendations (streaming)
- **ui** — Shared layout: brand intro, bottom bar, drawer helpers
- **share** — World Chat share message builder

### Data flow pattern

Pages are async server components that fetch data and pass to client components. API routes delegate to service classes in `src/features/*/`. Services use the Drizzle client from `src/lib/db/client.ts`. The pattern is: **route handler → service class → Drizzle query → Neon Postgres**.

### Auth model

Session auth uses custom signed JWT cookies (via `jose`), NOT next-auth. The flow:
1. Wallet Auth via MiniKit SIWE → `canon_session` cookie (30-day TTL)
2. World ID 4.0 binding → associates `world_session_id` with the user

`getOptionalSession()` in `src/lib/session.ts` is the session reader. Protected routes check `session.worldSessionId` for World ID binding. The `world_session_id` is the canonical one-human binding key across the system.

### Database

Neon Postgres with Drizzle ORM. Schema at `src/lib/db/schema.ts`. Four tables:
- `users` — keyed by `world_session_id`, has `public_slug` for profile URLs
- `canon_items` — one slot per (user, category), with `title_normalized` for matching
- `canon_evolutions` — append-only history of every create/evolve
- `agent_identities` — encrypted managed agent wallets, one active per user

Key constraint: `canon_items` has a unique index on `(user_id, category)` — each user gets exactly one person, one place, one thing. Every write to `canon_items` must also append to `canon_evolutions`.

## Key Conventions

### UI rules (from DESIGN.md)

- All spacing uses the 4px base system defined in `globals.css`. **No raw pixel literals** (`px-[18px]`) — use Tailwind spacing tokens only.
- All text uses the `Typography` component from `@worldcoin/mini-apps-ui-kit-react`.
- All icons from `@worldcoin/mini-apps-ui-kit-react/icons` (regular for default, solid for active state).
- Chrome uses UI Kit `TopBar`, `BottomBar`, `SafeAreaView` — never hand-roll these.
- Cards use `rounded-3xl`. Two styles: bordered (white + gray-200 border) and tinted (amber-50 + amber-200 border).
- Colors use UI Kit CSS custom properties only — no custom brand colors.
- The bottom bar is `BottomBar`, not `Tabs` (the slots aren't peer destinations).

### Code patterns

- Path alias: `@/*` maps to `src/*`.
- API route responses use `jsonOk()` and `jsonError()` helpers from `src/lib/http.ts`.
- Environment variables are accessed through typed helpers in `src/lib/env.ts`, never raw `process.env`.
- Agent private keys are AES-256-GCM encrypted at rest using `AGENT_ENCRYPTION_SECRET`.
- Canonical JSON serialization (deterministic key sort, no whitespace) is used for agent signing — see `src/lib/crypto.ts`.

### Environment setup

Copy `.env.sample` to `.env.local`. Required secrets: `AUTH_SECRET`, `DATABASE_URL`, `NEXT_PUBLIC_APP_ID`, `RP_SIGNING_KEY`, `RP_ID`, `NEXT_PUBLIC_WORLD_ENV`, `AGENT_ENCRYPTION_SECRET`. Set `DEMO_SEED_ENABLED=true` for development with seed data.

## Reference Docs

- `DESIGN.md` — full design system (spacing, typography, color, chrome, conversation drawers, motion)
- `architecture.md` — system diagram, all API routes, module boundaries, data model, flow descriptions
- `docs/` — brainstorms and implementation plans
