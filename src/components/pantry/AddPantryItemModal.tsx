'use client'

import { useState, useTransition } from 'react'
import { X, Loader2 } from 'lucide-react'
import { addPantryItem } from '@/app/(dashboard)/pantry/actions'

type Props = {
  householdId: string
  onClose: () => void
}

const COMMON_CATEGORIES = [
  'Produce', 'Dairy', 'Meat & Fish', 'Grains & Pasta',
  'Canned Goods', 'Spices & Herbs', 'Condiments', 'Snacks', 'Beverages', 'Other',
]

export default function AddPantryItemModal({ householdId, onClose }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await addPantryItem(formData)
      if (result.error) {
        setError(result.error)
      } else {
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <h2 className="text-base font-semibold text-stone-900">Add pantry item</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input type="hidden" name="household_id" value={householdId} />

          {/* Name */}
          <div>
            <label htmlFor="ingredient_name" className="mb-1.5 block text-sm font-medium text-stone-700">
              Item name <span className="text-red-400">*</span>
            </label>
            <input
              id="ingredient_name"
              name="ingredient_name"
              type="text"
              placeholder="e.g. Olive oil, Chicken breast…"
              className="input"
              autoFocus
              required
            />
          </div>

          {/* Quantity + Unit */}
          <div className="flex gap-3">
            <div className="w-28">
              <label htmlFor="quantity" className="mb-1.5 block text-sm font-medium text-stone-700">
                Quantity
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min={0}
                step="any"
                defaultValue={1}
                className="input"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="unit" className="mb-1.5 block text-sm font-medium text-stone-700">
                Unit
              </label>
              <input
                id="unit"
                name="unit"
                type="text"
                placeholder="e.g. cups, lbs, oz…"
                className="input"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-stone-700">
              Category
            </label>
            <input
              id="category"
              name="category"
              type="text"
              list="category-suggestions"
              placeholder="e.g. Produce, Dairy…"
              className="input"
            />
            <datalist id="category-suggestions">
              {COMMON_CATEGORIES.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          {/* Expiry date */}
          <div>
            <label htmlFor="expiry_date" className="mb-1.5 block text-sm font-medium text-stone-700">
              Expiry date <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <input
              id="expiry_date"
              name="expiry_date"
              type="date"
              className="input"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add item
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
