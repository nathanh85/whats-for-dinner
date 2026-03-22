# Session A — Change Report

**Date:** 2026-03-22
**Branch:** main
**Files changed:** 32 (26 modified, 6 new)
**Lines:** +572 / -340

---

## QA Results

| Check | Result |
|-------|--------|
| TypeScript (`tsc --noEmit`) | 0 errors |
| ESLint (`next lint`) | 0 warnings/errors |
| Next.js build (`next build`) | 15/15 routes compiled |
| Light mode visual | No regressions |
| Dark mode visual | Renders correctly |

---

## Track 1: Dark Theme

### Infrastructure
- **tailwind.config.ts** — Added `darkMode: 'class'`, new color tokens: `surface` (dark backgrounds), `dt` (dark text), `accent` (warm amber #d4854a)
- **globals.css** — Dark variants for all component classes (`.card`, `.input`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.page-header`, `.page-subtitle`)
- **Root layout** — Inline `<script>` prevents flash-of-wrong-theme by reading localStorage before paint

### New Components
- **ThemeProvider.tsx** — React context with system preference detection (`prefers-color-scheme`), localStorage persistence, and resolved theme state
- **ThemeToggle.tsx** — 3-button toggle (Sun/Moon/Monitor) for Light/Dark/System

### Dark Mode Applied To
- Auth pages (login, signup, auth layout)
- Dashboard layout, sidebar, top bar, mobile bottom nav
- Dashboard page (quick links, stats cards)
- Recipes page (search, filter pills, recipe cards)
- Recipe detail page (header, ingredients, instructions)
- Meal planner (WeekGrid desktop + mobile, AddMealModal)
- Pantry page (nudges stub, PantryList, AddPantryItemModal, EditPantryItemModal)
- Shopping page (ShoppingList, generate section, checkboxes)
- Profile page (new)

### Color Palette
| Token | Value | Purpose |
|-------|-------|---------|
| `surface` | #1a1a1f | Page background |
| `surface-raised` | #242429 | Cards, sidebar, modals |
| `surface-hover` | #2e2e35 | Hover states |
| `surface-border` | #3a3a42 | Borders |
| `dt-primary` | #e8e6e1 | Primary text (warm white) |
| `dt-secondary` | #9c9a92 | Secondary text |
| `dt-muted` | #6b6963 | Muted/placeholder text |
| `accent` | #d4854a | Primary actions (warm amber) |
| `accent-hover` | #e09558 | Action hover |

---

## Track 2: Pantry UI Rethink

### Pantry List View (PantryList.tsx — rewritten)
- **Stock level badges** replace numeric quantity display
  - High = green, Medium = amber, Low = orange, Out = red
- **Meal count** shown as "~4 meals" next to badge (when present)
- **Notes** shown as italic text below item name
- **Edit button** (pencil icon) opens EditPantryItemModal
- Quantity +/- controls removed from list view

### New: EditPantryItemModal.tsx
- **Stock level selector** — 4 color-coded buttons (High/Medium/Low/Out)
- **Meal count** — optional numeric input
- **Notes** — text input
- **Exact quantity** — collapsible section with quantity + unit fields for power users

### Updated: AddPantryItemModal.tsx
- Category changed from free text to dropdown (Proteins, Dairy, Pantry, Produce, Bread, Spices)
- Added stock level selector (defaults to Medium)
- Added meal count input (optional)
- Added notes input (optional)
- Removed quantity/unit from primary add flow

### Updated: pantry/actions.ts
- `addPantryItem` — now accepts `stock_level`, `meal_count`, `notes`
- `updatePantryItem` — now updates `stock_level`, `meal_count`, `notes`, `quantity`, `unit`

### Nudges Stub
- "Heads up" section at top of pantry page with lightbulb icon
- Placeholder text: "Nudges coming soon — we'll alert you when planned meals need ingredients you're running low on."

---

## Track 3: Feature Stubs

### "Add to meal plan" from Recipe Detail
- **RecipeActions.tsx** (new client component) — replaces static buttons
- Opens modal with: date picker (default today), meal type selector (Breakfast/Lunch/Dinner), servings, optional notes
- On save: inserts into `meal_plans` table via `addMealFromRecipe` server action
- Success toast with date + meal type confirmation

### "Log as cooked" from Recipe Detail
- Inserts into `recipe_interactions` table with `cooked_at` timestamp
- Success toast: "Logged! You cooked [recipe name]"
- Server action: `logAsCooked` in recipes/actions.ts

### Profile Avatar → Profile Page
- TopBar avatar now links to `/profile`
- **New page: /profile** — displays:
  - Avatar circle with initial + avatar_color
  - Display name, email (read-only), household name
  - Theme toggle
  - Sign out button
- **ProfileActions.tsx** — client component for theme toggle + sign out

---

## TypeScript Types Updated (database.ts)

### Modified Tables
- `pantry_items` — added `stock_level`, `meal_count`, `notes`
- `meal_plans` — added `variant_id`

### New Tables
- `ingredient_synonyms` — `canonical_name`, `variant_name`, `category`
- `recipe_variants` — `recipe_id`, `name`, `description`, `created_by`
- `recipe_variant_ingredients` — `variant_id`, `ingredient_name`, `quantity`, `unit`, `action`, `replaces_ingredient_name`

### New Enums
- `stock_level`: high | medium | low | out
- `variant_action`: add | remove | swap

### New Convenience Types
- `IngredientSynonym`, `RecipeVariant`, `RecipeVariantIngredient`

---

## Other Changes
- **Dashboard page** — fixed `planned_for` → `date` column reference (was already broken)
- **.claude/launch.json** — fixed Windows paths for macOS, added `autoPort: true`

---

## Still TODO (for Session B / manual)
- Delete Kyle auth user from Supabase Dashboard → Authentication → Users
- Pantry priming interview + grocery list foundation (Session B scope)
- Authenticated visual QA (login with real user to verify dashboard, planner, etc.)
