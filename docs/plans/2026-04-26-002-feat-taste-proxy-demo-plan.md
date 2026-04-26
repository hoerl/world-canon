---
title: "feat: Taste Proxy demo — autonomous taste delegate"
type: feat
status: active
date: 2026-04-26
origin: docs/brainstorms/2026-04-26-agent-crate-use-cases-brainstorm.md
---

# feat: Taste Proxy Demo — Autonomous Taste Delegate

## Overview

A demo page at `/demo/taste-proxy` that proves the "agent as taste representative" concept. A user enters any public Crate slug and asks a free-text question about the person's taste (e.g., "Would they like the new A24 film?", "Pick a restaurant in Tokyo for them", "What's their next aesthetic obsession?"). Claude reads the Crate's V2 payload — including evolution history — and responds **as the human's taste proxy**: grounded in their actual data but reasoning autonomously about questions the Crate never explicitly answered.

This is the third demo in the **read → verify → act** progression (see brainstorm: `docs/brainstorms/2026-04-26-agent-crate-use-cases-brainstorm.md`). The Gift Finder proved the Crate is *readable*, Taste Gate proves it's *verifiable*, Taste Proxy proves it's a *living taste identity* — an agent that can represent you.

## Problem Statement / Motivation

The Gift Finder asks "what gifts match this person's taste?" — a narrow, predefined question. The Taste Proxy answers **any question** about someone's taste, reasoning from the Crate data the way a close friend would. This demonstrates the Crate-Agent's potential as a semi-autonomous delegate: the foundation for agents that scout, negotiate, and transact on your behalf.

## Proposed Solution

Follow the identical architectural pattern as the Gift Finder and Taste Gate demos:

| Layer | Gift Finder | Taste Proxy |
|-------|-------------|-------------|
| Page route | `src/app/demo/shopper/page.tsx` | `src/app/demo/taste-proxy/page.tsx` |
| Client component | `src/features/demo/components/shopper-page.tsx` | `src/features/demo/components/taste-proxy-page.tsx` |
| API route | `src/app/api/demo/shopper/route.ts` | `src/app/api/demo/taste-proxy/route.ts` |
| Prompt builder | `src/features/demo/lib/shopper-prompt.ts` | `src/features/demo/lib/taste-proxy-prompt.ts` |
| New: sample questions | — | `src/features/demo/lib/proxy-questions.ts` |

### Prompt Architecture

This is the most interesting prompt in the trilogy — Claude must **become** someone's taste representative, not just analyze their taste.

The prompt builder assembles:

1. **Identity context** — "You are the taste proxy for {username}. You speak on behalf of their aesthetic sensibility."
2. **Crate data** — full slots + evolution history (reuse formatting helpers)
3. **Proxy instructions** — how to reason as a taste delegate:
   - Ground every claim in specific Crate data (cite slot titles, rationales, evolution events)
   - Infer beyond the literal data — a proxy reasons about new contexts using taste trajectory as signal
   - Acknowledge uncertainty when the Crate doesn't provide enough signal
   - Speak in third person ("Based on their Crate..." not "I like...")
4. **User's question** — the free-text query

**Claude response schema:**

```typescript
type ProxyResponse = {
  answer: string;           // 2-4 sentence response to the question
  confidence: 'high' | 'medium' | 'low';  // How much Crate data supports this
  crateReferences: string[]; // 1-3 specific Crate data points cited
};
```

### Sample Questions

A static module of suggested questions to inspire users. Displayed as tappable chips below the input field:

```typescript
const SAMPLE_QUESTIONS = [
  "Would they like the new A24 film?",
  "Pick a restaurant in Tokyo for them",
  "What's their next aesthetic obsession?",
  "Design their dream bookshelf",
  "What coffee order matches their vibe?",
  "Plan their ideal Saturday morning",
];
```

### API Route

`GET /api/demo/taste-proxy?slug=<slug>&question=<question>`

1. Parse `slug` and `question` from query params
2. Validate `question` is non-empty and under 500 chars — 400 if invalid
3. Fetch canon via `CanonService.getCanonBySlug(slug)` — 404 if not found
4. Validate at least one slot filled — 422 if empty
5. Fetch evolutions via `CanonService.listEvolutionsBySlug(slug)`
6. Build prompt via `buildTasteProxyPrompt(canon, evolutions, question)`
7. Stream Claude response via `client.messages.stream()`
8. Return `Content-Type: text/plain; charset=utf-8`

**Settings:** `claude-sonnet-4-6`, `max_tokens: 1024`, `temperature: 1` (full creativity — the proxy should feel alive)

### UI Component

`TasteProxyPage` — `'use client'` component with conversational feel:

**Input Section:**
- Slug input (pre-populated from session)
- Question input — larger text field with placeholder: "Ask anything about their taste..."
- Sample question chips below input — tapping one fills the question field
- Submit button (disabled during streaming)

**Response Section:**
- Streaming proxy response card
- Confidence indicator: `high` / `medium` / `low` as a subtle label (e.g., `Typography variant="label" level={2}`)
- Crate references as small chips showing which slot data was cited
- "Ask Another Question" to clear response and focus question input (keeps same slug)
- "Try Another Crate" to reset everything

