---
title: "feat: Taste Gate demo — Crate as cultural credential"
type: feat
status: completed
date: 2026-04-26
origin: docs/brainstorms/2026-04-26-agent-crate-use-cases-brainstorm.md
---

# feat: Taste Gate Demo — Crate as Cultural Credential

## Overview

A demo page at `/demo/taste-gate` that proves the "Crate as credential" concept. A user enters any public Crate slug, selects from predefined "gates" (e.g., Michelin Supper Club, Streetwear Drop, Art Basel VIP), and Claude evaluates the Crate's taste trajectory against the gate's criteria — returning a streaming verdict: **"You're in"** or **"Not quite"** with taste-based reasoning.

This is the second demo in the **read → verify → act** progression (see brainstorm: `docs/brainstorms/2026-04-26-agent-crate-use-cases-brainstorm.md`). The Gift Finder proved the Crate is *readable*; Taste Gate proves it's *verifiable* — a new access control primitive built on World ID 4.0's proof of human.

## Problem Statement / Motivation

The Gift Finder demo shows agents can read and reason about taste. But the bigger opportunity is taste as a **credential** — your Crate opening doors that follower counts or purchase history never could. This demo makes that tangible: your taste trajectory either qualifies you or it doesn't, and the agent explains why.

## Proposed Solution

Follow the identical architectural pattern as the Gift Finder demo:

| Layer | Gift Finder | Taste Gate |
|-------|-------------|------------|
| Page route | `src/app/demo/shopper/page.tsx` | `src/app/demo/taste-gate/page.tsx` |
| Client component | `src/features/demo/components/shopper-page.tsx` | `src/features/demo/components/taste-gate-page.tsx` |
| API route | `src/app/api/demo/shopper/route.ts` | `src/app/api/demo/taste-gate/route.ts` |
| Prompt builder | `src/features/demo/lib/shopper-prompt.ts` | `src/features/demo/lib/taste-gate-prompt.ts` |
| New: gate definitions | — | `src/features/demo/lib/gates.ts` |

### Gate Definitions

Static TypeScript module with predefined gates. Each gate has:

```typescript
type TasteGate = {
  id: string;
  name: string;
  tagline: string;
  criteria: string;       // Human-readable description for UI
  evaluationPrompt: string; // Detailed criteria for Claude to evaluate against
};
```

**Starter gates (3–4):**

1. **"The Salon"** — A supper club for people whose taste shows genuine food/dining evolution. Evaluates: Place and Thing slots for culinary signals, evolution history for depth of engagement, rationales that show aesthetic sensibility beyond surface preference.

2. **"First Drop"** — A streetwear/design drop for people whose aesthetic credibility comes from taste trajectory, not hype. Evaluates: Thing slot for design/object awareness, Person slot for cultural influence literacy, evolution arc showing independent discovery rather than trend-following.

3. **"Curator's Circle"** — Art Basel VIP tier curated by taste alignment. Evaluates: cross-slot aesthetic coherence (do their person/place/thing tell a consistent creative story?), evolution showing intellectual curiosity, rationales that demonstrate "why" over "what."

### Prompt Architecture

The prompt builder assembles:

1. **Crate data** — reuses the `formatSlots()` and `formatEvolutions()` pattern from `shopper-prompt.ts`
2. **Gate criteria** — the gate's `evaluationPrompt` describing what to look for
3. **Evaluation instructions** — ask Claude to return a structured JSON verdict

**Claude response schema:**

```typescript
type GateVerdict = {
  verdict: 'in' | 'not_quite';
  headline: string;          // e.g., "Your taste speaks for itself"
  reasoning: string;         // 2-3 sentences connecting Crate data to gate criteria
  highlights: string[];      // 2-3 specific things from the Crate that mattered
  suggestion?: string;       // Only for 'not_quite' — what evolution would help
};
```

### API Route

`GET /api/demo/taste-gate?slug=<slug>&gate=<gate_id>`

1. Parse `slug` and `gate` from query params
2. Look up gate definition from `gates.ts` — 400 if invalid
3. Fetch canon via `CanonService.getCanonBySlug(slug)` — 404 if not found
4. Validate at least one slot filled — 422 if empty
5. Fetch evolutions via `CanonService.listEvolutionsBySlug(slug)`
6. Build prompt via `buildTasteGatePrompt(canon, evolutions, gate)`
7. Stream Claude response via `client.messages.stream()` (same pattern as shopper)
8. Return `Content-Type: text/plain; charset=utf-8`

**Settings:** `claude-sonnet-4-6`, `max_tokens: 1024`, `temperature: 0.7` (slightly lower than shopper for more consistent evaluations)

