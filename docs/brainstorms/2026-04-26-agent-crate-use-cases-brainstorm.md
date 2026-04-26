# Agent Crate API: Two New Use Cases for the Agentic Web

**Date:** 2026-04-26
**Status:** Ready for planning
**Builds on:** [Crate-Agent Taste Primitive](./2026-04-25-crate-agent-taste-primitive-brainstorm.md)

> **Context:** The Crate-Agent API (`GET /api/agent/[slug]/canon`) serves a signed V2 payload of a verified human's taste identity — 3 slots (Person, Place, Thing) with full evolution history. The first demo proved commercial potential with a Gift Finder (reactive personal shopper). These two new use cases push into proactive, social, and transactional territory — the future of agentic AI — while staying tightly aligned with World's infrastructure (World ID 4.0, AgentKit, AgentBook, World Chain).

## Use Case 1: Taste Gate — Crate as Cultural Credential

### What It Is

Your Crate becomes an admission ticket to curated experiences. Taste Gate extends World ID 4.0's `proof_of_human` from "are you a verified human?" to **"are you a verified human with this taste profile?"** — a new access control primitive for the cultural economy.

Examples:
- A supper club that admits based on food evolution history in your Thing/Place slots
- A brand drop gated by aesthetic credibility (your taste trajectory, not your follower count)
- A music festival VIP tier curated around attendees' shared taste arc
- Creator collaborations where verified taste identity = influence

### How It Works

1. **Brand/curator sets taste criteria** — registers parameters on AgentBook (e.g., "Thing slot must show design evolution," "Person slot in music/art domain")
2. **Crate-Agent evaluates eligibility** — the consuming agent reads the signed V2 payload and evaluates the taste trajectory against criteria automatically
3. **Proof of human is the trust layer** — World ID guarantees the taste data is from a unique real human, not a bot or sockpuppet
4. **Access granted on-chain** — the consuming agent's evaluation result (pass/fail) can be recorded on World Chain as a taste credential, decoupled from the raw Crate data

### Why This Matters

| Criteria | Assessment |
|----------|------------|
| **Business viability** | Very high — brands pay premium for verified, taste-matched audiences. No equivalent exists today. Follower counts are gameable; Crate evolution history is not. |
| **Creative & fun** | Very high — exclusivity + identity + culture. "Your taste got you in" is a fundamentally new flex. |
| **Expands World to new products** | Very high — luxury brands, curated dining, cultural institutions, festival organizers, independent creators. None of these are in World's current orbit. |
| **Drives DAUs** | Medium-high — gate events drive engagement spikes. More importantly, Crate curation becomes high-stakes ("I need to evolve my Thing slot before the drop"). |
| **Reaches new audiences** | Very high — the luxury/culture crowd, brand partners, Gen Z creators who value authenticity over follower metrics. |

### What Makes It Uniquely World-Aligned

- **World ID 4.0** — no other platform can prove "verified human + taste identity"
- **AgentBook** — discovery layer for brands finding taste-matched audiences
- **World Chain** — gating transactions (taste credential issuance)
- **World Chat** — sharing gated access with Taste Twins ("I got in — your Crate might qualify too")

### Demo Scope

**Route:** `/demo/taste-gate`

A page that proves the "Crate as credential" concept. The user enters any public Crate slug and selects from a set of predefined gates (e.g., "Michelin Supper Club," "Streetwear Drop," "Art Basel VIP"). The agent reads the Crate's V2 payload, evaluates the taste trajectory against the gate's criteria, and renders a verdict: **"You're in"** with taste-based reasoning explaining what qualified them, or **"Not quite"** with a specific explanation of what's missing. Uses the same Claude streaming pattern as the Gift Finder.

This demo proves: a Crate can function as a verifiable taste credential evaluated by an autonomous agent.

---

## Use Case 2: Taste Proxy — Autonomous Taste Delegate

### What It Is

Your Crate-Agent levels up from a passive data endpoint into a **semi-autonomous taste representative** that operates in the agentic web on your behalf. Other agents discover it on AgentBook, query it, and it can act within guardrails you set.

