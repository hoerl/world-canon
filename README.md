# Crate
Crate is a taste identity primitive to Verify your Uniqueness. 

Every verified human has a Create comprised of their favorite people, places, or things. 

This is your persistent taste profile that helps your improve your experience on the agentic web. 

Each Crate taste record stores a title and a short rationale. 

The app supports:

- Wallet Auth session login
- World ID 4.0 human binding
- Crate creation and evolution history
- public crate reads
- managed crate-agent provisioning
- signed agent-readable crate responses

## Stack

- Next.js App Router
- World MiniKit
- World UI Kit
- World ID 4.0
- Neon Postgres
- Drizzle ORM
- Vitest

## Setup

1. Copy `.env.sample` to `.env.local`.
2. Fill in the required World, database, and agent secrets.
3. Install dependencies with `pnpm install`.
4. Generate migrations if needed with `pnpm db:generate`.
5. Apply schema changes with `pnpm db:push`.
6. Start the app with `pnpm dev`.

## Scripts

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm test`
- `pnpm db:generate`
- `pnpm db:push`

## Architecture

See [architecture.md](./architecture.md) for the system design, module boundaries, data model, API surface, and Canon-Agent notes.

## Notes

- Session auth is implemented with Wallet Auth + signed JWT cookies, not `next-auth`.
- World ID 4.0 `session_id` is the canonical one-human binding key.
- The current AgentKit integration provisions managed wallets, signs canon payloads, and refreshes registration state through AgentBook lookup. A concrete on-chain registration writer can be added later behind the existing agent service boundary.