### UI Component

`TasteGatePage` — `'use client'` component with two phases:

**Phase 1: Selection**
- Slug input (pre-populated from session if authenticated)
- Gate cards — 3-4 bordered cards (`rounded-3xl border border-gray-200 bg-white p-4`) showing gate name, tagline, and a brief criteria summary
- User taps a gate card → triggers evaluation

**Phase 2: Verdict**
- Streaming verdict card with animated reveal
- **"You're in"** — success styling (`bg-success-100 border-success-700`), headline, reasoning, highlight chips
- **"Not quite"** — neutral styling (not error — `bg-gray-0 border-gray-200`), headline, reasoning, suggestion for what evolution might help
- "Try Another Gate" button to return to Phase 1
- "Try Another Crate" button to reset slug

**UI Kit components:** `SafeAreaView`, `Typography`, `Button`, `useToast()`, `Xmark` icon

## Technical Considerations

- **No database changes** — gates are static definitions, verdict is ephemeral
- **No new environment variables** — reuses `ANTHROPIC_API_KEY`
- **Streaming pattern identical** to Gift Finder — same `ReadableStream` + `extractCompleteObjects` approach
- **Prompt engineering is the core work** — gate evaluation criteria must produce consistent, interesting verdicts

## Acceptance Criteria

- [x] `/demo/taste-gate` page loads with gate selection UI
- [x] Entering a valid slug + selecting a gate streams a Claude verdict
- [x] Verdict displays as "You're in" or "Not quite" with reasoning
- [x] Reasoning references specific Crate data (slot titles, rationales, evolution arc)
- [x] "Not quite" verdicts include a constructive suggestion
- [x] Invalid slug → 404 error toast
- [x] Empty Crate → 422 error toast
- [x] Invalid gate → 400 error toast
- [x] Abort streaming on navigation or re-selection
- [x] At least 3 distinct gates with meaningful evaluation criteria

## Implementation Sequence

### Step 1: Gate definitions
**File:** `src/features/demo/lib/gates.ts`
- Define `TasteGate` type
- Export `TASTE_GATES` array with 3–4 gates
- Export `getGateById(id: string)` helper

### Step 2: Prompt builder
**File:** `src/features/demo/lib/taste-gate-prompt.ts`
- Export `buildTasteGatePrompt(canon, evolutions, gate)` — assembles Crate data + gate criteria + evaluation instructions
- Reuse `formatSlots` and `formatEvolutions` helpers (extract from `shopper-prompt.ts` into shared util, or inline)

### Step 3: API route
**File:** `src/app/api/demo/taste-gate/route.ts`
- `GET` handler following identical pattern to `src/app/api/demo/shopper/route.ts`
- Parse `slug` + `gate` query params
- Fetch canon + evolutions, build prompt, stream response

### Step 4: Client component
**File:** `src/features/demo/components/taste-gate-page.tsx`
- Two-phase UI: gate selection → streaming verdict
- Same streaming consumer pattern as `shopper-page.tsx`
- Parse `GateVerdict` JSON from stream

### Step 5: Page route
**File:** `src/app/demo/taste-gate/page.tsx`
- Async server component, `getOptionalSession()`, pass `defaultSlug`

## Verification

1. Start dev server: `pnpm dev`
2. Navigate to `/demo/taste-gate`
3. Enter a known slug (e.g., "matt") and select each gate
4. Verify streaming verdict renders with specific Crate references
5. Test error states: invalid slug, empty Crate, nonexistent gate
6. Verify abort on re-selection mid-stream

## Sources

- **Origin brainstorm:** [docs/brainstorms/2026-04-26-agent-crate-use-cases-brainstorm.md](../brainstorms/2026-04-26-agent-crate-use-cases-brainstorm.md) — Use Case 1: Taste Gate. Key decisions: brands set criteria + agent evaluates automatically; proof_of_human is trust layer; "read → verify → act" narrative.
- **Gift Finder pattern:** `src/app/api/demo/shopper/route.ts`, `src/features/demo/components/shopper-page.tsx`, `src/features/demo/lib/shopper-prompt.ts`
- **Canon data layer:** `src/features/canon/canon-service.ts` — `getCanonBySlug()`, `listEvolutionsBySlug()`
- **Domain types:** `src/features/canon/domain.ts` — `CanonRecord`, `CanonEvolutionRecord`, `formatSlots`, `formatEvolutions` patterns
- **Error handling:** `src/lib/http.ts` — `HttpError`, `handleRouteError`, `jsonError`
- **Design system:** `DESIGN.md` — card styles, Typography variants, spacing tokens
