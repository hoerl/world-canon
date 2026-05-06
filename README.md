# Crate
Verify your Uniqueness.
*Hackathon winning project for World Build 3 - World.org*

Crate is a verified user preference primitive that any agent reads before transacting on behalf of a verified human user.

## How it Works

https://github.com/user-attachments/assets/789976d4-7302-4f89-be61-0f831e24189f

- Crates are personal data archives that can be filled with Records of the people, places, and things that impacted you.
- Every verified human gets one Crate, forever.
- Over time a verified Crate becomes a persistent taste prefrences that helps agents act upon your behalf on the web, and curating the web to your preferences.

World enables Proof-of-Human. Crate enables Proof-of-Culture.


## Stack

- Next.js App Router
- World MiniKit
- World UI Kit
- Neon Postgres

## Setup

1. Copy `.env.sample` to `.env.local`.
2. Fill in the required World, database, and agent API Keys.
3. Install dependencies with `pnpm install`.
4. Generate migrations if needed with `pnpm db:generate`.
5. Start the app with `pnpm dev`.

## Architecture

See [architecture.md](./architecture.md) for the system design, module boundaries, data model, API surface, and Canon-Agent notes.
