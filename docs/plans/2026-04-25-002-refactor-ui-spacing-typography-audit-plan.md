---
title: "refactor: UI spacing & typography pixel-perfect audit"
type: refactor
status: active
date: 2026-04-25
---

# UI Spacing & Typography Pixel-Perfect Audit

## Overview

A design audit of every screen in Crate, measured against the [World UI Kit Storybook](https://mini-apps-ui-kit.world.org/) (source of truth) and the project's DESIGN.md. This plan catalogs spacing, typography, and consistency violations that can be fixed without reworking layouts or features — pure pixel-perfection polish.

## Problem Statement

The app has a well-documented 4px spacing grid, a defined typography hierarchy, and card patterns — but implementation drifted during rapid feature development. Several screens use off-grid values, inconsistent icon sizes, missing active states, and ad-hoc styling that bypasses the UI Kit. Each issue is small; together they erode the "personal publication" feel the design system targets.

## UI Kit Source-of-Truth Reference

Verified by reading the installed `@worldcoin/mini-apps-ui-kit-react@1.6.0` package internals:

### Typography Variant → Size Map

| Variant | Level | Tailwind | Pixels | Weight | Line-height |
|---------|-------|----------|--------|--------|-------------|
| `display` | 1 | `text-7xl` | 56px | semibold (600) | 1.2 |
| `heading` | 1 | `text-4xl` | 34px | semibold (600) | 1.2 |
| `heading` | 2 | `text-3xl` | 30px | semibold (600) | 1.2 |
| `heading` | 3 | `text-2xl` | 26px | semibold (600) | 1.2 |
| `heading` | 4 | `text-[1.375rem]` | 22px | semibold (600) | 1.2 |
| `subtitle` | 1 | `text-lg` | 19px | medium (500) | 1.2 |
| `subtitle` | 2 | `text-base` | 17px | medium (500) | 1.2 |
| `subtitle` | 3 | `text-sm` | 15px | medium (500) | 1.2 |
| `subtitle` | 4 | `text-xs` | 13px | medium (500) | 1.2 |
| `label` | 1 | `text-base` | 17px | semibold (600) | 1.2 |
| `label` | 2 | `text-sm` | 15px | semibold (600) | 1.2 |
| `body` | 1 | `text-lg` | 19px | normal (400) | 1.3 |
| `body` | 2 | `text-base` | 17px | normal (400) | 1.3 |
| `body` | 3 | `text-sm` | 15px | normal (400) | 1.3 |
| `body` | 4 | `text-xs` | 13px | normal (400) | 1.3 |

### UI Kit Color Tokens (actual grays defined)

`gray-0` (white), `gray-50`, `gray-100`, `gray-200`, `gray-300`, `gray-350`, `gray-400`, `gray-500`, `gray-700`, `gray-900`

**Note:** `gray-600` does NOT exist in the UI Kit. Uses of `text-gray-600` are truly off-system.
`gray-700` DOES exist (`rgb(60, 66, 75)`), but DESIGN.md omits it from the project color table.

### Key Component Internals

| Component | Height | Radius | Padding | Notes |
|-----------|--------|--------|---------|-------|
| **TopBar** | 72px (`h-[4.5rem]`) | — | `px-6 pt-6 pb-2` | With startAdornment → `subtitle level={1}` centered; without → `heading level={3}` left-aligned |
| **ListItem** | 76px (`h-[4.75rem]`) | 16px (`rounded-2xl`) | `p-4` | `bg-gray-50`, label = `subtitle level={2}`, description = `body level={4}` |
| **Input** | 56px (`h-[3.5rem]`) | 10px (`rounded-[0.625rem]`) | `px-4` | `bg-gray-100`, focus: `border-gray-300 bg-gray-0` |
| **Button** | sm=40px, lg=56px, icon=40px | `rounded-full` | `px-4` | **Built-in haptic `impact('light')` on every click** |
| **Chip** | 28px (`h-7`) | `rounded-full` | `px-4` | Text = `subtitle level={4}` (13px medium) |
| **Spinner** | 24px (`h-6 w-6`) | — | — | SVG with proper stroke animation, `text-gray-900` |

---

## Screen-by-Screen Findings

### 1. AppBottomBar (`src/features/ui/app-bottom-bar.tsx`)

| Line | Issue | Severity |
|------|-------|----------|
| 32 | **Profile icon missing active color** — hardcoded `text-gray-500`, never switches to `text-gray-900` when on `/me`. The Group icon on line 21 correctly uses `${isOnTwins ? 'text-gray-900' : 'text-gray-500'}`. This is a bug. | **High** |

**Fix:** Apply conditional className like the Group icon:
```tsx
className={`flex h-10 w-10 items-center justify-center ${isOnMe ? 'text-gray-900' : 'text-gray-500'}`}
```

---

### 2. Home / Earth (`src/features/earth/components/home-page.tsx`)

| Line | Issue | Severity |
|------|-------|----------|
| 44 | **Top padding too short** — `pt-8` (32px) instead of `pt-16` (64px). DESIGN.md: "Top of safe area → page title: 64px." Title sits halfway up from where it should. | **High** |
| 43 | **No bottom padding on main** — content can scroll flush against BottomBar. Add `pb-6` or similar. | **Medium** |

**Fix:** Change `pt-8` → `pt-16` on the inner flex container. Add `pb-6` to `main`.

---

### 3. Landing Page (`src/features/ui/landing-page.tsx`)

| Line | Issue | Severity |
|------|-------|----------|
| 25 | **Top padding `pt-10` (40px)** — The first element (logo) sits at 40px, which is section-gap not top-to-title (64px). For a hero page this may be intentional, but worth noting. | **Low** |
| 26 | **Logo placeholder has no border-radius** — raw `bg-gray-900` square. Should be `rounded-lg` at minimum to feel like a mark. | **Low** |
| 36–48 | **`text-gray-700`** — exists in the UI Kit color tokens but DESIGN.md's project color table omits it, using only `gray-900` (primary), `gray-500` (secondary), `gray-400` (tertiary). Either add `gray-700` to DESIGN.md or standardize to `gray-500`. | **Medium** |

**Fix:** Change `text-gray-700` → `text-gray-500` on bullet text (secondary body copy on a white surface) to match DESIGN.md. Add `rounded-lg` to the logo div.

---

### 4. My Crate (`src/features/canon/components/my-canon-page.tsx`)

| Line | Issue | Severity |
|------|-------|----------|
| 118–120 | **TopBar startAdornment: raw `<Link>` without `Button` wrapper** — Xmark icon is a plain link, missing the `Button size="icon" variant="tertiary"` wrapper that DESIGN.md requires for TopBar adornments. The endAdornment (share) correctly uses `Button`. Hit target and visual treatment differ. | **High** |
| 179–183 | **CTA not fullWidth** — "Add to Crate" button uses `justify-center` wrapper instead of `fullWidth`. DESIGN.md: "Primary screen CTA → `primary lg fullWidth` in flow." | **Medium** |
| 154–173 | **Action links use raw text, not Typography** — "Find Your Twins >", "View History >", "Deploy Agent >" are plain `<Link>` / `<button>` with manual `text-base text-gray-400`. Should use `Typography variant="body" level={2}` for hierarchy compliance. | **Medium** |
| 194 | **History drawer Xmark: `h-4 w-4`** (16px) vs main page Xmark `h-5 w-5` (20px). Inconsistent icon sizing on the same screen. | **Low** |
| 134 | **No bottom padding on main** — scrollable content can clip against the fixed CTA. Add `pb-4` to provide breathing room before the button. | **Medium** |

**Fixes:**
- Wrap Xmark link in `Button size="icon" variant="tertiary"` (match the endAdornment pattern).
- Add `fullWidth` to the CTA button, remove the `flex justify-center` wrapper.
- Wrap action text in `Typography variant="body" level={2}`.
- Standardize drawer Xmark to `h-5 w-5`.
- Add `pb-4` to `main`.

---

### 5. Twins Page (`src/features/twins/components/twins-page.tsx`)

| Line | Issue | Severity |
|------|-------|----------|
| 67–69 | **Same raw `<Link>` issue** for TopBar startAdornment — missing `Button` wrapper. | **High** |
| 75 | **`pt-20` (80px)** — off the defined spacing scale. Scale max is `spacing-16` (64px). Should use `pt-16` (64px). | **Medium** |
| 84, 98 | **Empty state headings use `heading level={3}`** — valid in UI Kit (26px semibold) but undocumented in DESIGN.md. Consider adding to DESIGN.md or using `subtitle level={1}` (19px medium) for a lighter empty-state feel. | **Low** |
| 76 | **Custom CSS spinner** — `h-12 w-12` (48px) with border trick. The UI Kit exports a proper `Spinner` component (24px SVG, `text-gray-900`). Should use `<Spinner />` from `@worldcoin/mini-apps-ui-kit-react`. | **High** |

**Fixes:**
- Wrap Xmark in `Button size="icon" variant="tertiary"`.
- Change `pt-20` → `pt-16` for empty/loading states.
- Replace custom CSS spinner with UI Kit `<Spinner />` (import from `@worldcoin/mini-apps-ui-kit-react`).

---

### 6. Twin Card (`src/features/twins/components/twin-card.tsx`)

| Line | Issue | Severity |
|------|-------|----------|
| 39 | **Card padding `p-5` (20px)** — DESIGN.md standard is `p-4` (16px). This card is looser than every other card in the app. | **Medium** |
| 45 | **`mt-0.5` (2px)** — breaks the 4px grid. DESIGN.md: "no raw pixel literals… every dimension uses this scale." Should be `mt-1` (4px). | **High** |
| 54 | **`space-y-1.5` (6px)** — off the 4px grid. Should be `space-y-1` (4px) or `space-y-2` (8px). | **High** |

**Fixes:**
- Change `p-5` → `p-4`.
- Change `mt-0.5` → `mt-1`.
- Change `space-y-1.5` → `space-y-2` (8px reads better for overlap rows with Chip + text).

---

### 7. Add to Crate Drawer (`src/features/canon/components/add-to-crate-drawer.tsx`)

| Line | Issue | Severity |
|------|-------|----------|
| 147 | **Step 1 title-to-subtitle gap: `mb-1` (4px)** — DESIGN.md says title→subtitle is element-gap (16px / `mb-4`). "What Inspires You?" to "Add to your Crate" is too tight. | **High** |
| 153 | **Close button: `absolute right-6`** — absolute positioning without a `relative` parent is fragile. The parent div should have `relative`. | **Medium** |
| 215 | **Tag chip gap: `gap-2` (8px)** in step 3, but `gap-1` (4px) in step 4 and other tag displays. Inconsistent within the same drawer flow. | **Medium** |

**Fixes:**
- Change `mb-1` → `mb-4` between "What Inspires You?" and "Add to your Crate".
- Add `relative` to the parent flex container, or restructure to avoid absolute positioning.
- Standardize tag chip gap to `gap-2` everywhere (or `gap-1` — pick one).

---

### 8. Canon Slot Card (`src/features/canon/components/canon-slot-card.tsx`)

| Line | Issue | Severity |
|------|-------|----------|
| 16 | **Card padding `p-2` (8px)** — much tighter than the `p-4` standard. Content inside has `px-2` adding 8px more, but the effective top is only `pt-1 + p-2` = 12px vs 16px elsewhere. | **Medium** |
| 17 | **Asymmetric inner padding `pt-1 pb-2`** — 4px top, 8px bottom. This creates visual imbalance between the category label and the ListItem below. | **Low** |

**Fix:** Change `p-2` → `p-4`, remove inner `px-2` on header and tags (the outer padding now handles it). Simplifies the spacing structure.

---

### 9. AppShell (`src/features/ui/app-shell.tsx`)

| Line | Issue | Severity |
|------|-------|----------|
| 18 | **Custom header uses `pt-2 pb-1` (8px/4px)** — UI Kit TopBar uses `pt-6 pb-2` (24px/8px) with fixed 72px height. The custom header is 3x tighter on top. | **High** |

**Fix:** Replace the custom header with the UI Kit `TopBar` component. TopBar already handles title typography (uses `heading level={3}` when no startAdornment, `subtitle level={1}` centered when startAdornment present), spacing, and adornment slots. This also gives the subtitle → needs to move below TopBar or be passed as part of the content.

---

### 10. Gift Finder (`src/features/demo/components/shopper-page.tsx`)

| Line | Issue | Severity |
|------|-------|----------|
| 120–133 | **Custom header instead of TopBar** — uses `pt-2 pb-1` (8px/4px). UI Kit TopBar uses `pt-6 pb-2` (24px/8px) with 72px fixed height. Dramatically tighter than the kit component. | **High** |
| 143–149 | **Raw `<input>` diverges from UI Kit `Input` on every spec** — custom: `rounded-2xl` (16px radius), `border-gray-200`, `bg-gray-50`, ~46px tall. UI Kit: `rounded-[0.625rem]` (10px radius), `border-gray-100`, `bg-gray-100`, 56px tall. | **High** |
| 206 | **Custom CSS spinner** — same issue as twins page. Should use UI Kit `<Spinner />`. | **Medium** |
| 137, 229 | **Inline comments** (`{/* Slug input */}`, `{/* Error state */}`) — minor but counter to the coding style. | **Low** |

**Fixes:**
- Replace custom header with UI Kit `TopBar` component.
- Replace raw `<input>` with UI Kit `Input` component.
- Replace custom spinner with UI Kit `<Spinner />`.
- Remove inline comments.

---

### 11. Earth Feed (`src/features/earth/components/earth-feed.tsx`)

| Line | Issue | Severity |
|------|-------|----------|
| 38 | **Rank number color `text-gray-300`** — very faint. On a light background this is borderline invisible. `text-gray-400` (tertiary) would be more readable while still being muted. | **Low** |

---

### 12. World ID Session Card (`src/features/worldid/components/world-id-session-card.tsx`)

| Line | Issue | Severity |
|------|-------|----------|
| 98 | **`text-gray-600`** — off-system color, same category as the `text-gray-700` issue. DESIGN.md defines `gray-500` (secondary) and `gray-400` (tertiary). | **Low** |

---

## Cross-Cutting Issues

### A. TopBar startAdornment pattern (3 files)

**Files:** `my-canon-page.tsx:118`, `twins-page.tsx:67`, (AppShell uses custom header)

All wrap icon in a raw `<Link>` without the `Button size="icon" variant="tertiary"` wrapper. The endAdornments on the same screens correctly use `Button`. Fix all three for consistent hit targets and visual treatment.

### B. Off-grid spacing values (3 files)

| File | Value | On-grid alternative |
|------|-------|---------------------|
| `twin-card.tsx:45` | `mt-0.5` (2px) | `mt-1` (4px) |
| `twin-card.tsx:54` | `space-y-1.5` (6px) | `space-y-2` (8px) |
| `twins-page.tsx:75,84,98` | `pt-20` (80px) | `pt-16` (64px) |

### C. Off-system colors (3 files)

| File | Color | Status | Fix |
|------|-------|--------|-----|
| `landing-page.tsx:36-48` | `text-gray-700` | Exists in UI Kit but not in DESIGN.md color table | → `text-gray-500` (or add to DESIGN.md) |
| `twin-card.tsx:58` | `text-gray-600` | **Does NOT exist in UI Kit** (kit skips from 500 to 700) | → `text-gray-500` |
| `world-id-session-card.tsx:98` | `text-gray-600` | **Does NOT exist in UI Kit** | → `text-gray-500` |

### D. Replace custom spinners with UI Kit `<Spinner />` (2 files)

The UI Kit exports a proper `Spinner` component (24px SVG, `text-gray-900`, stroke animation). Both files use custom CSS border-trick spinners:

| File | Current | Fix |
|------|---------|-----|
| `twins-page.tsx:76` | `h-12 w-12` div with border trick (48px) | `<Spinner />` from UI Kit |
| `shopper-page.tsx:206` | `h-4 w-4` div with border trick (16px) | `<Spinner />` from UI Kit |

### E. Redundant haptic calls in drawer (1 file)

`add-to-crate-drawer.tsx` — The UI Kit `Button` component already calls `haptics.impact('light')` on every click via `withHaptics()`. Manual `haptics.impact('light')` calls on `submitTitle` (line 96) and `submitTags` (line 108) will fire twice. Remove the manual calls; keep only `haptics.selection()` (for category/tag toggles) and `haptics.notification()` (for success/error) which are distinct haptic types.

### E. Card padding inconsistency (3 values)

| File | Padding | Standard |
|------|---------|----------|
| `canon-slot-card.tsx` | `p-2` (8px) | `p-4` (16px) |
| Most cards | `p-4` (16px) | `p-4` ✓ |
| `twin-card.tsx` | `p-5` (20px) | `p-4` (16px) |

Standardize all content cards to `p-4`.

### F. Tag chip gap inconsistency

- `add-to-crate-drawer.tsx` step 3: `gap-2` (8px)
- `add-to-crate-drawer.tsx` step 4: `gap-1` (4px)
- `my-canon-page.tsx` tags: `gap-1` (4px)
- `twin-card.tsx` tags: `gap-1` (4px)
- `canon-slot-card.tsx` tags: `gap-1` (4px)

Pick one. `gap-1` (4px) is dominant — change step 3 to match.

---

## Implementation Sequence

Work file-by-file. Each change is independent and can be verified visually.

### Phase 1: Bug fix + high-severity (6 files)

1. **`app-bottom-bar.tsx`** — Profile icon active color state
2. **`home-page.tsx`** — `pt-8` → `pt-16`, add `pb-6` to main
3. **`twin-card.tsx`** — `p-5` → `p-4`, `mt-0.5` → `mt-1`, `space-y-1.5` → `space-y-2`
4. **`add-to-crate-drawer.tsx`** — Step 1 `mb-1` → `mb-4`, add `relative`, `gap-2` → `gap-1`, remove redundant `haptics.impact('light')` calls
5. **`my-canon-page.tsx`** — Wrap startAdornment Xmark in `Button`, add `fullWidth` to CTA, standardize drawer icon to `h-5 w-5`, add `pb-4` to main
6. **`twins-page.tsx`** — Wrap startAdornment Xmark in `Button`, `pt-20` → `pt-16`, replace custom spinner with `<Spinner />`

### Phase 2: Consistency pass (4 files)

7. **`landing-page.tsx`** — `text-gray-700` → `text-gray-500`, add `rounded-lg` to logo
8. **`canon-slot-card.tsx`** — Normalize card padding to `p-4`
9. **`my-canon-page.tsx`** — Wrap action links in Typography
10. **`twin-card.tsx`** — `text-gray-600` → `text-gray-500`

### Phase 3: Structural (3 files)

11. **`app-shell.tsx`** — Replace custom header with UI Kit `TopBar`
12. **`shopper-page.tsx`** — Replace custom header with `TopBar`, replace raw `<input>` with UI Kit `Input`, replace custom spinner with `<Spinner />`, remove inline comments
13. **`world-id-session-card.tsx`** — `text-gray-600` → `text-gray-500`

### Phase 4: Polish (1 file)

14. **`earth-feed.tsx`** — `text-gray-300` → `text-gray-400` for rank numbers

---

## Acceptance Criteria

- [ ] Every spacing value in `src/` is a multiple of 4px (no `mt-0.5`, `space-y-1.5`, `pt-20`)
- [ ] Every color class uses UI Kit tokens (no `gray-600` which doesn't exist in the kit)
- [ ] All TopBar adornment icons wrapped in `Button size="icon" variant="tertiary"`
- [ ] Profile icon in BottomBar shows active state (`text-gray-900`) on `/me`
- [ ] All content cards use `p-4` padding
- [ ] Tag chip gaps standardized to `gap-1`
- [ ] Home page title sits at 64px from safe area top (`pt-16`)
- [ ] Primary screen CTAs use `fullWidth`
- [ ] No raw `<input>` elements — use UI Kit `Input` component
- [ ] All spinners use UI Kit `<Spinner />` component (24px SVG)
- [ ] No redundant haptic calls on Button clicks (kit handles `impact('light')` automatically)
- [ ] AppShell and ShopperPage use UI Kit `TopBar` instead of custom headers

## Verification

1. Start dev server (`npm run dev`)
2. Walk through each screen in a mobile viewport (375px width):
   - Landing page → Sign in → Home/Earth → My Crate → Twins → Public Crate → Gift Finder
3. Verify spacing with browser dev tools ruler overlay
4. Check active states on BottomBar by navigating between routes
5. Open Add to Crate drawer — verify step 1 title-to-subtitle gap, verify no double-haptic on buttons
6. Check TopBar spacing matches kit standard (72px height, 24px top padding)
7. Run `npx tsc --noEmit` to confirm no type errors from changes