**Conversational history (stretch):** Optionally keep previous Q&A pairs visible above the input, creating a conversation thread with the proxy. This is additive and can be cut for MVP.

**UI Kit components:** `SafeAreaView`, `Typography`, `Button`, `useToast()`, `Xmark` icon

## Technical Considerations

- **No database changes** — questions and responses are ephemeral
- **No new environment variables** — reuses `ANTHROPIC_API_KEY`
- **Question input sanitization** — URL-encode the question in the query param; server-side length limit (500 chars)
- **Prompt is the differentiator** — the proxy prompt is fundamentally different from Gift Finder/Taste Gate. It must balance grounding (cite real data) with inference (reason about new contexts). This is the hardest prompt engineering task of the three demos.
- **Streaming is plain text, not JSON** — unlike the Gift Finder which streams JSON objects, the proxy response is a single JSON object. The `extractCompleteObjects` pattern still works but will yield one object at the end of the stream. Consider streaming the `answer` field as raw text for faster perceived response, with `confidence` and `crateReferences` appended as a JSON suffix.

### Streaming Strategy

Two options for how Claude's response reaches the UI:

**Option A: Single JSON object (simpler, consistent with other demos)**
- Claude returns full `ProxyResponse` JSON
- Client buffers until complete, then renders
- Downside: user waits for full response before seeing anything

**Option B: Hybrid stream (better UX)**
- Instruct Claude to stream the answer as plain text first, then append `\n---\n` followed by JSON metadata (`confidence`, `crateReferences`)
- Client renders answer text incrementally, then parses metadata at the end
- More complex parsing but much better perceived speed

**Recommendation:** Start with Option A for MVP, upgrade to Option B if the wait feels too long.

## Acceptance Criteria

- [x] `/demo/taste-proxy` page loads with slug + question input
- [x] Sample question chips are tappable and fill the question field
- [x] Entering a valid slug + question streams a Claude proxy response
- [x] Response displays answer, confidence level, and Crate references
- [x] Response references specific Crate data (slot titles, rationales, evolution arc)
- [x] "Ask Another Question" clears response and keeps slug
- [x] Invalid slug → 404 error toast
- [x] Empty Crate → 422 error toast
- [x] Empty or too-long question → 400 error toast
- [x] Abort streaming on new question submission
- [x] At least 6 sample question suggestions displayed

## Implementation Sequence

### Step 1: Sample questions
**File:** `src/features/demo/lib/proxy-questions.ts`
- Export `SAMPLE_QUESTIONS` string array
- 6–8 diverse, fun questions that showcase what a taste proxy can do

### Step 2: Prompt builder
**File:** `src/features/demo/lib/taste-proxy-prompt.ts`
- Export `buildTasteProxyPrompt(canon, evolutions, question)` — assembles proxy identity + Crate data + question + response format instructions
- Reuse `formatSlots` and `formatEvolutions` helpers

### Step 3: API route
**File:** `src/app/api/demo/taste-proxy/route.ts`
- `GET` handler following identical streaming pattern
- Parse `slug` + `question` query params (URL-decode question)
- Fetch canon + evolutions, build prompt, stream response

### Step 4: Client component
**File:** `src/features/demo/components/taste-proxy-page.tsx`
- Slug input + question input + sample chips
- Same streaming consumer pattern
- Parse `ProxyResponse` JSON from stream
- Render answer + confidence + references

### Step 5: Page route
**File:** `src/app/demo/taste-proxy/page.tsx`
- Async server component, `getOptionalSession()`, pass `defaultSlug`

## Verification

1. Start dev server: `pnpm dev`
2. Navigate to `/demo/taste-proxy`
3. Enter a known slug (e.g., "matt") and try each sample question
4. Verify response cites specific Crate data and provides a grounded answer
5. Try a question where the Crate has minimal signal — verify confidence is "low" and proxy acknowledges uncertainty
6. Test "Ask Another Question" flow (keeps slug, clears response)
7. Test error states: invalid slug, empty Crate, empty question, 500+ char question
8. Verify abort on new question submission mid-stream

## Sources

- **Origin brainstorm:** [docs/brainstorms/2026-04-26-agent-crate-use-cases-brainstorm.md](../brainstorms/2026-04-26-agent-crate-use-cases-brainstorm.md) — Use Case 2: Taste Proxy. Key decisions: semi-autonomous with guardrails; queryable proxy pattern for demo (proactive scouting is Phase 2+); "read → verify → act" narrative.
- **Gift Finder pattern:** `src/app/api/demo/shopper/route.ts`, `src/features/demo/components/shopper-page.tsx`, `src/features/demo/lib/shopper-prompt.ts`
- **Canon data layer:** `src/features/canon/canon-service.ts` — `getCanonBySlug()`, `listEvolutionsBySlug()`
- **Domain types:** `src/features/canon/domain.ts` — `CanonRecord`, `CanonEvolutionRecord`
- **Error handling:** `src/lib/http.ts` — `HttpError`, `handleRouteError`, `jsonError`
- **Design system:** `DESIGN.md` — card styles, Typography variants, spacing tokens, button patterns
