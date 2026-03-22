'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type PrimingItem = {
  id: string
  ingredient_name: string
  category: string
  is_staple: boolean
  display_order: number
}

type Props = {
  householdId: string
  onComplete: () => void
}

const STEPS = ['Proteins', 'Dairy', 'Produce', 'Pantry', 'Bread', 'Spices', 'Frozen'] as const

export default function PantryPrimingWizard({ householdId, onComplete }: Props) {
  const [primingItems, setPrimingItems] = useState<PrimingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchItems() {
      const supabase = createClient()
      const { data } = await supabase
        .from('pantry_priming_items')
        .select('id, ingredient_name, category, is_staple, display_order')
        .order('display_order')

      if (data) {
        setPrimingItems(data)
        // Pre-select staples
        const initial: Record<string, boolean> = {}
        data.forEach(item => {
          if (item.is_staple) {
            initial[item.ingredient_name] = true
          }
        })
        setSelected(initial)
      }
      setLoading(false)
    }
    fetchItems()
  }, [])

  const currentCategory = STEPS[currentStep]
  const categoryItems = primingItems.filter(item => item.category === currentCategory)
  const progress = ((currentStep + 1) / STEPS.length) * 100
  const isLastStep = currentStep === STEPS.length - 1

  function toggleItem(name: string) {
    setSelected(prev => ({ ...prev, [name]: !prev[name] }))
  }

  async function handleFinish() {
    setSubmitting(true)
    const supabase = createClient()

    const selectedNames = Object.entries(selected)
      .filter(([, checked]) => checked)
      .map(([name]) => name)

    const rows = selectedNames.map(name => {
      const primingItem = primingItems.find(p => p.ingredient_name === name)
      return {
        household_id: householdId,
        ingredient_name: name,
        category: primingItem?.category ?? 'Uncategorized',
        stock_level: (primingItem?.category === 'Spices' ? 'high' : 'medium') as 'high' | 'medium',
      }
    })

    if (rows.length > 0) {
      await supabase.from('pantry_items').insert(rows)
    }

    onComplete()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent dark:border-accent dark:border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="card mx-auto max-w-xl p-6 dark:bg-surface-raised">
      {/* Progress */}
      <p className="mb-1 text-xs font-medium text-stone-500 dark:text-dt-muted">
        Step {currentStep + 1} of {STEPS.length}
      </p>
      <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-surface-border">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-300 dark:bg-accent"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Category header */}
      <h2 className="mb-4 text-lg font-semibold text-stone-800 dark:text-dt-primary">
        {currentCategory}
      </h2>

      {/* Item grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {categoryItems.map(item => {
          const isChecked = !!selected[item.ingredient_name]
          return (
            <label
              key={item.id}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                isChecked
                  ? 'border-brand-500 bg-brand-50 dark:border-accent dark:bg-accent/10'
                  : 'border-stone-200 bg-white hover:bg-stone-50 dark:border-surface-border dark:bg-surface-raised dark:hover:bg-surface-hover'
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleItem(item.ingredient_name)}
                className="h-4 w-4 rounded border-stone-300 text-brand-500 focus:ring-brand-500 dark:border-surface-border dark:text-accent dark:focus:ring-accent"
              />
              <span className={isChecked ? 'text-stone-800 dark:text-dt-primary' : 'text-stone-600 dark:text-dt-secondary'}>
                {item.ingredient_name}
              </span>
            </label>
          )
        })}
      </div>

      {categoryItems.length === 0 && (
        <p className="py-8 text-center text-sm text-stone-400 dark:text-dt-muted">
          No items in this category yet.
        </p>
      )}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(s => s - 1)}
          disabled={currentStep === 0}
          className="btn-secondary disabled:opacity-40"
        >
          Back
        </button>

        {isLastStep ? (
          <button
            onClick={handleFinish}
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? 'Saving...' : 'Finish'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentStep(s => s + 1)}
            className="btn-primary"
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}
