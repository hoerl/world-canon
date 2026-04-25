---
title: Polish v06 Design System & Component Consistency
type: feat
status: completed
date: 2026-04-25
---

# Polish v06 Design System & Component Consistency

> *"It should feel like holding a personal publication. Minimal chrome, strong typographic voice, generous white space that makes content breathe."* — `DESIGN.md`

## Overview

The v06 Figma artboards (Landing, Loading, App Home, Add to Crate, My Crate) raise the bar from "competent World Mini App" to "object you want to hold." The codebase is roughly 75% of the way there — the iridescent orb is excellent, the drawer flow exists, the typography ladder is sound — but the polish gap is where elite design lives: chat-style inline conversation in the editor, conversation-state stacking, the loading typographic morph, refined chrome (TopBar/BottomBar via UI Kit), tighter spacing, micro-interaction haptics, and a design system that names its invariants so future screens stay coherent.

This plan converts the v06 Figma intent into a concrete, phased implementation, **using only `@worldcoin/mini-apps-ui-kit-react` v1.6.0 primitives** (which already ship `ToggleGroupRoot`, `BulletList`, `TopBar`, `BottomBar`, `Pill`, `Haptic`, plus a 100+ icon set). No new dependencies. No custom design tokens beyond what `DESIGN.md` already declares.

## Problem Statement

Comparing the proposed v06 designs against current screenshots (IMG_8807–8814) and source (`src/features/`), six gaps hold the app back from a Mike-Matas-tier first impression:

1. **Add-to-Crate flow feels like a form, not a conversation.** Today: full-width `Input` + grey `Next` button. v06: chat-style inline send (paper-plane end adornment), with prior Q&A persisting above the active prompt as muted "messages." The drawer is *the* core authoring loop and currently feels generic.
2. **Bottom-of-screen chrome is hand-rolled.** `BottomNav` (`bottom-nav.tsx:6`) and the `MyCanonPage` header (`my-canon-page.tsx:110-140`) reimplement what UI Kit ships as `BottomBar` and `TopBar`. Result: subtly off pixel rhythm, lost World-App-default safe-area handling, and screen-to-screen inconsistency.
3. **Landing's value props are bespoke.** `ValueProp` in `landing-page.tsx:43` re-rolls `BulletListItem` from UI Kit by hand, with brittle string-newline glyphs (`①②③`).
4. **Iconography is inline-SVG everywhere.** Close, share, search, profile, send glyphs all live as inline `<svg>` paths with hand-tuned strokes (e.g., `my-canon-page.tsx:113-131`). UI Kit ships `@worldcoin/mini-apps-ui-kit-react/icons/regular` with `Airplane`, `Xmark`/`Close`, `MagnifyingGlass`, `User`, `ShareUp`, etc. — all stroke-balanced for the type ladder.
5. **No animated brand intro.** A static skeleton at `/me/loading.tsx` is the only loading state; the v06 typographic morph (dot → square → glitch → vertical "CRATE") doesn't exist. The Figma note says "save this for last" but it's still in-scope.
6. **Dead code and rebrand debt.** `PublicCanonPage`, `PublicCanonPanel`, `AddToMineDialog`, `CanonEditorForm`, `CanonProgressStepper`, `CanonHistoryFeed` are unreferenced; copy still says "Open Canon in World App" in `my-canon-page.tsx:68`. These dilute the codebase and slow future polish.

The cumulative effect: the app *works* but doesn't feel inevitable — and "feels inevitable" is the design bar.

## Proposed Solution

A three-phase polish pass that locks in invariants first (the design system), then ships the visible polish, then the brand-intro flourish.

- **Phase 1 — Foundations (the invariants):** Update `DESIGN.md` with explicit rules for chrome, conversation drawers, iconography, motion, and haptics. Replace all hand-rolled chrome with UI Kit `TopBar` / `BottomBar`. Replace inline SVGs with UI Kit `Icons`. Delete dead code and finish the Canon→Crate rebrand.
- **Phase 2 — Screen polish (the visible deltas):** Refactor `AddToCrateDrawer` into a **conversational stack** with inline send (paper-plane end adornment) and persistent muted Q&A history. Tighten `LandingPage` to use `BulletList`. Fix `BottomNav` "Add to Crate" pill contrast. Polish `MyCanonPage` chrome (in-card circular icon buttons, tighter rhythm). Add haptics on every save / category select / send.
- **Phase 3 — Brand intro (the flourish):** Implement the `BrandIntro` typographic-morph sequence (dot → square → glitch → vertical "CRATE") as pure CSS keyframes, rendered once on first authenticated entry, gated by a `sessionStorage` flag.

## Technical Approach

### Architecture

#### Design system invariants (added to `DESIGN.md`)

The canonical answer to "what component goes where" — so future screens don't drift:

