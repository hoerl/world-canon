# Crate — Design System

## Philosophy

Crate is a taste artifact, not a utility app.

Two influences shape the design voice:
- **Mike Matas** — content-first interaction, everything is content, interfaces that feel physical
- **Irma Boom** — bold typography, editorial density, books-as-objects, every element earns its place

The app should feel like holding a personal publication. Minimal chrome, strong typographic voice, generous white space that makes content breathe.

## App Flow

| Screen | Route | Purpose | Auth |
|--------|-------|---------|------|
| Landing | `/` (unauthed) | Immersive first impression — hero headline, value props, CTA | None |
| Sign In | MiniKit sheet | World App native (not customizable) | Triggered |
| Home / Earth | `/` (authed) | Global crate feed — humanity's top persons, places, things | Wallet |
| My Crate | `/me` | View/edit personal crate — conversational drawer editor | Wallet + World ID |
| Public Crate | `/u/[slug]` | Shareable crate card | Public |

## World Mini App Constraints

From [official guidelines](https://docs.world.org/mini-apps/guidelines/design-guidelines):

- Mobile-first — no sidebars, footers, or hamburger menus
- 2–3s max initial load, <1s subsequent actions
- Consistent background color throughout
- Smooth transitions between screens
- Landing/splash page for sign-in flow
- Disable overscroll bounce: `overscroll-behavior: none`
- Toast messages: centered below header
- Bottom menu: 20px from device bottom bar, 8px minimum from top of menu
- Buttons from iOS safe area: 32px (no keyboard)
- Buttons above active keyboard: 24px
- Top of safe area to page title: 64px
- One clear task per page
- Keep CTAs visible; minimize unnecessary scrolling
- Middle alignment for empty, loading, and transient states
- App icon: square, non-white background
- Content card: 345×240px, PNG at 3x, bottom 94px kept free
- Never use "official" in naming or World's logo

## Spacing — 4px Base System

Every dimension is a multiple of **4px**. Values from the [UI Kit Storybook spacing docs](https://mini-apps-ui-kit.world.org/?path=/docs/documentation-spacing--docs) (authoritative).

| Token | Value | Tailwind | Where |
|-------|-------|----------|-------|
| base | 4px | `1` | Atomic unit |
| element-inner | 8px | `2` | Bottom menu top breathing room |
| small-gap | 12px | `3` | Small element-to-element |
| element-gap | 16px | `4` | Between elements, header→content, title→subtitle, header→search |
| bottom-menu-safe | 20px | `5` | Bottom menu → iOS bottom safe area |
| page-padding | 24px | `6` | Outer padding on all pages, CTA→active keyboard |
| button-bottom-safe | 32px | `8` | Button → iOS bottom safe area (no keyboard) |
| section-gap | 40px | `10` | Between major sections |
| top-to-title | 64px | `16` | Top of safe area → page title |

**Tailwind theme** (defined in `src/app/globals.css` under `@theme`):

```css
--spacing-1: 4px;   /* atomic */
--spacing-2: 8px;   /* bottom-menu top */
--spacing-3: 12px;  /* small element gap */
--spacing-4: 16px;  /* element-gap, header→content, title→subtitle */
--spacing-5: 20px;  /* bottom-menu-safe */
--spacing-6: 24px;  /* page-padding, keyboard-gap */
--spacing-8: 32px;  /* button-bottom-safe */
--spacing-10: 40px; /* section-gap */
--spacing-16: 64px; /* top-to-title */
```

**Rule:** no raw pixel literals (`px-[18px]`, `mt-[36px]`) anywhere in `src/`. Every dimension uses this scale.

## Typography

Font: **TWK Lausanne** via `--font-sans` from the UI kit.

All text uses the `Typography` component from `@worldcoin/mini-apps-ui-kit-react`:

| Variant | Level | Role |
|---------|-------|------|
| `display` | 1 | Landing hero headline only |
| `heading` | 1 | Page titles |
| `heading` | 2 | Section titles |
| `subtitle` | 2 | Card titles, emphasis lines, drawer headers |
| `body` | 2 | Primary body text |
| `body` | 3 | Descriptions, secondary text |
| `label` | 1–2 | Metadata, small labels |
| `number` | — | Rankings, numeric displays |

## Color

Use UI kit CSS custom properties exclusively. No custom brand colors.

| Role | Token | Tailwind |
|------|-------|----------|
| Surface | `--gray-0` | `bg-gray-0` |
| Elevated surface | white + `--gray-200` border | `bg-white border-gray-200` |
| Text primary | `--gray-900` | `text-gray-900` |
| Text secondary | `--gray-500` | `text-gray-500` |
| Text tertiary | `--gray-400` | `text-gray-400` |
| Dividers/borders | `--gray-200` | `border-gray-200` |
| Attention surface | amber-50 + amber-200 border | `bg-amber-50 border-amber-200` |
| Success | `--success-*` | `text-success-700` / `bg-success-100` |
| Error | `--error-*` | `text-error-700` / `bg-error-100` |

## Chrome

Every screen uses consistent shell components from `@worldcoin/mini-apps-ui-kit-react`:

### Layout shell (every screen)
- `SafeAreaView` — wraps all pages, edges: top + bottom
- `Toaster` — in providers, for app-wide toast notifications

### TopBar
Use `TopBar` from the UI Kit for all page headers. Props:
- `title` — centered page title
- `startAdornment` — left slot (typically close/back: `Button size="icon" variant="tertiary"`)
- `endAdornment` — right slot (typically share/send: `Button size="icon" variant="tertiary"`)

### BottomBar
Use `BottomBar` from the UI Kit for bottom-of-screen action rows. Not to be confused with `Tabs`:

| Surface | Primitive | When |
|---------|-----------|------|
| Mixed bottom row (icons + center CTA, like Earth screen) | `BottomBar` | 2 nav icons + 1 primary CTA — not all slots are peer destinations |
| Section-switching nav (peer tabs) | `Tabs` + `TabItem` | N peer destinations, all same shape (icon + label); supports "With Links" pattern for App Router |

The v06 bottom row (search · Add to Crate · profile) is **`BottomBar`**, not `Tabs`.

## Button — Canonical Use Map

`Button` ships 3 variants × 3 sizes. Only these combinations belong in Crate:

| Use case | Variant | Size | `fullWidth` |
|---|---|---|---|
| Primary screen CTA (Get Started, Save, Add to Crate) | `primary` | `lg` | `true` in flow, omit in BottomBar pill |
| Stacked exclusive choice (Person/Place/Thing) | `tertiary` | `lg` | `true` |
| Circular icon-only action (close, share, back, send) | `tertiary` | `icon` | n/a |
| Secondary action paired with primary (Cancel + Save) | `secondary` | `lg` | as needed |
| Compact inline action (future: row "Edit" button) | `tertiary` | `sm` | omit |

**`Pill` is not a button** — it's a filter/tag chip with `checked: boolean` state. Don't use `Pill` for icon-only action buttons.

## Iconography

All icons from `@worldcoin/mini-apps-ui-kit-react/icons`:

- **Default state:** `icons/regular` (outlined)
- **Active state (tab/nav):** `icons/solid` (filled)

### Active Icons pattern
Pair `regular/<Glyph>` (inactive) with `solid/<Glyph>` (active) for any navigation icon with route-aware state. Use `usePathname()` from `next/navigation` to determine active route.

Example: profile icon in `BottomBar` renders `solid/User` when route is `/me`, `regular/User` otherwise.

### Common glyphs used in Crate

| Glyph | Import (from `@worldcoin/mini-apps-ui-kit-react/icons`) | Where |
|-------|--------|-------|
| Close/dismiss | `Xmark` | TopBar start, drawer close |
| Back | `ArrowLeft` | Drawer back navigation |
| Share | `ShareIos` | TopBar end (My Crate share) |
| Send | `Airplane` | Input end-adornment (Add to Crate submit) |
| Search | `Search` | BottomBar search slot |
| Profile (inactive) | `User` | BottomBar profile slot |
| Profile (active) | `UserSolid` | BottomBar profile slot when on `/me` |

## Conversation Drawers

The Add-to-Crate editor uses a **conversational stack** pattern inside a `Drawer`:

- Each step renders as a Q/A turn. Prior turns are muted (`text-gray-400` question + `text-gray-500` answer). The last turn is active with an `Input` + paper-plane send button as end adornment.
- Step 1 (category chooser): 3 stacked `Button variant="tertiary" fullWidth` (Person / Place / Thing).
- Steps 2–3: single render path — question above, `Input` with `Airplane` end-adornment below. Pressing Enter or tapping the plane advances. Back navigates to previous turn.
- Drawer anchoring: `min-h-[60vh]` on step 1; grows to content-height as turns stack.

All authoring flows use `Drawer` + `DrawerContent` (`rounded-t-3xl`). Never use full-screen pages for editors.

## Motion & Haptics

### Haptics
Use `useHaptics()` hook from the UI Kit:

| Event | Haptic | Type |
|-------|--------|------|
| Category selected (Person/Place/Thing) | `selection` | — |
| Turn submitted (title, rationale) | `impact` | `light` |
| Crate saved successfully | `notification` | `success` |
| Error | `notification` | `error` |

### Transitions
- Drawer open/close: handled by UI Kit `Drawer` component (spring animation).
- Page transitions: use Next.js App Router default (no custom).
- Overscroll: disabled globally via `overscroll-behavior: none` on html/body.
- All custom animations use `transform` + `opacity` only (compositor-cheap).
- Honor `prefers-reduced-motion: reduce` — collapse to ≤300ms fade.

## Cards

All cards use `rounded-3xl`. Two visual styles:

| Style | Classes | When |
|-------|---------|------|
| Bordered | `rounded-3xl border border-gray-200 bg-white p-4` | Content cards, crate slots, verification badge |
| Tinted | `rounded-3xl border border-amber-200 bg-amber-50 p-4` | Action cards, World ID prompt, warnings |

## Localization Priority

Per World guidelines, prioritize these languages:

1. English
2. Spanish
3. Thai
4. Japanese
5. Korean
6. Portuguese

Use `Accept-Language` header for locale detection.
