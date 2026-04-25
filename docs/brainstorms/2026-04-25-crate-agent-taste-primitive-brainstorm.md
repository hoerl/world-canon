# Crate-Agent: Taste-Identity Primitive for the Agentic Web

**Date:** 2026-04-25
**Status:** Ready for planning

> **Utility:** Crate is a World Mini App where each verified human (World ID → `world_session_id`) maintains a 3-slot taste profile (Person, Place, Thing). The Crate-Agent enriches the existing signed canon endpoint with evolution history and a structured LLM context block, so any agent in the World ecosystem can read a human's taste, reason about it, and act on it — without Houston hosting inference. Built on `@worldcoin/agentkit` (x402 + AgentBook verification on World Chain), shared via `MiniKit.chat()` in World App.

## What We're Building

A Crate-Agent system that turns every verified human's Crate into a consumable taste-identity primitive for the agentic web. Other agents can read your Crate, reason about your taste, and act on your behalf.

**The narrative:** Every verified human has one Crate — their permanent taste profile. Other mini apps can read it. Your Crate-Agent speaks for it. World Chat shares it.

### Core Components

1. **Enriched Signed Canon Endpoint** — Extends the existing `GET /api/agent/[slug]/canon` to include full evolution history per slot and a structured context block (prompt template) that any LLM can consume.

2. **Demo Personal Shopper Agent** — A page within Houston (`/demo/shopper`) that proves the concept by reading a Crate and using Claude to curate a personalized gift list. Defaults to the authenticated user's Crate, with an option to enter any public slug.

3. **AgentBook Discovery** (Phase 2) — Improve registration and discoverability of Crate-Agents in the World agent ecosystem.

4. **World Chat Integration** (Phase 3) — Share your Crate in World Chat as an interactive card.

## Why This Approach

### Structured data primitive, not hosted intelligence

The Crate-Agent serves enriched structured data — consuming agents bring their own LLM. This is more durable than hosting an inference endpoint because:

- **Zero inference cost** for Houston at scale
- **No vendor lock-in** — any LLM can reason about the Crate
- **The Crate is the product**, not the model powering it
- Agents that want batteries-included reasoning can use the inline `prompt_template`

### Full evolution timeline as signal ("Things That Changed You")

The evolution history (what you picked before, what you pick now, when you changed) is included inline per slot rather than behind a separate endpoint. This is the "Things That Changed You" layer — taste isn't static, and the arc of change reveals more than any snapshot. Rationale:

- Each evolution is ~300 bytes — even heavy users stay under a few KB/year
- The narrative arc *is* the taste signal — an LLM can infer trajectory, openness to change, and depth of conviction
- One API call, one payload, full picture — zero-friction for consuming agents
- Timestamps alone are sufficient for pattern inference (no extra "why I changed" field needed)

### Prompt template as structured context, not persona

The `prompt_template` field provides a structured context block that describes what the Crate data represents and how to reason about it — but does **not** impose a persona (first-person, curatorial, etc.). This lets each consuming agent decide how to represent the user's taste for its specific use case.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Where intelligence lives | Consuming agents bring their own LLM | Zero cost, no lock-in, Crate-as-primitive philosophy |
| Evolution data format | Full timeline inline, per slot | Payload stays small, arc is the signal, one API call |
| Prompt template style | Structured context block, no persona | Consuming agents decide representation |
| MVP demo | Personal shopper (gift list from Crate) | Shows commercial potential, proves taste inference |
| Demo location | `/demo/shopper` page in Houston | Inline proof-of-concept, low friction |
| Demo LLM | Claude (Anthropic API) | Best reasoning for taste inference |
| Demo scope | Own Crate by default, any public slug optional | Shows both personal and social use cases |
| Endpoint access | Public by default | The whole point is agent-readability; opt-in privacy later |
| Phase order | Endpoint + demo → AgentBook → World Chat | Build the primitive first, then distribute |

## Enriched Payload Shape

```json
{
  "schema": "crate-agent-v2",
  "slug": "matt",
  "username": "Matt",
  "updated_at": "2026-04-20T...",
  "canon": {
    "person": {
      "current": { "title": "...", "rationale": "..." },
      "evolutions": [
        {
          "from": { "title": "...", "rationale": "..." },
          "to": { "title": "...", "rationale": "..." },
          "evolved_at": "2026-03-15T..."
        }
      ]
    },
    "place": { ... },
    "thing": { ... }
  },
  "evolutions_count": 7,
  "prompt_template": "This is a verified human's Crate — a taste profile with three slots (person, place, thing). Each slot has a current pick with rationale and an evolution history showing past picks with timestamps. The arc of changes reveals taste trajectory: what they moved away from, what they moved toward, and how quickly. Use the rationale fields to understand WHY, not just WHAT. Do not invent preferences beyond what the data shows. Do not adopt a persona — present taste insights in whatever voice suits your application.",
  "agent": {
    "address": "0x...",
    "registered": true,
    "registered_at": "2026-04-01T..."
  },
  "signature": "0x...",
  "signed_at": "2026-04-25T..."
}
```

## Phased Rollout

### Phase 1: Enriched Endpoint + Demo (this brainstorm's scope)
- Extend `/api/agent/[slug]/canon` to v2 payload with evolution history + prompt template
- Build `/demo/shopper` page with Claude-powered gift curation
- Add `ANTHROPIC_API_KEY` to env configuration

### Phase 2: AgentBook Discovery
- Improve agent registration UX
- Add Crate-Agent metadata to AgentBook listing
- Enable other agents to discover and query Crate-Agents

### Phase 3: World Chat Integration
- Share Crate as interactive card in World Chat
- Enable inline querying of someone's taste from chat

## Open Questions

*None — all questions resolved during brainstorming. See Key Decisions table above.*
