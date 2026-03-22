'use client'

import { useState, useTransition } from 'react'
import { ChefHat, Clock, X, Loader2, Check } from 'lucide-react'
import { addMealFromRecipe, logAsCooked } from '@/app/(dashboard)/recipes/actions'

type Props = {
  recipeId: string
  recipeTitle: string
  defaultServings: number
  householdId: string | null
}

export default function RecipeActions({ recipeId, recipeTitle, defaultServings, householdId }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleLogCooked() {
    startTransition(async () => {
      const result = await logAsCooked(recipeId)
      if (result.success) {
        setToast(`Logged! You cooked ${recipeTitle}`)
        setTimeout(() => setToast(null), 3000)
      }
    })
  }

  return (
    <>
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => setShowModal(true)}
          disabled={!householdId}
          className="btn-primary"
        >
          <ChefHat className="h-4 w-4" />
          Add to meal plan
        </button>
        <button onClick={handleLogCooked} disabled={isPending} className="btn-secondary">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
          Log as cooked
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm text-white shadow-lg dark:bg-dt-primary dark:text-surface">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-400" />
            {toast}
          </div>
        </div>
      )}

      {/* Add to meal plan modal */}
      {showModal && householdId && (
        <AddToMealPlanModal
          recipeId={recipeId}
          recipeTitle={recipeTitle}
          defaultServings={defaultServings}
          householdId={householdId}
          onClose={() => setShowModal(false)}
          onSuccess={(msg) => {
            setShowModal(false)
            setToast(msg)
            setTimeout(() => setToast(null), 3000)
          }}
        />
      )}
    </>
  )
}

function AddToMealPlanModal({
  recipeId,
  recipeTitle,
  defaultServings,
  householdId,
  onClose,
  onSuccess,
}: {
  recipeId: string
  recipeTitle: string
  defaultServings: number
  householdId: string
  onClose: () => void
  onSuccess: (msg: string) => void
}) {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('dinner')
  const [servings, setServings] = useState(defaultServings)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await addMealFromRecipe({
        householdId,
        recipeId,
        date,
        mealType,
        servings,
        notes: notes.trim() || null,
      })
      if (result.error) {
        setError(result.error)
      } else {
        onSuccess(`Added "${recipeTitle}" to ${mealType} on ${new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`)
      }
    })
  }

  const mealTypes = ['breakfast', 'lunch', 'dinner'] as const

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl md:max-h-none md:max-w-sm md:rounded-2xl dark:bg-surface-raised">
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4 dark:border-surface-border">
          <h2 className="text-base font-semibold text-stone-900 dark:text-dt-primary">Add to meal plan</h2>
          <button
            onClick={onClose}
            className="flex h-[44px] w-[44px] items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:text-dt-muted dark:hover:bg-surface-hover dark:hover:text-dt-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm font-medium text-stone-700 dark:text-dt-secondary">{recipeTitle}</p>

          {/* Date */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-dt-secondary">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
          </div>

          {/* Meal type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-dt-secondary">Meal</label>
            <div className="flex gap-2">
              {mealTypes.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMealType(t)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                    mealType === t
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-accent dark:bg-accent/15 dark:text-accent'
                      : 'border-stone-200 text-stone-500 hover:border-stone-300 dark:border-surface-border dark:text-dt-muted dark:hover:border-dt-muted'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Servings */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-dt-secondary">Servings</label>
            <input
              type="number"
              min={1}
              max={20}
              value={servings}
              onChange={e => setServings(Number(e.target.value))}
              className="input w-24"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-dt-secondary">
              Notes <span className="font-normal text-stone-400 dark:text-dt-muted">(optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. double the sauce"
              className="input"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add to plan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
