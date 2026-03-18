# What's for Dinner? — Claude Sync Guide
**Last verified: March 17 2026 (session 3 — Claude Code)**
**Source of truth: this file + the live Supabase DB (read via MCP)**

---

## The Two-Claude Workflow

| | Claude (claude.ai chat) | Claude Code (terminal) |
|---|---|---|
| **Has access to** | Conversation history, DB concepts | Local filesystem, shell, Supabase MCP |
| **Does** | Architecture, planning, SQL design | Frontend code, git, npm, file writes |
| **Does NOT** | Touch local files directly | Make up DB state — reads it via MCP |

**Handoff rule:** Claude Code owns the files and git. Claude Chat owns the thinking and SQL proposals. This file is the shared contract.

---

## ⚠️ Known Divergences (Chat vs Disk)

Chat's sync doc described a structure that was never written to disk. The real project looks different in these ways — **do not let Chat overwrite these**:

| Topic | What Chat described | What's actually on disk | Correct? |
|---|---|---|---|
| App directory | `app/` at root | `src/app/` | ✅ Disk is correct |
| CSS approach | CSS Modules | Tailwind utility classes | ✅ Disk is correct |
| Auth callback URL | `/api/auth/callback` | `/auth/callback` | ✅ Disk is correct |
| Auth pages | Single `auth/page.tsx` | Separate `(auth)/login` + `(auth)/signup` | ✅ Disk is correct |
| Household flow | "Not built yet" | Built ✅ (`CreateHouseholdModal`, `actions.ts`) | ✅ Disk is ahead |
| Recipes | "Stub" | Grid + detail + add form built ✅ | ✅ Disk is ahead |
| Fonts | Not applied | Fraunces + DM Sans (applied session 3) | ✅ Now in sync |
| Colors | cream/ink/olive/rust | Applied to `globals.css` + `tailwind.config.ts` | ✅ Now in sync |

---

## Supabase Project

- **Project ref:** `efcznmgycrtjewtqyodi`
- **URL:** `https://efcznmgycrtjewtqyodi.supabase.co`
- **Anon key:** in `.env.local` (never commit)

### Auth Configuration (must match in Supabase Dashboard → Auth → URL Config)
- **Site URL:** `http://localhost:3000` (update to Vercel URL after deploy)
- **Redirect URLs:**
  - `http://localhost:3000/auth/callback` ← note: NOT `/api/auth/callback`
  - `https://your-vercel-url.vercel.app/auth/callback`

---

## Database State (verified March 17 2026 via MCP)

### Migrations (4 applied)

| Version | Name | Applied by | What it did |
|---|---|---|---|
| 20260317055451 | fix_rls_policies | Claude Code | Initial RLS policy pass |
| 20260317060802 | fill_rls_gaps_and_triggers | Claude Chat | Policy gaps, triggers, unique constraints |
| 20260317060823 | seed_starter_recipes | Claude Chat | 8 public starter recipes |
| 20260317064502 | cleanup_duplicate_constraints | Claude Chat | Removed redundant unique constraints |

### Tables (9, all RLS enabled)

| Table | Rows | Key columns |
|---|---|---|
| `households` | 0 | `id`, `name`, `created_at` |
| `household_members` | 0 | `id`, `household_id`, `user_id`, `role` (admin\|member), `joined_at` |
| `profiles` | 0 | `id`, `user_id`, `household_id`, `display_name`, `avatar_color`, `dietary_restrictions[]`, `is_managed` |
| `recipes` | 8 | `id`, `title`, `description`, `prep_time`, `cook_time`, `servings`, `instructions`, `image_url`, `source` (seeded\|user\|ai), `created_by`, `is_public` |
| `recipe_ingredients` | 0 | `id`, `recipe_id`, `ingredient_name`, `quantity`, `unit` |
| `recipe_interactions` | 0 | `id`, `user_id`, `recipe_id`, `is_saved`, `rating` (1-5), `cooked_at`, `notes` |
| `meal_plans` | 0 | `id`, `household_id`, `date`, `meal_type` (breakfast\|lunch\|dinner\|snack), `recipe_id`, `custom_meal_name`, `servings`, `notes` |
| `pantry_items` | 0 | `id`, `household_id`, `ingredient_name`, `quantity`, `unit`, `category`, `expiry_date`, `low_stock_threshold`, `updated_at` |
| `shopping_items` | 0 | `id`, `household_id`, `ingredient_name`, `quantity`, `unit`, `category`, `is_checked`, `added_by` (→profiles.id), `source` (manual\|meal_plan\|recommendation) |

### Triggers (2)

```sql
-- on_auth_user_created: AFTER INSERT on auth.users
-- Auto-creates profiles row on signup. Uses SECURITY DEFINER (bypasses RLS).
INSERT INTO public.profiles (id, user_id, display_name, avatar_color)
VALUES (new.id, new.id, coalesce(metadata display_name, email prefix), '#5C6B3A')
ON CONFLICT (id) DO NOTHING;

-- set_pantry_updated_at: BEFORE UPDATE on pantry_items
-- Auto-stamps updated_at on every edit.
new.updated_at = now();
```

