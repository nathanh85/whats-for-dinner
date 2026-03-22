'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { createRecipe } from '@/app/(dashboard)/recipes/actions'

interface Ingredient {
  id: number
  name: string
  qty: string
  unit: string
}

export default function NewRecipeForm() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 1, name: '', qty: '', unit: '' },
  ])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function addIngredient() {
    setIngredients((prev) => [
      ...prev,
      { id: Date.now(), name: '', qty: '', unit: '' },
    ])
  }

  function removeIngredient(id: number) {
    setIngredients((prev) => prev.filter((i) => i.id !== id))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createRecipe(formData)
      if (result?.error) setError(result.error)
      // on success, server action redirects to the new recipe page
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-stone-900 dark:text-dt-primary">Details</h2>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-dt-secondary">
            Title <span className="text-red-400">*</span>
          </label>
          <input name="title" type="text" required className="input" placeholder="e.g. Chicken Stir Fry" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-dt-secondary">Description</label>
          <textarea
            name="description"
            rows={2}
            className="input resize-none"
            placeholder="A short description…"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-dt-secondary">Prep (min)</label>
            <input name="prep_time" type="number" min={0} className="input" placeholder="10" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-dt-secondary">Cook (min)</label>
            <input name="cook_time" type="number" min={0} className="input" placeholder="30" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-dt-secondary">Servings</label>
            <input name="servings" type="number" min={1} defaultValue={4} className="input" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="is_public"
            name="is_public"
            type="checkbox"
            value="true"
            defaultChecked
            className="h-4 w-4 rounded border-stone-300 dark:border-surface-border text-brand-500 focus:ring-brand-400"
          />
          <label htmlFor="is_public" className="text-sm text-stone-700 dark:text-dt-secondary">
            Make this recipe public
          </label>
        </div>
      </div>

      {/* Ingredients */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-stone-900 dark:text-dt-primary">Ingredients</h2>

        {ingredients.map((ing, idx) => (
          <div key={ing.id} className="flex items-center gap-2">
            <input
              name="ingredient_qty"
              type="number"
              min={0}
              step="any"
              placeholder="Qty"
              className="input w-20"
            />
            <input
              name="ingredient_unit"
              type="text"
              placeholder="Unit"
              className="input w-24"
            />
            <input
              name="ingredient_name"
              type="text"
              placeholder="Ingredient"
              className="input flex-1"
            />
            {ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => removeIngredient(ing.id)}
                className="rounded-lg p-1.5 text-stone-400 dark:text-dt-muted hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addIngredient}
          className="btn-secondary w-full text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Add ingredient
        </button>
      </div>

      {/* Instructions */}
      <div className="card">
        <h2 className="mb-3 font-semibold text-stone-900 dark:text-dt-primary">Instructions</h2>
        <textarea
          name="instructions"
          rows={8}
          className="input resize-none"
          placeholder="Enter each step on a new line…"
        />
        <p className="mt-1.5 text-xs text-stone-400 dark:text-dt-muted">Each line will become a numbered step.</p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex items-center justify-end gap-3">
        <a href="/recipes" className="btn-secondary">Cancel</a>
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save recipe
        </button>
      </div>
    </form>
  )
}
