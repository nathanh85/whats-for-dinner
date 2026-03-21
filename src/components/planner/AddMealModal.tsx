'use client'

import { useState, useTransition, useRef } from 'react'
import { X, Loader2, ChefHat, PenLine } from 'lucide-react'
import { addMeal, updateMeal } from '@/app/(dashboard)/planner/actions'

type Recipe = {
  id: string
  title: string
  prep_time: number | null
  cook_time: number | null
}

export type ExistingMeal = {
  id: string
  recipe_id: string | null
  custom_meal_name: string | null
  servings: number
  notes: string | null
}

type Props = {
  date: string
  mealType: string
  householdId: string
  recipes: Recipe[]
  existingMeal?: ExistingMeal
  onClose: () => void
}

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
}

export default function AddMealModal({ date, mealType, householdId, recipes, existingMeal, onClose }: Props) {
  const isEditing = !!existingMeal

  const initialMode = existingMeal?.recipe_id ? 'recipe' : 'custom'
  const initialRecipe = existingMeal?.recipe_id
    ? recipes.find(r => r.id === existingMeal.recipe_id) ?? null
    : null

  const [mode, setMode] = useState<'recipe' | 'custom'>(initialMode)
  const [search, setSearch] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(initialRecipe)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  const filteredRecipes = recipes.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase())
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = isEditing
        ? await updateMeal(existingMeal.id, formData)
        : await addMeal(formData)
      if (result.error) {
        setError(result.error)
      } else {
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl md:max-h-none md:max-w-md md:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900">
              {isEditing ? 'Edit' : 'Add'} {MEAL_TYPE_LABELS[mealType] ?? mealType}
            </h2>
            <p className="text-xs text-stone-400">{displayDate}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-[44px] w-[44px] items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-6">
          {/* Hidden fields */}
          <input type="hidden" name="household_id" value={householdId} />
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="meal_type" value={mealType} />
          {selectedRecipe && (
            <input type="hidden" name="recipe_id" value={selectedRecipe.id} />
          )}

          {/* Mode toggle */}
          <div className="mb-5 flex rounded-lg border border-stone-200 p-1">
            <button
              type="button"
              onClick={() => { setMode('recipe'); setSelectedRecipe(null) }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-sm font-medium transition-colors ${
                mode === 'recipe'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <ChefHat className="h-3.5 w-3.5" />
              From recipes
            </button>
            <button
              type="button"
              onClick={() => { setMode('custom'); setSelectedRecipe(null) }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-sm font-medium transition-colors ${
                mode === 'custom'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <PenLine className="h-3.5 w-3.5" />
              Custom name
            </button>
          </div>

          {mode === 'recipe' ? (
            <div className="space-y-3">
              {/* Search */}
              <input
                type="text"
                placeholder="Search recipes…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input"
                autoFocus={!isEditing}
              />

              {/* Recipe list */}
              <div className="max-h-[35vh] overflow-y-auto rounded-lg border border-stone-200 md:max-h-52">
                {filteredRecipes.length === 0 ? (
                  <p className="py-6 text-center text-sm text-stone-400">No recipes found</p>
                ) : (
                  filteredRecipes.map(recipe => {
                    const totalTime = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)
                    const isSelected = selectedRecipe?.id === recipe.id
                    return (
                      <button
                        key={recipe.id}
                        type="button"
                        onClick={() => setSelectedRecipe(isSelected ? null : recipe)}
                        className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                          isSelected
                            ? 'bg-brand-50 text-brand-800'
                            : 'hover:bg-stone-50 text-stone-700'
                        } border-b border-stone-100 last:border-0`}
                      >
                        <span className="font-medium">{recipe.title}</span>
                        {totalTime > 0 && (
                          <span className="ml-2 flex-shrink-0 text-xs text-stone-400">
                            {totalTime} min
                          </span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>

              {selectedRecipe && (
                <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
                  ✓ Selected: <span className="font-medium">{selectedRecipe.title}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label htmlFor="custom_meal_name" className="mb-1.5 block text-sm font-medium text-stone-700">
                  Meal name
                </label>
                <input
                  id="custom_meal_name"
                  name="custom_meal_name"
                  type="text"
                  placeholder="e.g. Leftover pizza, Takeout Thai…"
                  defaultValue={existingMeal?.custom_meal_name ?? ''}
                  className="input"
                  autoFocus={!isEditing || mode === 'custom'}
                  required
                />
              </div>
            </div>
          )}

          {/* Servings */}
          <div className="mt-4">
            <label htmlFor="servings" className="mb-1.5 block text-sm font-medium text-stone-700">
              Servings
            </label>
            <input
              id="servings"
              name="servings"
              type="number"
              min={1}
              max={20}
              defaultValue={existingMeal?.servings ?? 4}
              className="input w-24"
            />
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-stone-700">
              Notes <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <input
              id="notes"
              name="notes"
              type="text"
              placeholder="e.g. Double the sauce, use chicken thighs…"
              defaultValue={existingMeal?.notes ?? ''}
              className="input"
            />
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          {/* Footer */}
          <div className="mt-5 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || (mode === 'recipe' && !selectedRecipe)}
              className="btn-primary"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? 'Save changes' : 'Add meal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