Your Taste Proxy:
- **Answers queries from other agents:** "What would Matt think of this restaurant?" → your proxy reasons from your Crate and responds
- **Scouts proactively:** monitors cultural feeds, new releases, events — pushes taste-matched discoveries to you via World Chat
- **Transacts within guardrails:** "Bid up to $50 on art drops that match my taste trajectory" — your proxy acts using its managed wallet on World Chain
- **Represents you in absentia:** when a brand, service, or another human's agent wants to understand your taste, your proxy speaks for you

### How It Works

1. **Built on existing Crate-Agent infrastructure** — same managed wallet (`AgentRegistryService`), same signed V2 payload, same AgentBook registration. The proxy IS the Crate-Agent with expanded capabilities.
2. **Other agents query via AgentBook** — discover your proxy, request taste data or ask taste-qualified questions
3. **Guardrails set by owner** — the human defines what the proxy can do autonomously (query responses, scouting alerts, transaction limits)
4. **World Chain transactions** — the proxy's managed wallet can execute within set boundaries (purchases, bids, reservations)

### Why This Matters

| Criteria | Assessment |
|----------|------------|
| **Business viability** | High — premium subscription for proxy capabilities. Transaction fees on autonomous purchases. Brands pay to query proxies at scale for market research. |
| **Creative & fun** | Very high — "I have a taste AI that shops for me" is the most Gen Z sentence imaginable. Your agent alter-ego operating in the world. |
| **Expands World to new products** | High — autonomous commerce, proactive discovery, agent-to-agent marketplace. Every service that wants to personalize can query Taste Proxies. |
| **Drives DAUs** | High — daily proactive notifications ("Your proxy found something"). Evolving your Crate changes what your proxy does. Reviewing proxy actions becomes a daily habit. |
| **Reaches new audiences** | Very high — AI-forward Gen Z, early adopters of agentic commerce, anyone who wants personalized discovery without the work. |

### What Makes It Uniquely World-Aligned

- **AgentKit** — the proxy is a first-class World agent with a registered wallet
- **AgentBook** — other agents discover and query your proxy
- **World Chain** — autonomous transactions within guardrails
- **World Chat** — notification channel for proxy discoveries and actions
- **World ID 4.0** — guarantees the proxy represents a unique verified human, not a bot swarm

### Demo Scope

**Route:** `/demo/taste-proxy`

A page that proves the "agent as taste representative" concept. The user enters a Crate slug and asks a free-text question about the person's taste (e.g., "Would they like the new A24 film?", "Pick a restaurant in Tokyo for them", "What's their next aesthetic obsession?"). The agent reads the Crate's V2 payload — including evolution history — and responds as the human's taste proxy: grounded in their actual data, referencing specific rationales and taste trajectory, but reasoning autonomously about new questions never explicitly covered by the Crate.

This demo proves: a Crate-Agent can act as a semi-autonomous taste delegate that reasons beyond the literal data.

**Infrastructure note:** The demo focuses on the queryable proxy pattern (request-response, same as Gift Finder). Proactive scouting and autonomous transactions require background agent infrastructure beyond the current serverless architecture — those are Phase 2+ capabilities.

---

## How the Three Use Cases Tell a Story

| Demo | Agent Behavior | What It Proves |
|------|---------------|----------------|
| **Gift Finder** (existing) | Reactive — user asks, agent answers | The Crate is a readable taste primitive |
| **Taste Gate** (new) | Evaluative — agent checks your taste against criteria | The Crate is a verifiable credential |
| **Taste Proxy** (new) | Autonomous — agent acts on your behalf in the world | The Crate is a living taste identity |

Together they show a progression: **read → verify → act**. Each step builds on the same V2 signed payload and World infrastructure, but demonstrates increasing agent sophistication.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Use case selection criteria | Business viability, creativity, ecosystem expansion, DAU impact, audience reach | Evaluated against World's growth priorities and Gen Z resonance |
| Taste Gate — who controls gates | Mix: brands set criteria, Crate-Agent evaluates automatically | Scales without human gatekeepers; proof_of_human is the trust layer |
| Taste Proxy — autonomy level | Semi-autonomous with owner-set guardrails | Most World-aligned (AgentKit + World Chain); responsible AI with human oversight |
| Relationship to existing demo | Progression narrative: read → verify → act | Each use case builds on the same primitive but shows increasing capability |
| Target audience lens | Gen Z | Entertainment/culture-first, authenticity over metrics, AI-native |

## Open Questions

*None — all questions resolved during brainstorming.*