| Surface | Single source of truth | Why |
|---|---|---|
| Page header | `TopBar` from UI Kit | Auto safe-area, slot rhythm, kit-conformant |
| Bottom nav / actions (mixed: 2 nav icons + 1 CTA, like v06) | `BottomBar` from UI Kit | 20px device-bottom gap; not all bottom rows are tabs |
| Section-switching nav (peer tabs, no center CTA) | `Tabs` + `TabItem` (controlled via `value` + `onValueChange`) | Kit-native; supports "With Links" pattern for App Router |
| Sequential exclusive choice (≤4 options, vertical) | Stacked `Button variant="tertiary"` | v06 stacked-pill aesthetic; ToggleGroup is for horizontal |
| Sequential exclusive choice (≤4 options, horizontal) | `ToggleGroupRoot type="single"` + `ToggleGroupItem` | Kit-native semantics |
| Numbered/icon-prefixed list (Landing, FAQ, etc.) | `BulletList` + `BulletListItem` (`bulletPoint={…}`) | Ships in kit |
| Tag/filter chip | `Chip` or `Pill` | Kit-native |
| Modal authoring flow | `Drawer` + `DrawerContent` (`rounded-t-3xl`) | World UX convention |
| Iconography (default) | `@worldcoin/mini-apps-ui-kit-react/icons/regular` | Stroke-balanced to type ladder |
| Iconography (active state on a tab/nav) | Pair `regular/<Glyph>` (inactive) with `solid/<Glyph>` (active) | Kit's "Active Icons" pattern — *the* tell of a polished mini app |
| Haptic feedback | `useHaptics()` hook (impact/selection/notification) | Single API |
| Brand intro / one-shot animations | CSS `@keyframes` in `globals.css` + Tailwind utility | No Lottie, no asset pipeline |

#### Spacing — 4px base system (authoritative)

