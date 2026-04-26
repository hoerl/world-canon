---
title: "feat: Restore World ID 4.0 Proof of Human binding in user flow"
type: feat
status: active
date: 2026-04-25
---

# Restore World ID 4.0 Proof of Human Binding in User Flow

## Context

Crate is a World Mini App entering final hackathon deployment. The app gives each verified human a portable taste identity (Person, Place, Thing). The full architecture requires **Proof of Human** via World ID 4.0 session proofs to bind a wallet session to a permanent `world_session_id` — this is the anchor for all canon data.

**The problem:** The `WorldIdSessionCard` component (which renders the `IDKitSessionWidget` with `CredentialRequest('proof_of_human')`) exists and is fully implemented, but it is **orphaned** — never imported or rendered in any page. The backend API routes (`/api/worldid/rp-context` and `/api/worldid/verify`) and the `HumanBindingService` are also fully implemented and functional.

**The result:** Users sign in with World Wallet (SIWE), arrive at `/me`, but have no way to bind World ID. Their `worldSessionId` stays `null`, so:
- `/api/canon/me` returns 403 "World ID binding required"
- `/api/canon/[category]` PUT returns 403 "World ID binding required"
- The "Add to Crate" drawer fires but the API rejects the write
- No canon data loads because `session.worldSessionId` is null

## Current World Integration Audit

| Feature | Status | Implementation |
|---------|--------|---------------|
| **World Wallet (SIWE)** | ✅ Working | `auth-button.tsx` → `MiniKit.walletAuth()` → `/api/auth/complete-siwe` |
| **Proof of Human** | ⚠️ Orphaned | `WorldIdSessionCard` + `IDKitSessionWidget` exist but not rendered |
| **World Chat** | ✅ Working | `world-chat.ts` → `MiniKit.chat()` in share flow |
| **Agent provisioning** | ✅ Working | `agent-registry-service.ts` → `@worldcoin/agentkit` |
| **UI Kit** | ✅ Working | All components use `@worldcoin/mini-apps-ui-kit-react` |

## Proposed Solution

Wire the existing `WorldIdSessionCard` into the `/me` page flow as a gating step between wallet auth and canon access. No new components or services needed — this is a re-connection of existing, tested code.

### Intended user flow (restored)

```
Landing → "Get Started" → MiniKit.walletAuth() → session (worldSessionId=null)
  → /me → WorldIdSessionCard shown → "Bind with World ID 4.0"
    → IDKitSessionWidget opens → user creates proof_of_human session proof
    → POST /api/worldid/verify → server verifies with World API v4
    → worldSessionId set in session cookie → page refreshes
  → /me → canon loaded → "Add to Crate" works
```

## Implementation

### File 1: `src/features/canon/components/my-canon-page.tsx`

**What:** Add World ID binding gate between sign-in check and canon display.

1. Import `WorldIdSessionCard` from `@/features/worldid/components/world-id-session-card`
2. After the existing `if (!session)` guard, add a new condition: `if (!session.worldSessionId)` → render the binding screen
3. The binding screen should include:
   - The `WorldIdSessionCard` with `isBound={false}`
   - A consistent layout wrapping (SafeAreaView, TopBar with "My Crate" title)
4. Hide the "Add to Crate" CTA in the footer when not bound (defensive, since the API already rejects)

**Key lines to modify:**
- After line 57 (`if (!session)` block), add the `worldSessionId` check
- The `WorldIdSessionCard` already handles the full IDKit flow and page refresh on success

```tsx
// After the existing !session check (line 57-66), add:
if (!session.worldSessionId) {
  return (
    <SafeAreaView edges={['top', 'bottom']} className="fixed inset-0 bg-background">
      <div className="mx-auto flex h-full max-w-xl flex-col">
        <TopBar
          title="My Crate"
          startAdornment={
            <Link href="/" aria-label="Close">
              <Xmark className="h-5 w-5" />
            </Link>
          }
        />
        <main className="flex-1 overflow-y-auto px-6">
          <div className="pt-8">
            <WorldIdSessionCard isBound={false} />
          </div>
        </main>
      </div>
    </SafeAreaView>
  );
}
```

### File 2: `src/features/canon/components/my-canon-page.tsx` (bound state)

**What:** Show verification badge when user IS bound, for trust reinforcement.

After the canon is loaded and displayed, show the `WorldIdSessionCard` with `isBound={true}` at the bottom of the content area (below the "Deploy Agent" link). This renders the green verification badge confirming "Crate is bound to a verified human."

Add after the existing action links block (~line 152-174):
```tsx
<div className="mt-6">
  <WorldIdSessionCard isBound={true} />
</div>
```

### No other files need changes

- **Backend routes** (`/api/worldid/rp-context`, `/api/worldid/verify`): Already implemented and functional
- **HumanBindingService**: Already handles RP context creation, v4 API verification, and user binding
- **WorldIdSessionCard**: Already renders IDKitSessionWidget with proof_of_human constraint, handles all states
- **Session management**: Already stores and hydrates `worldSessionId`
- **Dev bypass**: `/api/dev/bind` route already exists for non-production testing

## Files to Modify

| File | Change |
|------|--------|
| `src/features/canon/components/my-canon-page.tsx` | Import WorldIdSessionCard, add binding gate, add bound badge |

## Acceptance Criteria

- [ ] Users who are signed in but NOT World ID bound see the WorldIdSessionCard with "Bind with World ID 4.0" button on `/me`
- [ ] Clicking "Bind with World ID 4.0" opens IDKitSessionWidget and completes the proof_of_human flow
- [ ] After successful binding, the page refreshes and shows the full canon view
- [ ] Users who ARE bound see their canon data and a verification badge
- [ ] "Add to Crate" button only appears when user is World ID bound
- [ ] In non-production environments, the "Dev Bind (skip World ID)" button appears below the real binding button
- [ ] All existing features (wallet auth, World Chat share, agent deploy, Earth feed) continue working

## Verification

1. **Dev flow:** Start dev server (`pnpm dev`), open in browser, sign in → verify the binding card appears → use "Dev Bind" to skip → verify canon loads
2. **World App flow (staging):** Deploy to staging, open in World App → sign in → tap "Bind with World ID 4.0" → complete IDKit flow → verify canon loads and badge shows
3. **API protection:** Confirm `/api/canon/person` PUT still returns 403 without binding
4. **TypeScript:** Run `pnpm tsc --noEmit` to verify no type errors
5. **Existing features:** Verify wallet auth, World Chat share, Earth feed, and agent deploy still work after changes

## Sources

- Architecture doc: `architecture.md` — World ID 4.0 binding flow (lines 103-111)
- Existing component: `src/features/worldid/components/world-id-session-card.tsx`
- Existing service: `src/features/worldid/human-binding-service.ts`
- API routes: `src/app/api/worldid/rp-context/route.ts`, `src/app/api/worldid/verify/route.ts`
- World ID 4.0 docs: https://docs.world.org/world-id/overview
- World ID 4.0 migration: https://docs.world.org/world-id/4-0-migration
- IDKit integration: https://docs.world.org/world-id/idkit/integrate
