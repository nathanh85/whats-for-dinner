'use client'

import { useState, useTransition } from 'react'
import { X, Loader2, ChevronDown } from 'lucide-react'
import { updatePantryItem } from '@/app/(dashboard)/pantry/actions'

type PantryItem = {
  id: string
  ingredient_name: string
  quantity: number
  unit: string | null
  category: string | null
  stock_level: 'high' | 'medium' | 'low' | 'out'
  meal_count: number | null
  notes: string | null
}

type Props = {
  item: PantryItem
  onClose: () => void
}

const STOCK_LEVELS = ['high', 'medium', 'low', 'out'] as const

const STOCK_BTN: Record<string, string> = {
  high:   'border-green-400 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/40 dark:text-green-400',
  medium: 'border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  low:    'border-orange-400 bg-orange-50 text-orange-700 dark:border-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
  out:    'border-red-400 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/40 dark:text-red-400',
}

export default function EditPantryItemModal({ item, onClose }: Props) {
  const [stockLevel, setStockLevel] = useState(item.stock_level)
  const [mealCount, setMealCount] = useState(item.meal_count?.toString() ?? '')
  const [notes, setNotes] = useState(item.notes ?? '')
  const [showExact, setShowExact] = useState(false)
  const [quantity, setQuantity] = useState(item.quantity.toString())
  const [unit, setUnit] = useState(item.unit ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const fd = new FormData()
    fd.set('id', item.id)
    fd.set('stock_level', stockLevel)
    fd.set('meal_count', mealCount)
    fd.set('notes', notes.trim())
    fd.set('quantity', quantity)
    fd.set('unit', unit.trim())

    startTransition(async () => {
      const result = await updatePantryItem(fd)
      if (result.error) {
        setError(result.error)
      } else {
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl md:max-h-none md:max-w-md md:rounded-2xl dark:bg-surface-raised">
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4 dark:border-surface-border">
          <h2 className="text-base font-semibold text-stone-900 dark:text-dt-primary">
            Edit {item.ingredient_name}
          </h2>
          <button
            onClick={onClose}
            className="flex h-[44px] w-[44px] items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:text-dt-muted dark:hover:bg-surface-hover dark:hover:text-dt-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Stock level */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-dt-secondary">Stock level</label>
            <div className="grid grid-cols-4 gap-2">
              {STOCK_LEVELS.map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setStockLevel(level)}
                  className={`rounded-lg border px-2 py-2 text-sm font-medium capitalize transition-colors ${
                    stockLevel === level
                      ? STOCK_BTN[level]
                      : 'border-stone-200 text-stone-400 dark:border-surface-border dark:text-dt-muted'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Meal count */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-dt-secondary">
              Approximate meals
            </label>
            <input
              type="number"
              min={0}
              step="1"
              value={mealCount}
              onChange={e => setMealCount(e.target.value)}
              placeholder="e.g. 4"
              className="input w-32"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-dt-secondary">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. check before Thursday"
              className="input"
            />
          </div>

          {/* Exact quantity (collapsible) */}
          <div>
            <button
              type="button"
              onClick={() => setShowExact(!showExact)}
              className="flex items-center gap-1 text-xs font-medium text-stone-400 hover:text-stone-600 dark:text-dt-muted dark:hover:text-dt-secondary"
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${showExact ? 'rotate-180' : ''}`} />
              Exact quantity (optional)
            </button>
            {showExact && (
              <div className="mt-2 flex gap-3">
                <div className="w-28">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="input"
                    placeholder="Qty"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="input"
                    placeholder="Unit (cups, lbs…)"
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
