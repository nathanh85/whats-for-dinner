'use client'

import { useState, useTransition } from 'react'
import { X, Loader2, Wand2, Check, ShoppingCart, RefreshCw } from 'lucide-react'
import { generateMealPlanPreview, commitMealPlan } from '@/app/(dashboard)/planner/generate-actions'
import { useRouter } from 'next/navigation'

type ProposedMeal = {
  date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner'
  recipe_id: string
  recipe_title: string
  recipe_category: string | null
  servings: number
}

type Props = {
  householdId: string
  weekStart: string
  weekEnd: string
  onClose: () => void
}

const MEAL_COLORS: Record<string, string> = {
  breakfast: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  lunch:     'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',
  dinner:    'bg-brand-50 text-brand-700 border-brand-200 dark:bg-accent/15 dark:text-accent dark:border-accent/30',
}

export default function AutoPlanModal({ householdId, weekStart, weekEnd, onClose }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<'options' | 'preview' | 'done'>('options')
  const [dinnersOnly, setDinnersOnly] = useState(true)
  const [proposed, setProposed] = useState<ProposedMeal[]>([])
  const [excluded, setExcluded] = useState<Set<string>>(new Set())
  const [summary, setSummary] = useState({ mealsPlanned: 0, ingredientsInPantry: 0, ingredientsToBuy: 0 })
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, startGenerate] = useTransition()
  const [isSaving, startSave] = useTransition()

  function handleGenerate() {
    setError(null)
    startGenerate(async () => {
      const result = await generateMealPlanPreview(householdId, weekStart, weekEnd, dinnersOnly)
      if (result.error) {
        setError(result.error)
      } else if (result.proposed) {
        setProposed(result.proposed)
        setSummary(result.summary!)
        setExcluded(new Set())
        setStep('preview')
      }
    })
  }

  function handleRegenerate() {
    setStep('options')
    setProposed([])
    setExcluded(new Set())
  }

  function toggleExclude(key: string) {
    setExcluded(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function handleSave() {
    const mealsToSave = proposed
      .filter(m => !excluded.has(`${m.date}-${m.meal_type}`))
      .map(m => ({
        date: m.date,
        meal_type: m.meal_type,
        recipe_id: m.recipe_id,
        servings: m.servings,
      }))

    startSave(async () => {
      const result = await commitMealPlan(householdId, mealsToSave)
      if (result.error) {
        setError(result.error)
      } else {
        setStep('done')
      }
    })
  }

  // Group proposed by date
  const byDate: Record<string, ProposedMeal[]> = {}
  for (const meal of proposed) {
    if (!byDate[meal.date]) byDate[meal.date] = []
    byDate[meal.date].push(meal)
  }
  const sortedDates = Object.keys(byDate).sort()

  const activeMealCount = proposed.filter(m => !excluded.has(`${m.date}-${m.meal_type}`)).length

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl md:max-h-[80vh] md:max-w-lg md:rounded-2xl dark:bg-surface-raised">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-100 bg-white px-6 py-4 dark:border-surface-border dark:bg-surface-raised">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-brand-500 dark:text-accent" />
            <h2 className="text-base font-semibold text-stone-900 dark:text-dt-primary">
              {step === 'done' ? 'Plan saved!' : 'Auto-plan week'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-[44px] w-[44px] items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 dark:text-dt-muted dark:hover:bg-surface-hover"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Options */}
          {step === 'options' && (
            <div className="space-y-4">
              <p className="text-sm text-stone-600 dark:text-dt-secondary">
                Generate a meal plan for the week based on your recipe library and pantry.
                Existing meals won&apos;t be overwritten.
              </p>

              <div className="space-y-3">
                <label className="flex items-center gap-3 rounded-lg border border-stone-200 px-4 py-3 cursor-pointer dark:border-surface-border">
                  <input
                    type="radio"
                    name="scope"
                    checked={dinnersOnly}
                    onChange={() => setDinnersOnly(true)}
                    className="accent-brand-500 dark:accent-accent"
                  />
                  <div>
                    <p className="text-sm font-medium text-stone-800 dark:text-dt-primary">Dinners only</p>
                    <p className="text-xs text-stone-500 dark:text-dt-muted">Most people don&apos;t plan every meal</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-stone-200 px-4 py-3 cursor-pointer dark:border-surface-border">
                  <input
                    type="radio"
                    name="scope"
                    checked={!dinnersOnly}
                    onChange={() => setDinnersOnly(false)}
                    className="accent-brand-500 dark:accent-accent"
                  />
                  <div>
                    <p className="text-sm font-medium text-stone-800 dark:text-dt-primary">All meals</p>
                    <p className="text-xs text-stone-500 dark:text-dt-muted">Breakfast, lunch, and dinner</p>
                  </div>
                </label>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">{error}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={onClose} className="btn-secondary">Cancel</button>
                <button onClick={handleGenerate} disabled={isGenerating} className="btn-primary">
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  Generate
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* Summary pills */}
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-accent/15 dark:text-accent">
                  {activeMealCount} meals
                </span>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  {summary.ingredientsInPantry} in pantry
                </span>
                {summary.ingredientsToBuy > 0 && (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    {summary.ingredientsToBuy} to buy
                  </span>
                )}
              </div>

              {/* Proposed meals by date */}
              <div className="space-y-3">
                {sortedDates.map(date => {
                  const dayLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric',
                  })
                  return (
                    <div key={date}>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-dt-muted">
                        {dayLabel}
                      </p>
                      <div className="space-y-1.5">
                        {byDate[date]
                          .sort((a, b) => {
                            const order = { breakfast: 0, lunch: 1, dinner: 2 }
                            return (order[a.meal_type] ?? 3) - (order[b.meal_type] ?? 3)
                          })
                          .map(meal => {
                            const key = `${meal.date}-${meal.meal_type}`
                            const isExcluded = excluded.has(key)
                            return (
                              <label
                                key={key}
                                className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition-opacity ${
                                  MEAL_COLORS[meal.meal_type] ?? ''
                                } ${isExcluded ? 'opacity-40' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={!isExcluded}
                                  onChange={() => toggleExclude(key)}
                                  className="accent-brand-500 dark:accent-accent"
                                />
                                <div className="min-w-0 flex-1">
                                  <span className="text-xs font-medium capitalize">{meal.meal_type}: </span>
                                  <span className={`text-sm ${isExcluded ? 'line-through' : ''}`}>
                                    {meal.recipe_title}
                                  </span>
                                </div>
                              </label>
                            )
                          })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {proposed.length === 0 && (
                <p className="text-center text-sm text-stone-500 dark:text-dt-muted">
                  No empty slots to fill — your week is already planned!
                </p>
              )}

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">{error}</p>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button onClick={handleRegenerate} className="btn-secondary">
                  <RefreshCw className="h-4 w-4" />
                  Re-roll
                </button>
                <div className="flex gap-3">
                  <button onClick={onClose} className="btn-secondary">Cancel</button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || activeMealCount === 0}
                    className="btn-primary"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Save {activeMealCount} meals
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Done */}
          {step === 'done' && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm text-stone-600 dark:text-dt-secondary">
                {activeMealCount} meals added to your plan!
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={onClose} className="btn-secondary">Done</button>
                <a
                  href="/shopping"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Generate grocery list
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
