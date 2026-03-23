# Session D Report — What's for Dinner v1.4.0

**Date:** 2026-03-22
**Version:** 1.4.0
**Status:** Ready to push to main

---

## DB Migrations Pulled

Two new migrations synced via `supabase db pull`:

1. **shopping_list_dedup** — New RPC `upsert_shopping_item` that merges quantities instead of creating duplicate rows. Cleaned 12 existing dupes.
2. **household_member_removal** — DELETE policies on `household_members` (admin remove + self-leave) and `profiles` (admin delete managed profiles).

---

## Track 1: Shopping List Dedup Fix

**Problem:** Regenerating a grocery list from the meal plan created duplicate shopping items instead of merging quantities.

**Changes (`src/app/(dashboard)/shopping/actions.ts`):**
- `addShoppingItem` (manual quick-add): replaced direct `.insert()` with `supabase.rpc('upsert_shopping_item', ...)` — now merges quantity if the same item+unit already exists unchecked
- `addToShoppingList` (bulk from grocery generator): replaced batch `.insert()` with per-item `upsert_shopping_item` RPC calls — same merge behavior
- Both manual and meal-plan sources now dedup correctly

---

## Track 2: Household Member Removal

**New server actions (`src/app/(dashboard)/household/actions.ts`):**
- `removeMember(memberId, householdId)` — admin removes an auth member (their auth account persists, they just lose household access)
- `removeManagedProfile(profileId)` — admin deletes a managed (non-auth) profile permanently
- `leaveHousehold(householdId)` — self-service leave, nulls out the user's household_id

**New component (`src/components/household/MemberActions.tsx`):**
- Inline confirmation pattern (no modal — "Remove" flips to "Yes / Cancel")
- Three modes: `auth-member` (admin sees Remove), `managed-profile` (admin sees Remove), `leave` (self sees Leave Household)
- Only-admin guard: if user is the sole admin, leave/remove buttons are disabled with explanation text

**Household page (`src/app/(dashboard)/household/page.tsx`):**
- Each member row now shows `MemberActions` button (admin-only for removals)
- "Danger zone" card at bottom with Leave Household option
- Computed `currentUserRole`, `adminCount` for guard logic

---

## Track 3: Weekly Planner Desktop Layout Fix

**Changes (`src/components/planner/WeekGrid.tsx`):**
- Grid gap: `gap-2` → `gap-3` for more breathing room between day columns
- Day column min height: `min-h-[200px]` → `min-h-[240px]`
- Day column padding: `p-2` → `p-3`
- Day header margin: `mb-2` → `mb-3`
- Day name text: `text-xs font-medium` → `text-sm font-semibold` (more prominent)
- Day number: `text-lg font-semibold` → `text-xl font-bold`
- Meal slot gap: `gap-1.5` → `gap-2`
- Meal pill padding: `px-2 py-1.5` → `px-2.5 py-2`
- Overall effect: columns feel spacious, day headers are scannable, meals have room

---

## Track 4: Multi-User Prep

Code-side verification completed:
- Invite link generation works (creates `household_invites` row, builds `/join/[token]` URL)
- Join page renders correctly in light and dark mode
- Join flow supports both new signup and existing user sign-in
- After joining, new member appears on household page with correct role
- Ready for real-user testing with actual email invite

---

## Version & Config

- `src/lib/version.ts` → `1.4.0`
- `next.config.mjs` → `X-App-Version: 1.4.0` header
- `<meta name="version" content="1.4.0" />` in root layout

---

## TypeScript Types Updated

- `src/types/database.ts` — added `upsert_shopping_item` RPC params type

---

## QA Results

- **ESLint:** 0 warnings, 0 errors
- **Production build:** compiles clean, all 15 routes generated
- **Dark mode:** all new components use `dark:` tokens consistently

---

## Files Changed (8 files)

| File | What |
|------|------|
| `src/app/(dashboard)/shopping/actions.ts` | Dedup via upsert RPC |
| `src/app/(dashboard)/household/actions.ts` | 3 new server actions (remove/leave) |
| `src/app/(dashboard)/household/page.tsx` | Member action buttons + danger zone |
| `src/components/household/MemberActions.tsx` | **NEW** — removal UI component |
| `src/components/planner/WeekGrid.tsx` | Desktop layout spacing improvements |
| `src/lib/version.ts` | 1.4.0 |
| `next.config.mjs` | Version header bump |
| `src/types/database.ts` | Upsert RPC type |

---

## TODO for Chat

- [ ] Delete Kyle auth user from Supabase Dashboard → Authentication → Users
- [ ] Run real invite flow test (send invite to real email, recipient joins)
- [ ] RLS verification — confirm household isolation for multi-user
- [ ] Verify Vercel deploy after push
- [ ] Session E scope TBD
