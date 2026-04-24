# Canon — Design System

## Philosophy

Canon is a taste artifact, not a utility app.

Two influences shape the design voice:
- **Mike Matas** — content-first interaction, everything is content, interfaces that feel physical
- **Irma Boom** — bold typography, editorial density, books-as-objects, every element earns its place

The app should feel like holding a personal publication. Minimal chrome, strong typographic voice, generous white space that makes content breathe.

## App Flow

| Screen | Route | Purpose | Auth |
|--------|-------|---------|------|
| Landing | `/` (unauthed) | Immersive first impression — hero headline, value props, CTA | None |
| Sign In | MiniKit sheet | World App native (not customizable) | Triggered |
| Home / Earth | `/` (authed) | Global canon feed — humanity's top persons, places, things | Wallet |
| My Canon | `/me` | Create/edit personal canon — stepper + drawer editor | Wallet + World ID |
| Public Canon | `/u/[slug]` | Shareable canon card | Public |

## World Mini App Constraints

From [official guidelines](https://docs.world.org/mini-apps/guidelines/design-guidelines):

- Mobile-first — no sidebars, footers, or hamburger menus
- Tab navigation for primary nav (Earth / My Canon)
- 2–3s max initial load, <1s subsequent actions
- Consistent background color throughout
- Smooth transitions between screens
- Landing/splash page for sign-in flow
- Disable overscroll bounce: `overscroll-behavior: none`
- Toast messages: centered below header
- Bottom bar: 12px from device bottom bar
- Buttons above keyboard: 24px gap
- App icon: square, non-white background
- Content card: 345×240px, PNG at 3x, bottom 94px kept free
- Never use "official" in naming or World's logo

## Spacing

Values from official design guidelines. Use consistently throughout.

| Token | Value | Where |
|-------|-------|-------|
| page-padding | 24px | Outer padding on all pages |
| header-content | 16px | Header → first content block |
| section-gap | 32px | Between major sections |
| element-gap | 16px | Between elements within a section |
| sub-headline | 16px | Sub-headline → content below |
| bottom-safe | 24px | Content → iOS bottom bar |
| keyboard-gap | 24px | CTA → active keyboard |
| tab-bar-gap | 12px | Tab bar → device bottom bar |

Tailwind mapping: `px-6` (24px), `gap-4` / `space-y-4` (16px), `gap-8` / `space-y-8` (32px).

## Typography

Font: **TWK Lausanne** via `--font-sans` from the UI kit.

All text uses the `Typography` component from `@worldcoin/mini-apps-ui-kit-react`:

| Variant | Level | Role |
|---------|-------|------|
| `display` | 1 | Landing hero headline only |
| `heading` | 1 | Page titles |
| `heading` | 2 | Section titles |
| `subtitle` | 2 | Card titles, emphasis lines |
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

## Components

From `@worldcoin/mini-apps-ui-kit-react`. Use these — don't build custom equivalents.

### Layout shell (every screen)
- `SafeAreaView` — wraps all pages, edges: top + bottom
- `TopBar` — page title + optional end adornment
- `BottomBar` — tab navigation (Earth / My Canon)
- `Toaster` — in providers, for app-wide toast notifications

### Landing
- `Typography` variant `display` for hero
- `BulletList` / `BulletListItem` for value props
- `Button` primary, fullWidth for CTA

### Earth feed
- `Tabs` + `TabItem` — Person / Place / Thing category switcher
- `ListItem` — ranked canon entries with label + description

### My Canon
- `Progress` — stepper showing completion (0/3 → 3/3)
- `Button` — start/edit actions
- `VerificationBadge` — World ID bound state

### Canon editor (drawer)
- `Drawer` + `DrawerContent` / `DrawerHeader` / `DrawerTitle`
- `Form.Root` + `Input` (floating-label) + `TextArea` (floating-label)
- `BottomBar` with Cancel (secondary) + Save (primary)

### Feedback
- `Haptic` — on save/evolve actions (impact style)
- `Toast` via `useToast()` — success/error, centered below header
- `Spinner` — loading states, centered (per guidelines: "middle alignment")

## Cards

All cards use `rounded-3xl`. Two visual styles:

| Style | Classes | When |
|-------|---------|------|
| Bordered | `rounded-3xl border border-gray-200 bg-white p-4` | Content cards, canon slots, verification badge |
| Tinted | `rounded-3xl border border-amber-200 bg-amber-50 p-4` | Action cards, World ID prompt, warnings |

## Interaction Patterns

- **Haptic feedback** on successful saves (impact style)
- **Toast** for success and error states
- **Drawer** (bottom sheet) for all editors — consistent with World App UX
- **Tab navigation** only — no hamburger menus, no sidebars
- **Overscroll disabled** — `overscroll-behavior: none` on html/body

## Localization Priority

Per World guidelines, prioritize these languages:

1. English
2. Spanish
3. Thai
4. Japanese
5. Korean
6. Portuguese

Use `Accept-Language` header for locale detection.