### Unique Constraints (2)
- `household_members(household_id, user_id)` — one membership per user per household
- `recipe_interactions(user_id, recipe_id)` — one interaction record per user per recipe

### Seed Data (8 public recipes)
Chicken Street Tacos, Asian Stir Fry, Pasta Bolognese, Baked Salmon,
Sheet Pan Chicken & Veggies, Black Bean Tacos, Chicken Fried Rice, Turkey Chili

---

## Frontend State (verified March 17 2026)

### Design System
- **Fonts:** Fraunces (headings/display) + DM Sans (body) — loaded via Google Fonts in `layout.tsx`
- **Colors:** `--cream: #F9F5EE` · `--ink: #1C1A17` · `--olive: #5C6B3A` · `--rust: #C4612A`
- **Tailwind tokens:** `bg-cream`, `text-ink`, `bg-olive`, `bg-rust`, `font-display` (Fraunces)
- **CSS approach:** Tailwind utility classes + component layer in `globals.css` (NOT CSS Modules)

### Routes

| Route | File | Status |
|---|---|---|
| `/` | `src/app/page.tsx` | Redirects → `/dashboard` |
| `/login` | `src/app/(auth)/login/page.tsx` | ✅ Built |
| `/signup` | `src/app/(auth)/signup/page.tsx` | ✅ Built |
| `/auth/callback` | `src/app/auth/callback/route.ts` | ✅ Built (Supabase email confirm handler) |
| `/dashboard` | `src/app/(dashboard)/dashboard/page.tsx` | ✅ Shell built, stats stubbed |
| `/recipes` | `src/app/(dashboard)/recipes/page.tsx` | ✅ Grid built, reads from DB |
| `/recipes/new` | `src/app/(dashboard)/recipes/new/page.tsx` | ✅ Add form built |
| `/recipes/[id]` | `src/app/(dashboard)/recipes/[id]/page.tsx` | ✅ Detail page built |
| `/household` | `src/app/(dashboard)/household/page.tsx` | ✅ Create household flow built |
| `/planner` | `src/app/(dashboard)/planner/page.tsx` | 🔲 Stub |
| `/pantry` | `src/app/(dashboard)/pantry/page.tsx` | 🔲 Stub |
| `/shopping` | `src/app/(dashboard)/shopping/page.tsx` | 🔲 Stub |

### Components

| File | What it does |
|---|---|
| `src/components/nav/Sidebar.tsx` | Left nav sidebar |
| `src/components/nav/TopBar.tsx` | Top bar with user menu |
| `src/components/household/CreateHouseholdModal.tsx` | Create household modal |
| `src/components/household/RenameHouseholdForm.tsx` | Rename household inline form |
| `src/components/recipes/NewRecipeForm.tsx` | Add recipe form with ingredient rows |
| `src/components/recipes/RecipeSearch.tsx` | Recipe search/filter bar |

### Supabase Clients
- `src/lib/supabase/client.ts` — browser client (for Client Components)
- `src/lib/supabase/server.ts` — SSR client (for Server Components + actions)
- `src/middleware.ts` — auth protection, redirects unauthenticated → `/login`

---

## Git State

**Repo:** `https://github.com/nathanh85/whats-for-dinner`
**Branch:** `main`

| Commit | Message |
|---|---|
| `8e69825` | Align design system with Chat spec: Fraunces + DM Sans fonts, cream/ink/olive/rust colors |
| `ae822ab` | feat(recipes): recipe grid, detail page, and add recipe form |
| `20933a7` | Initial scaffold: Next.js app with Supabase auth, dashboard shell, and stub pages |

---

## Environment Variables

`.env.local` (local dev — never commit):
```
NEXT_PUBLIC_SUPABASE_URL=https://efcznmgycrtjewtqyodi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Add both to Vercel → Project → Settings → Environment Variables for production.

---

## What's Left to Build (priority order)

1. **Planner** — weekly grid connected to `meal_plans` table, add/remove meals, week navigation
2. **Pantry** — CRUD for `pantry_items`, grouped by category, expiry alerts
3. **Shopping list** — manual add, check off, generate from meal plan → `recipe_ingredients` diff against pantry
4. **Dashboard stats** — replace "—" placeholders with real counts from DB
5. **Household member management** — invite by email, list members, manage roles
6. **Vercel deploy** — run `npx vercel`, add env vars, update Supabase redirect URLs

---

## How Claude Code Connects to Supabase

Claude Code uses a **Supabase MCP server** configured in `.claude/settings.local.json`.
This is separate from `.env.local` — it uses a service-level token, not the anon key.
Claude Code can read schema, run SQL, apply migrations, and check logs directly via MCP tools.
`.env.local` is only used by the Next.js app at runtime (browser + server components).
