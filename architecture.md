# Canon Architecture

## Overview

Canon is a World Mini App that gives each verified human one portable Canon:

- one `Person`
- one `Place`
- one `Thing`

Each pick has a `title` and a one-sentence `rationale`. Canon is built in two layers:

1. Core mini app and protocol layer
2. Canon-Agent layer for signed, agent-readable canon responses

The app uses:

- Next.js App Router
- World MiniKit for mini app runtime and Wallet Auth
- World ID 4.0 session proofs for one-human binding
- World UI Kit for all interactive UI
- Neon + Drizzle for persistence

## System Diagram

```text
World App WebView
  -> Wallet Auth via MiniKit
  -> World ID 4.0 session proof via IDKit
  -> Next.js app
       -> SessionAuthService
       -> HumanBindingService
       -> CanonService
       -> EarthService
       -> AgentRegistryService
       -> AgentSigner
       -> Neon Postgres
       -> World verify API
       -> AgentBook lookup
```

## Module Boundaries

### `src/features/auth`

- Wallet Auth client flow
- nonce request
- SIWE completion
- session display and auth CTA

### `src/features/worldid`

- RP context fetch
- World ID 4.0 session creation UI
- proof verification handoff
- binding wallet session to a persistent `world_session_id`

### `src/features/canon`

- domain types and validation
- canon create/evolve mutations
- public canon reads
- evolution history
- reusable canon UI

### `src/features/earth`

- Earth aggregation
- optional demo seed injection
- home feed rendering

### `src/features/share`

- World Chat share message builder
- client share action

### `src/features/agents`

- managed agent wallet provisioning
- agent status tracking
- agent signature generation
- AgentBook registration-state refresh

### `src/lib`

- environment helpers
- session cookies and JWT
- encryption and canonical JSON signing
- DB schema and client
- HTTP helpers

## Major Flows

### Wallet Auth flow

1. Client fetches `GET /api/auth/nonce`
2. Client calls `MiniKit.walletAuth()`
3. Client posts signed payload to `POST /api/auth/complete-siwe`
4. Server verifies SIWE payload
5. Server writes session cookie
6. Returning login may hydrate `world_session_id` from an existing wallet match

### World ID 4.0 binding flow

1. Client fetches `POST /api/worldid/rp-context`
2. Client opens `IDKitSessionWidget`
3. User creates a session proof for `proof_of_human`
4. Client posts raw IDKit result to `POST /api/worldid/verify`
5. Server forwards payload to `POST /api/v4/verify/{rp_id}`
6. On success, server upserts the user by `world_session_id`
7. Server refreshes the session cookie with the bound `world_session_id`

### Canon write flow

1. Client submits a `category`, `title`, and `rationale`
2. `PUT /api/canon/[identifier]` validates the body and category
3. Server resolves the current user from the bound session
4. `CanonService` inserts or updates the slot
5. `CanonService` always appends a `canon_evolutions` row
6. UI refreshes from server data

### Public read flow

1. Public page requests canon by slug
2. `CanonService` loads user, current canon items, and evolution count
3. Public protocol endpoint returns the same canonical JSON shape

### Earth aggregation flow

1. `EarthService` loads canon rows
2. Rows are grouped by `category + title_normalized`
3. Ranking sorts by votes descending, then freshness descending
4. Top 10 per category are rendered on the home screen and returned by `GET /api/earth`

### Canon-Agent flow

1. Bound user provisions a managed Canon-Agent with `POST /api/agent/register`
2. Server generates a wallet, encrypts the private key, and stores an `agent_identities` row
3. Server checks AgentBook registration status via `createAgentBookVerifier()`
4. Public consumers request `GET /api/agent/[slug]/canon`
5. Server builds a canonical JSON payload and signs it through `AgentSigner`
6. Route returns signed canon data plus agent metadata

## Data Model

### `users`

- canonical owner record keyed by `world_session_id`
- stores public slug and latest wallet/profile info

### `canon_items`

- one current slot per category per user
- unique on `(user_id, category)`

### `canon_evolutions`

- append-only history for every create/evolve

### `agent_identities`

- one active managed wallet per user
- preserves rotation history
- stores encrypted key material and registration state

## Public API Matrix

### Auth

- `GET /api/auth/nonce`
- `POST /api/auth/complete-siwe`
- `GET /api/auth/session`

### World ID

- `POST /api/worldid/rp-context`
- `POST /api/worldid/verify`

### Canon

- `GET /api/canon/me`
- `PUT /api/canon/[identifier]`
- `GET /api/canon/[identifier]`
- `GET /api/canon/[slug]/evolutions`
- `GET /api/earth`

### Agent

- `POST /api/agent/register`
- `POST /api/agent/rotate`
- `GET /api/agent/[slug]/canon`

## Env Vars and Secrets

- `AUTH_SECRET`
  Used to sign the app session JWT.
- `DATABASE_URL`
  Neon Postgres connection string.
- `NEXT_PUBLIC_APP_ID`
  World Mini App app id for MiniKit and IDKit.
- `RP_ID`
  World ID relying-party id.
- `RP_SIGNING_KEY`
  World ID RP signing key used for session proof requests.
- `NEXT_PUBLIC_WORLD_ENV`
  `production` or `staging` for IDKit requests.
- `AGENT_ENCRYPTION_SECRET`
  Symmetric secret used to encrypt managed agent private keys at rest.
- `WORLD_AGENTBOOK_RPC_URL`
  Optional World Chain RPC override for AgentBook lookups.
- `DEMO_SEED_ENABLED`
  Enables home screen seed data for non-production/demo environments.

## Deployment Topology

- Web app and API routes on Vercel
- Postgres on Neon
- World verify API for proof verification
- AgentBook lookup against World Chain RPC

## Current Phase Status

- Phase 1 implemented in-app:
  - Wallet Auth
  - World ID 4.0 binding
  - canon create/evolve
  - public canon reads
  - Earth aggregation
  - World Chat share
- Phase 2 implemented at the application layer:
  - managed Canon-Agent provisioning
  - encrypted key storage
  - signed canon endpoint
  - rotation support
  - AgentBook registration-state refresh

## Known Constraint

The current public AgentKit package exposes verification and AgentBook lookup, but not a complete AgentBook registration transaction helper. The app therefore provisions and signs with a managed agent wallet today, and refreshes registration state by lookup. A future integration can slot in a concrete on-chain registration writer behind `AgentRegistryService` without changing route contracts or schema.