Per the World UI Kit Storybook spacing docs (https://mini-apps-ui-kit.world.org/?path=/docs/documentation-spacing--docs), every dimension in the app must be a multiple of **4px**. The current `DESIGN.md` table has three values that conflict with the kit's authority and must be corrected.

| Token | Value | Where | Conflict in current `DESIGN.md`? |
|---|---|---|---|
| `--spacing-base` | 4px | The unit. Every other value is a multiple. | New (codify) |
| `page-padding` | 24px | Outer padding on all pages | ✅ matches |
| `top-to-title` | 64px | Top of safe area → page title (`Earth`, `My Crate`, `What Inspires You?`) | New (not in DESIGN.md) |
| `title-to-subtitle` | 16px | Page title → subtitle (`Connected`, `Last updated 1m ago`) | New |
| `header-to-content` | 16px | Header block → first content | ✅ matches |
| `header-to-search` | 16px | Header → search bar | New |
| `subhead-to-content` | 16px | Sub-headline → content below | ✅ matches |
| `section-gap` | **40px** | Between major sections | ❌ DESIGN.md says 32px — **fix to 40px** |
| `element-gap` | 16px | Between elements within a section | ✅ matches |
| `keyboard-gap` | 24px | CTA → active keyboard | ✅ matches |
| `button-bottom-safe` | **32px** | Button → iOS bottom safe area (no keyboard) | ❌ DESIGN.md says 24px — **fix to 32px** |
| `bottom-menu-bottom` | **20px** | Bottom menu / tab bar → iOS bottom safe area | ❌ DESIGN.md says 12px — **fix to 20px** |
| `bottom-menu-top` | 8px | Top of bottom menu → content above (minimum) | New |

**Tailwind mapping** (encoded in `src/app/globals.css` under `@theme`):

```
--spacing-1: 4px;   /* tw: 1   — atomic */
--spacing-2: 8px;   /* tw: 2   — bottom-menu top breathing room */
--spacing-3: 12px;  /* tw: 3   — small element-to-element */
--spacing-4: 16px;  /* tw: 4   — element-gap, header-to-content, title-to-subtitle */
--spacing-5: 20px;  /* tw: 5   — bottom-menu-bottom (NEW) */
--spacing-6: 24px;  /* tw: 6   — page-padding, keyboard-gap */
--spacing-8: 32px;  /* tw: 8   — button-bottom-safe (NEW) */
--spacing-10: 40px; /* tw: 10  — section-gap (NEW canonical value) */
--spacing-16: 64px; /* tw: 16  — top-to-title */
```

Then enforce: **no raw pixel literals** (`px-[18px]`, `mt-[36px]`, etc.) anywhere in `src/`. Every dimension must come from this scale. The `app-top-bar.tsx` and `app-bottom-bar.tsx` wrappers from Phase 1 own the safe-area math so consumers never have to think about it.

#### `Button` — canonical use map

The kit's `Button` ships **3 variants × 3 sizes = 9 valid combinations**, but only ~5 of them belong in Crate. Naming each one's job here prevents drift.

| Use case | Variant | Size | `fullWidth` | Example in plan |
|---|---|---|---|---|
| Primary screen CTA (Get Started, Save, Add to Crate) | `primary` | `lg` | `true` (in flow) / omit (in BottomBar pill) | Landing CTA, drawer Save, BottomBar center |
| Stacked exclusive choice (Person/Place/Thing) | `tertiary` | `lg` | `true` | `AddToCrateDrawer` step 1 |
| Circular icon-only action (close, share, back, send) | `tertiary` | `icon` | n/a | All `TopBar` adornments, drawer close, paper-plane end-adornment |
| Secondary action paired with a primary (Cancel + Save in a future dialog) | `secondary` | `lg` | as needed | Reserved — no current use |
| Compact in-line action (e.g., a row "Edit" button in History) | `tertiary` | `sm` | omit | Reserved — no current use |

**`Pill` is not a button — it's a filter/tag chip.** `Pill` has `checked: boolean` (toggleable state) and lacks a `size` variant. Don't reach for `Pill` for icon-only action buttons; reach for `Button size="icon" variant="tertiary"`.

#### Bottom navigation: `BottomBar` vs `Tabs` (when to use which)

The kit ships both `BottomBar` and `Tabs` and they look superficially similar, but they have *different intent*:

- **`BottomBar`** is a layout shell — three (or N) free-form slots, often used for "two nav icons + one primary CTA" patterns like v06's Earth screen. Slots can be heterogeneous: an icon button, a `Button variant="primary"` pill, a link.
- **`Tabs`** is a navigation primitive — N peer destinations, all with the same shape (icon + label). Controlled via `value` + `onValueChange`. Supports the "With Links" variant where each `TabItem` wraps a `next/link` `<Link>` for App-Router-friendly routing.

**Decision rule for Crate:**

- v06's bottom row (🔍 search · `[Add to Crate]` pill · 👤 profile) is **`BottomBar`**, *not* tabs. The center CTA is the primary action, not a peer destination — `Tabs` would force it into a uniform shape and lose the visual emphasis.
- *If* a future section-switcher emerges (e.g., the Earth screen gains a "Person | Place | Thing" filter, or a top-level "Discover | Mine" toggle), that becomes `Tabs` with the "Active Icons" pattern. Today, no such surface exists.

**Active Icons pattern (mandatory for any tab/nav icon with active state):**

The kit recommends pairing `regular/<Glyph>` (inactive, outlined) with `solid/<Glyph>` (active, filled). For Crate, this applies to two places today:

1. The profile icon in `BottomBar`: render `solid/User` when the route is `/me`, `regular/User` otherwise — using `usePathname()` from `next/navigation`.
2. Any future tab nav: same rule, baked into `Tabs` consumers.

This is the single highest-leverage detail for "feels like a real iOS app" — the difference between a hand-rolled outline glyph everywhere and a route-aware solid/outline pair is the difference between "AI-generic" and Mike-Matas-tier polish.

#### Conversation pattern for `AddToCrateDrawer`

The drawer becomes a state machine over an append-only list of "turns":

```
Turn = { question: string; answer: string | null; muted: boolean }
turns = [
  { question: 'What Inspires You?', answer: category, muted: true },     // step 1 result
  { question: categoryQuestion, answer: title, muted: title !== '' },     // step 2
  { question: 'Why do they matter to you?', answer: rationale, ... },     // step 3 (active)
]
```

Render rule: every turn renders as a stacked Q/A pair. The *last* turn is "active" — its answer field is an `Input` with a paper-plane end adornment; pressing Enter or tapping the plane advances. Earlier turns are "muted" (text-gray-400 question + text-gray-500 answer). This matches the v06 step-2 and step-3 artboards exactly.

#### Brand intro animation (Phase 3)

A 6-keyframe CSS-only sequence, ~1.6s total, mounted once via:

```
src/features/ui/brand-intro.tsx  // 'use client', single export <BrandIntro onComplete={...} />
```

State: `sessionStorage.setItem('crate.intro.played', '1')` after first run; root layout only mounts `<BrandIntro>` if the flag is unset *and* the user is authed (never on Landing — Landing has its own value prop layout). Animation uses `transform` + `opacity` only (compositor-cheap), with `prefers-reduced-motion` collapsing the whole sequence to a 200ms fade.

### Implementation Phases

#### Phase 1 — Foundations (1–2 days)

**Goal:** Lock invariants. Make the codebase ready for visible polish.

Files to modify / create:

- `DESIGN.md` — (a) **correct three spacing conflicts** (section-gap 32→40px, button-bottom-safe 24→32px, tab-bar gap 12→20px) per the kit Storybook; (b) add the full 4px-base scale table from this plan's "Spacing" section; (c) append new sections: "Chrome", "Conversation drawers", "Iconography", "Motion & haptics", "Component decision matrix"
- `src/app/globals.css` — add `@theme` block with `--spacing-1` through `--spacing-16` (4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 64 px) so Tailwind utilities `px-5`, `mt-10`, `pb-16` map to the correct kit-canonical values
- `src/features/ui/bottom-nav.tsx` → **delete**, replace with `src/features/ui/app-bottom-bar.tsx` using `BottomBar` from UI Kit
- `src/features/ui/top-bar.tsx` — new, thin wrapper around `TopBar` that fixes the start/end adornment slot patterns (close left, share/send right, optional profile-avatar)
- Replace inline SVGs:
  - `my-canon-page.tsx:113-131` (close X + share up arrow) → `Xmark`, `ShareUp` from `icons/regular`
  - `bottom-nav.tsx:18-21,37-40` (search, profile) → `MagnifyingGlass`; profile uses **Active Icons pair**: `regular/User` when route ≠ `/me`, `solid/User` when route = `/me` (use `usePathname()` from `next/navigation`)
  - `add-to-crate-drawer.tsx:110-112` (close X) → `Xmark`
  - `drawer-nav.tsx` back arrow → `ArrowLeft` from `icons/regular`
- Delete dead code (one PR):
  - `src/features/canon/components/public-canon-page.tsx`
  - `src/features/canon/components/public-canon-panel.tsx`
  - `src/features/canon/components/canon-slot-card.tsx`
  - `src/features/canon/components/add-to-mine-dialog.tsx`
  - `src/features/canon/components/canon-editor-form.tsx`
  - `src/features/canon/components/canon-progress-stepper.tsx`
  - `src/features/canon/components/canon-history-feed.tsx`
  - `src/features/earth/components/earth-category-list.tsx` (verify zero imports first)
  - `src/app/u/[slug]/page.tsx` (decide with stakeholder; the public Crate may be deferred, not deleted — flag in PR)
- Rebrand finish:
  - `my-canon-page.tsx:68` "Open Canon in World App to share." → "Open Crate in World App to share."
  - `src/features/canon/domain.ts:58` `slugifyCanonUserName` rename → `slugifyCrateUserName`, audit call sites
  - Grep `Canon` (case-sensitive, code-only) and triage: type names like `CanonRecord` are fine internally; user-facing strings are not.

**Deliverable:** PR titled `chore: design-system foundations + dead code cleanup`. No visual diff except cleaner chrome.

#### Phase 2 — Screen polish (3–5 days)

**Goal:** Ship the visible v06 deltas.

##### 2.1 `AddToCrateDrawer` → conversational stack
File: `src/features/canon/components/add-to-crate-drawer.tsx` (full refactor)

- Replace the `step: 1 | 2 | 3` state machine with a `turns: Turn[]` reducer (see Architecture above).
- Step 1 (category chooser): keep as 3 stacked `Button variant="tertiary" fullWidth` (vertical exclusive choice rule). Apply `useHaptics().selection()` on tap.
- Steps 2–3 (Q&A): single render path. Each turn renders muted; last turn renders active with `Input` + end-adornment `<button>` containing `<Airplane />` icon. End-adornment fires `submitTurn()`. Disabled state when input is empty.
- On final submit: `useHaptics().notification('success')` before toast.
- Drawer height: anchor to content (`min-h-[60vh]` on step 1; `min-h-[80vh]` once keyboard is up so the stack has breathing room) — fixes the visual "drawer feels short" issue in IMG_8808.
- Header: small centered "What Inspires You?" subtitle (`Typography variant="subtitle" level={2}`) with circular close-X using `Button size="icon" variant="tertiary"` + `<Xmark />` (replaces hand-rolled close button).

##### 2.2 `LandingPage` → `BulletList`
File: `src/features/ui/landing-page.tsx`

- Replace the local `ValueProp` helper with `BulletList` + 3× `BulletListItem`.
- Pass numbered glyphs as `bulletPoint={<span className="text-gray-400 text-sm">①</span>}`.
- Keep `Typography variant="display" level={1}` for "Real / Human / Curation" — but render as three `<span>` children with explicit `display: block` rather than `\n` literal (cleaner line-break semantics).
- "Get Started" CTA: keep `AuthButton`, but verify it renders as `Button variant="primary" size="lg" fullWidth`. If not, refactor.

##### 2.3 `BottomNav` → `app-bottom-bar.tsx`
File: `src/features/ui/app-bottom-bar.tsx` (new, replaces `bottom-nav.tsx`)

- Use `BottomBar direction="horizontal"` from UI Kit (chosen over `Tabs` per the "Bottom navigation: BottomBar vs Tabs" rule above — center CTA is not a peer tab).
- 3 slots: search (`MagnifyingGlass`, currently disabled — keep disabled but visible), "Add to Crate" `Button variant="primary" size="lg"` pill, profile link (Active Icons pair: `regular/User` when on Earth, `solid/User` when on `/me`, derived from `usePathname()`).
- **Fix the contrast bug** visible in IMG_8807: the "Add to Crate" pill renders as a black silhouette with no visible text. Root cause hypothesis: when the `BottomNav` is the BottomBar slot inside World's native `Crate ⌄` chrome (dark), the inherited `color` cascades over `text-white`. Wrapping in `BottomBar` gets us the kit's default isolation. Verify in Storybook before merging.

##### 2.4 `MyCanonPage` chrome
File: `src/features/canon/components/my-canon-page.tsx`

- Replace hand-rolled `<header>` (lines 110-140) with `TopBar`:
  ```
  <TopBar
    title="My Crate"
    startAdornment={<Pill size="icon" onClick={…}><Xmark /></Pill>}
    endAdornment={<Pill size="icon" onClick={shareCanon}><ShareUp /></Pill>}
  />
  ```
- Move "Last updated 1m ago" into a tight subtitle row below `TopBar` (`Typography variant="body" level={3} className="text-gray-400 text-center mt-1"`).
- Tighten the dark square placeholder: keep `bg-gray-900` but change `rounded-lg` → `rounded-2xl` (matches v06 corner radius), and reduce mb from `mb-6` to `mb-5` so the 3-item stack is closer (matches v06 rhythm).
- Replace the bottom "Add to Crate" hand-rolled `<button>` with `Button variant="primary" size="lg"`.

##### 2.5 Error toast dedup
File: `src/features/canon/components/my-canon-page.tsx:75`

- IMG_8814 shows duplicate error UI: World App's native "Unable to send / Please try again" + our "Chat failed: send_failed" toast. The native toast is sufficient and styled correctly.
- When `MiniKit.chat()` rejects, **suppress our toast** if `error.message.startsWith('send_failed')` (or whatever the MiniKit-emitted error code is) — World App is already telling the user. Only toast for app-level failures (`!MiniKit.isInWorldApp()`, network errors, etc.).
- Confirm the error code shape via a quick spike before locking the suppress condition.

**Deliverable:** PR titled `feat: v06 screen polish — drawer conversation, bottom bar, my crate chrome`. Visual diff is the bulk of the work.

#### Phase 3 — Brand intro (1–2 days, can ship independently)

**Goal:** The typographic morph that makes the first run feel inevitable.

Files to create:

- `src/features/ui/brand-intro.tsx` — client component, prop `onComplete: () => void`, internally runs the keyframe sequence and calls `onComplete()` on `animationend` of the final stage
- `src/app/globals.css` — append the keyframe definitions:
  - `@keyframes intro-dot-grow` (0.3s, scale 0 → 1)
  - `@keyframes intro-square-morph` (0.3s, scale + skew toward letter shape)
  - `@keyframes intro-glitch` (0.4s, multi-step transform with hue-rotate filter for the v06 "broken letters" stage)
  - `@keyframes intro-resolve` (0.5s, opacity + transform converging to vertical "CRATE")
  - `@media (prefers-reduced-motion: reduce)` block: collapse to a single 200ms fade
- Mount logic in `src/features/earth/components/home-page.tsx`:
  ```
  const [introDone, setIntroDone] = useState(() =>
    typeof window === 'undefined' ? true : sessionStorage.getItem('crate.intro.played') === '1'
  );
  if (!session) return <LandingPage />;
  if (!introDone) return <BrandIntro onComplete={() => {
    sessionStorage.setItem('crate.intro.played', '1');
    setIntroDone(true);
  }} />;
  // …existing Earth screen
  ```
- Rendering note: the vertical "CRATE" stack uses `writing-mode: vertical-rl` is *wrong* (rotates glyphs 90°) — instead use individual `<span>` per letter inside a flex column with `text-align: center`, each letter sized via `Typography variant="display" level={1}`. The Figma shows upright glyphs stacked.

**Deliverable:** PR titled `feat: BrandIntro typographic morph (gated, sessionStorage)`.

## Alternative Approaches Considered

1. **Use `Marble` from UI Kit for the orb.** Rejected: `Marble` is a `<img>` ForwardRef — it expects a static image source. The current `EarthSphere` (CSS radial gradient + draggable hue rotation) is *dynamically* iridescent and interactive, which v06 implies. Don't downgrade to a static asset.
2. **Use `ToggleGroupRoot type="single"` for the Person/Place/Thing chooser.** Rejected for vertical stacked layout: `ToggleGroupRoot` from Radix renders horizontally by default and styling it vertical fights the kit's defaults. Stacked `Button variant="tertiary"` with the kit's selection-haptic gives the right feel. Keep `ToggleGroup` in the toolkit doc for future horizontal selectors.
3. **Lottie/JSON animation for the brand intro.** Rejected: adds a runtime dep, an asset pipeline, and ~30KB to the bundle for ~1.6 seconds of motion. CSS keyframes nail it natively, respect `prefers-reduced-motion` for free, and stay editable in code.
4. **Move the dev gear icon (Eruda) behind a long-press gesture.** Rejected as out-of-scope — Eruda is already gated by `NEXT_PUBLIC_APP_ENV !== 'production'` (verified in `src/providers/Eruda/eruda-provider.tsx:10`). It only appears in screenshots because they were captured against staging. No code change needed; just confirm production builds set the env.
5. **Single full-screen page for Add to Crate (current pattern).** Rejected: v06 explicitly shows a bottom sheet, and the "conversation persists above active prompt" requires the orb + Earth content to remain visible behind the drawer for context.

## System-Wide Impact

### Interaction Graph

- **Add to Crate save flow:** `submitRationale()` → `PUT /api/canon/[category]` → `CanonService.saveSlot()` (Drizzle insert/update on `canon_items`) → append row in `canon_evolutions` → response 200 → drawer fires `useHaptics().notification('success')` → `toast.success({ title: 'Added to your crate.' })` → `router.refresh()` → server re-renders `MyCanonPage` and `HomePage` (Earth aggregation re-runs in `EarthService.getEarth()`).
- **TopBar / BottomBar swap:** purely presentational — no API or data path touched.
- **Brand intro mount:** runs only client-side after hydration; no SSR impact (sessionStorage is gated by `typeof window`).

### Error & Failure Propagation

- **Drawer save failure:** today, `add-to-crate-drawer.tsx:88` catches `error instanceof Error` and toasts the message; non-Error throws fall back to "Failed to save". This stays correct after refactor — the conversation reducer only commits a turn after the API resolves successfully.
- **Share failure:** `MiniKit.chat()` rejection currently double-toasts (IMG_8814). Phase 2.5 fixes by inspecting the error code and suppressing our toast when World App handles the error itself.
- **Brand intro animation crash / never-firing `animationend`:** mitigation — wrap the `setIntroDone(true)` call in a `setTimeout` failsafe at total animation duration + 500ms. Always advance.

### State Lifecycle Risks

- **`sessionStorage` flag for brand intro** persists for the tab session only — re-runs on a fresh tab. Acceptable: it's a brand moment, not a critical UX gate. Do *not* persist to `localStorage` (would never re-show on app updates, which we likely want post-rebrand-events).
- **Drawer `turns` reducer**: today's `step` state is reset in `useEffect(() => { if (!isOpen) reset() }, [isOpen])` (line 39-46). Carry the same reset semantics on `turns` — close means clear all turns.
- **Dead-code deletion**: `PublicCanonPage` and `/u/[slug]/page.tsx` removal needs a stakeholder check first — public Crate share URLs in the wild may 404 if removed entirely. Recommendation: keep the route but render a minimal "Crate moved to chat" stub until a public-share v2 design exists.

### API Surface Parity

- No API changes. All `/api/canon/*`, `/api/auth/*`, `/api/worldid/*`, `/api/agent/*` endpoints remain unchanged.
- Public read flow (`PublicCanonPage`) is the only consumer of the slug route; if we keep `/u/[slug]` as a stub, the existing `GET /api/canon/[identifier]` endpoint is untouched.

### Integration Test Scenarios

Cross-layer scenarios that mocked unit tests would miss:

1. **Drawer conversation persistence across keyboard show/hide on iOS.** Open drawer, advance to step 2, focus input, dismiss keyboard, refocus input — turns array must remain intact and the input must regain focus without losing typed text.
2. **`MiniKit.chat()` failure path with native toast suppression.** Mock `MiniKit.chat()` to throw a `send_failed`-coded error and assert *no* `useToast.error` is called. Then mock with a network error and assert toast *is* called.
3. **Brand intro skip on second mount within same session.** Render `<HomePage>` with a session, observe intro plays. Rerender with same session — observe intro is bypassed (sessionStorage hit).
4. **Reduced-motion preference.** With `prefers-reduced-motion: reduce`, the intro's total runtime collapses to ≤300ms (vs ~1600ms baseline) and `onComplete` still fires.
5. **Tab navigation without `BottomBar`.** Navigate `/` → `/me` → `/` and confirm `BottomBar` (now from UI Kit) preserves the active route highlight and 12px device-bottom gap on both iOS-safe-area and web-with-no-inset.

## Acceptance Criteria

### Functional Requirements

- [ ] `DESIGN.md` lists the component decision matrix (chrome, drawer pattern, icon source, motion).
- [ ] `bottom-nav.tsx` is replaced by `app-bottom-bar.tsx` using `BottomBar`; "Add to Crate" pill text is legible against any backdrop (white text always renders).
- [ ] `MyCanonPage` uses `TopBar` with `Button size="icon" variant="tertiary"` adornments for close + share.
- [ ] `LandingPage` uses `BulletList` + `BulletListItem` for the 3 numbered steps.
- [ ] `AddToCrateDrawer` renders as a conversational stack: prior Q/A appear muted above the active prompt; active prompt has a paper-plane end-adornment send button; Enter submits; haptic fires on every send.
- [ ] All hand-rolled inline `<svg>` icons in `my-canon-page.tsx`, `bottom-nav.tsx`, `add-to-crate-drawer.tsx`, `drawer-nav.tsx` are replaced with UI Kit `Icons` (`Xmark`, `ShareUp`, `Airplane`, `MagnifyingGlass`, `User`, `ArrowLeft`).
- [ ] Dead components are deleted: `PublicCanonPanel`, `CanonSlotCard`, `AddToMineDialog`, `CanonEditorForm`, `CanonProgressStepper`, `CanonHistoryFeed`, `EarthCategoryList` (after verifying zero imports).
- [ ] `MyCanonPage` share-failure path no longer double-toasts when World App emits its own error toast.
- [ ] `BrandIntro` plays once per session on first authed mount; honors `prefers-reduced-motion`; skipped on Landing.
- [ ] Rebrand finish: no user-facing string contains the word "Canon" except where intentional (e.g., archive metadata).

### Non-Functional Requirements

- [ ] Initial load to interactive ≤2s on mid-tier mobile (per World guidelines).
- [ ] Subsequent screen transitions ≤1s (per World guidelines).
- [ ] All tap targets ≥44×44px (current `Button size="icon" variant="tertiary"` and `Button` defaults satisfy this).
- [ ] `prefers-reduced-motion: reduce` collapses the brand intro to ≤300ms.
- [ ] Bundle size impact ≤+5KB gzipped (no new deps; only CSS keyframes added).
- [ ] All UI Kit `Typography` variants used per `DESIGN.md`'s ladder; no raw `font-size` Tailwind classes outside the UI Kit's mapping.
- [ ] **Spacing audit clean:** `grep -rE "(p|m|gap|space-y|space-x)-\[" src/` returns zero arbitrary-pixel hits. Every dimension uses the 4px scale (`tw: 1/2/3/4/5/6/8/10/16` only).
- [ ] **Active Icons pattern wired** for the profile glyph in `app-bottom-bar.tsx`: route-aware swap between `regular/User` and `solid/User` using `usePathname()`. Verify the swap is instant (no flash) on `/me` ↔ `/` navigation.
- [ ] All five core screens measured against the 4px scale: page-padding 24px, top-to-title 64px, title-to-subtitle 16px, section-gap 40px, button-bottom-safe 32px, bottom-menu-bottom 20px. Use Chrome devtools "show ruler" or screenshot diff against the v06 artboards.

### Quality Gates

- [ ] `pnpm lint` passes.
- [ ] `pnpm test` passes (existing Vitest suite).
- [ ] Manual QA on iOS Safari + Android Chrome inside World App (staging).
- [ ] Visual regression check: each of Landing, Home, Add to Crate (steps 1–3), My Crate, Brand Intro screenshotted and compared side-by-side with the v06 Figma artboards.
- [ ] `DESIGN.md` PR-reviewed by design owner before Phase 2 merges.

## Success Metrics

- **First-run completion rate** (Landing → first canon item saved): target +20% (qualitative — measured against current cohort if analytics are wired; otherwise ship and re-measure).
- **Drawer drop-off between step 1 and step 3**: target ≤30% (today: unmeasured; instrument with a single client event per advance).
- **Time-to-first-add** from authed entry: target ≤30 seconds median.
- **Visual consistency score** (qualitative): all five core screens use UI Kit `TopBar` / `BottomBar` / `BulletList` / `Drawer` — i.e., zero hand-rolled chrome remains in the polished surface.

## Dependencies & Prerequisites

- `@worldcoin/mini-apps-ui-kit-react` v1.6.0 (already installed).
- World App staging build for QA.
- Design-owner review of `DESIGN.md` updates (Phase 1 gates Phase 2).
- Stakeholder decision on `/u/[slug]` public-share future before any deletion (else stub it).

## Risk Analysis & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `BottomBar` from UI Kit conflicts with existing `SafeAreaView` flexbox layout | M | M | Spike Phase 1: render BottomBar inside SafeAreaView in Storybook before refactoring all consumers |
| Drawer height anchoring fights iOS keyboard avoidance | M | H | Test with `min-h-[80vh]` + `pb-[env(keyboard-inset-height)]`; fall back to fixed `h-[85dvh]` if dvh support is solid |
| Brand intro feels gimmicky if it plays too often | L | M | sessionStorage gate + reduced-motion fallback; consider `localStorage` with a versioned key if telemetry shows annoyance |
| Dead-code deletion breaks `/u/[slug]` for users with shared links in the wild | L | H | Stub the route with a "shared via Crate" placeholder rather than deleting outright; coordinate with stakeholder |
| Inline SVG → kit `Icons` swap loses pixel-perfect tuning on specific glyphs | L | L | Side-by-side screenshot diff; if a kit glyph drifts visibly from v06, accept it (Mike-Matas-tier means *consistent* > pixel-perfect-bespoke) |
| `MiniKit.chat()` error code shape isn't `send_failed`-prefixed | M | L | Phase 2.5 starts with a 30-min spike before locking the suppress condition |

## Resource Requirements

- 1 senior frontend engineer × 5–7 working days across all three phases
- Design owner: ~2 hours review (DESIGN.md + visual regression checkpoint)
- QA: ~half-day on staging across iOS + Android in World App

## Future Considerations

- **Public Crate v2.** If `/u/[slug]` is stubbed in this plan, a follow-up plan should redesign the public-share surface — likely a single-card OpenGraph-optimized landing that nudges to install World App.
- **Onboarding tour.** With the conversation-style drawer in place, an optional first-time tour could highlight "tap the orb" and "tap Add to Crate" as ghost coachmarks. Out of scope here.
- **Localization.** Per `DESIGN.md` and World guidelines, EN/ES/TH/JA/KO/PT are priority. The conversational drawer's question strings should move to `i18n` keys early — propose in a follow-up.
- **Earth ranking interactivity.** Today the rankings are a static read; v06 hints at top-3 per category. A future phase could let users tap a row to see the surface canon entry.
- **Agent deploy UX.** "Deploy Agent >" is currently a one-tap action with no visible state. Future polish: progress chip + cards for "Provisioning", "Registering", "Live".

## Documentation Plan

- `DESIGN.md`: append new sections (chrome, conversation drawers, iconography, motion & haptics, component decision matrix). Cross-link from `architecture.md`.
- `architecture.md`: no change (this is a polish pass; no architectural reshaping).
- Storybook (if added later): every kit primitive used by Crate gets a story page demonstrating Crate-specific usage. *Out of scope for this plan; flag for a future infra ticket.*

## File-by-File Change Summary

### New files

- `src/features/ui/app-bottom-bar.tsx`
- `src/features/ui/app-top-bar.tsx`
- `src/features/ui/brand-intro.tsx` (Phase 3)

### Modified files

- `DESIGN.md` — new sections
- `src/app/globals.css` — keyframes (Phase 3)
- `src/features/ui/landing-page.tsx` — `BulletList` migration
- `src/features/canon/components/add-to-crate-drawer.tsx` — full conversation refactor
- `src/features/canon/components/my-canon-page.tsx` — `TopBar`, error dedup, rebrand strings
- `src/features/earth/components/home-page.tsx` — mount `BrandIntro` (Phase 3)
- `src/features/canon/domain.ts` — rename `slugifyCanonUserName`

### Deleted files

- `src/features/ui/bottom-nav.tsx`
- `src/features/canon/components/public-canon-panel.tsx`
- `src/features/canon/components/canon-slot-card.tsx`
- `src/features/canon/components/add-to-mine-dialog.tsx`
- `src/features/canon/components/canon-editor-form.tsx`
- `src/features/canon/components/canon-progress-stepper.tsx`
- `src/features/canon/components/canon-history-feed.tsx`
- `src/features/earth/components/earth-category-list.tsx` (after verification)
- `src/features/canon/components/public-canon-page.tsx` (only after stakeholder review on `/u/[slug]`)
- `src/app/u/[slug]/page.tsx` (only if route stubbed elsewhere; otherwise keep as stub)

## Sources & References

### Internal references

- Current design system: `DESIGN.md`
- Architecture overview: `architecture.md`
- World UI Kit exports (verified locally): `node_modules/@worldcoin/mini-apps-ui-kit-react/dist/index.d.ts`
- Earth orb implementation: `src/features/earth/components/earth-sphere.tsx:36`
- Drawer flow: `src/features/canon/components/add-to-crate-drawer.tsx:25`
- My Crate: `src/features/canon/components/my-canon-page.tsx:47`
- Landing: `src/features/ui/landing-page.tsx:6`
- Bottom nav: `src/features/ui/bottom-nav.tsx:6`
- Provider stack: `src/providers/index.tsx`
- Loading skeleton (today): `src/app/me/loading.tsx`

### External references

- World Mini App design guidelines: https://docs.world.org/mini-apps/guidelines/design-guidelines
- World UI Kit Storybook (live): https://mini-apps-ui-kit.world.org/
- World UI Kit Spacing (4px system, **authoritative**): https://mini-apps-ui-kit.world.org/?path=/docs/documentation-spacing--docs
- World UI Kit ToggleGroup docs: https://mini-apps-ui-kit.world.org/?path=/docs/components-togglegroup--docs
- World UI Kit Tabs / TabItem docs (Active Icons pattern, "With Links" variant): https://mini-apps-ui-kit.world.org/?path=/docs/components-tabs--docs
- World UI Kit Button docs (variants: `primary`/`secondary`/`tertiary`, sizes: `sm`/`lg`/`icon`): https://mini-apps-ui-kit.world.org/?path=/docs/components-button--docs
- Mike Matas design philosophy (referenced in `DESIGN.md`): content-first, physical-feeling interfaces
- Irma Boom design philosophy (referenced in `DESIGN.md`): bold typography, editorial density

### Design artboards (provided)

- `.context/attachments/v06 - App Landing.png`
- `.context/attachments/v06 - App Home.png`
- `.context/attachments/v06 - Add to Crate.png`
- `.context/attachments/v06 - App Loading ✅.png`
- `.context/attachments/v06 - My Crate.png`

### Current-state screenshots (provided)

- `.context/attachments/IMG_8807.PNG` — Earth/Home with iridescent orb (close to v06)
- `.context/attachments/IMG_8808.PNG` — Add to Crate step 1 (drawer feels short)
- `.context/attachments/IMG_8809.PNG` — Add to Crate step 2 (form pattern, not chat pattern)
- `.context/attachments/IMG_8810.PNG` — Earth/Home with success toast (good)
- `.context/attachments/IMG_8811.PNG` — My Crate (chrome needs `TopBar`)
- `.context/attachments/IMG_8812.PNG` — History drawer (good as-is)
- `.context/attachments/IMG_8813.PNG` — World App native share sheet (not our chrome)
- `.context/attachments/IMG_8814.PNG` — Share failure: duplicate error toasts (fix in 2.5)
