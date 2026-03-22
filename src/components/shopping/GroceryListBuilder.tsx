'use client'

import { useState, useTransition } from 'react'
import { Sparkles, Loader2, X, Check, ShoppingCart, ChevronDown } from 'lucide-react'
import { generateGroceryList, addToShoppingList } from '@/app/(dashboard)/shopping/actions'
import type { GroceryListItem } from '@/types/database'

type Props = {
  householdId: string
}

function getWeekRange(): { start: string; end: string } {
  const now = new Date()
  const day = now.getDay()
  const sun = new Date(now)
  sun.setDate(now.getDate() - day)
  sun.setHours(0, 0, 0, 0)
  const sat = new Date(sun)
  sat.setDate(sun.getDate() + 6)
  return {
    start: toDateStr(sun),
    end: toDateStr(sat),
  }
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return toDateStr(d)
}

const CATEGORY_ORDER = ['Proteins', 'Dairy', 'Produce', 'Pantry', 'Bread', 'Spices', 'Frozen', 'Other']

export default function GroceryListBuilder({ householdId }: Props) {
  const week = getWeekRange()
  const [startDate, setStartDate] = useState(week.start)
  const [endDate, setEndDate] = useState(week.end)
  const [preview, setPreview] = useState<GroceryListItem[] | null>(null)
  const [excluded, setExcluded] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isGenerating, startGenTransition] = useTransition()
  const [isAdding, startAddTransition] = useTransition()
  const [showBuilder, setShowBuilder] = useState(false)

  function applyPreset(preset: 'this' | 'next' | 'both' | 'month') {
    const w = getWeekRange()
    switch (preset) {
      case 'this':
        setStartDate(w.start)
        setEndDate(w.end)
        break
      case 'next':
        setStartDate(addDays(w.start, 7))
        setEndDate(addDays(w.end, 7))
        break
      case 'both':
        setStartDate(w.start)
        setEndDate(addDays(w.end, 7))
        break
      case 'month': {
        const now = new Date()
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        setStartDate(toDateStr(now))
        setEndDate(toDateStr(monthEnd))
        break
      }
    }
  }

  function handleGenerate() {
    setError(null)
    setSuccessMsg(null)
    setPreview(null)
    setExcluded(new Set())
    startGenTransition(async () => {
      const result = await generateGroceryList(householdId, startDate, endDate)
      if (result.error) {
        setError(result.error)
      } else {
        setPreview(result.items)
        // Auto-exclude items already in pantry
        const autoExclude = new Set(
          result.items.filter(i => i.already_have).map(i => i.ingredient_name)
        )
        setExcluded(autoExclude)
      }
    })
  }

  function toggleItem(name: string) {
    setExcluded(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  function handleAddToList() {
    if (!preview) return
    const items = preview
      .filter(i => !excluded.has(i.ingredient_name))
      .map(i => ({
        ingredient_name: i.ingredient_name,
        quantity: i.total_quantity,
        unit: i.unit,
        category: i.category,
      }))

    if (items.length === 0) {
      setError('No items selected')
      return
    }

    startAddTransition(async () => {
      const result = await addToShoppingList(householdId, items)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccessMsg(`Added ${result.added} item${result.added !== 1 ? 's' : ''} to shopping list`)
        setPreview(null)
        setShowBuilder(false)
      }
    })
  }

  // Group preview by category
  const grouped = preview
    ? preview.reduce<Record<string, GroceryListItem[]>>((acc, item) => {
        const cat = item.category || 'Other'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(item)
        return acc
      }, {})
    : {}

  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a)
    const bi = CATEGORY_ORDER.indexOf(b)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  const selectedCount = preview ? preview.filter(i => !excluded.has(i.ingredient_name)).length : 0

  return (
    <div className="space-y-4">
      {/* Toggle button */}
      {!showBuilder && (
        <div className="rounded-xl border border-olive/20 bg-olive/5 p-4 dark:border-accent/20 dark:bg-accent/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-stone-800 dark:text-dt-primary">Generate grocery list</p>
              <p className="mt-0.5 text-xs text-stone-500 dark:text-dt-muted">
                Build a shopping list from your planned meals, minus what&apos;s already in your pantry.
              </p>
              {successMsg && (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-olive dark:text-accent">
                  <Check className="h-3 w-3" /> {successMsg}
                </p>
              )}
            </div>
            <button onClick={() => { setShowBuilder(true); setSuccessMsg(null) }} className="btn-primary shrink-0 text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              Generate
            </button>
          </div>
        </div>
      )}

      {/* Builder panel */}
      {showBuilder && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-dt-primary">Generate grocery list</h3>
            <button onClick={() => { setShowBuilder(false); setPreview(null); setError(null) }}
              className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 dark:text-dt-muted dark:hover:bg-surface-hover">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Date range */}
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-dt-secondary">Start</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input w-40" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-dt-secondary">End</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input w-40" />
            </div>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: 'this' as const, label: 'This week' },
              { key: 'next' as const, label: 'Next week' },
              { key: 'both' as const, label: 'This + Next' },
              { key: 'month' as const, label: 'This month' },
            ].map(p => (
              <button
                key={p.key}
                onClick={() => applyPreset(p.key)}
                className="rounded-full border border-stone-200 px-2.5 py-1 text-xs font-medium text-stone-500 hover:border-stone-300 hover:text-stone-700 dark:border-surface-border dark:text-dt-muted dark:hover:border-dt-muted dark:hover:text-dt-secondary"
              >
                {p.label}
              </button>
            ))}
          </div>

          <button onClick={handleGenerate} disabled={isGenerating} className="btn-primary w-full">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate preview
          </button>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">{error}</p>
          )}

          {/* Preview */}
          {preview && preview.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-t border-stone-100 pt-3 dark:border-surface-border">
                <p className="text-xs font-medium text-stone-500 dark:text-dt-secondary">
                  {selectedCount} of {preview.length} items selected
                </p>
                <button
                  onClick={() => {
                    if (excluded.size === 0) {
                      setExcluded(new Set(preview.map(i => i.ingredient_name)))
                    } else {
                      setExcluded(new Set(preview.filter(i => i.already_have).map(i => i.ingredient_name)))
                    }
                  }}
                  className="text-xs text-stone-400 hover:text-stone-600 dark:text-dt-muted dark:hover:text-dt-secondary"
                >
                  {excluded.size === 0 ? 'Deselect all' : 'Select all needed'}
                </button>
              </div>

              <div className="max-h-[50vh] overflow-y-auto space-y-3">
                {sortedCategories.map(cat => (
                  <div key={cat}>
                    <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-dt-muted">
                      {cat}
                    </h4>
                    <div className="rounded-lg border border-stone-100 overflow-hidden dark:border-surface-border">
                      {grouped[cat].sort((a, b) => a.ingredient_name.localeCompare(b.ingredient_name)).map(item => {
                        const isExcluded = excluded.has(item.ingredient_name)
                        return (
                          <button
                            key={item.ingredient_name}
                            onClick={() => toggleItem(item.ingredient_name)}
                            className={`flex w-full items-center gap-3 border-b border-stone-50 px-3 py-2.5 text-left text-sm transition-colors last:border-0 dark:border-surface-border ${
                              isExcluded
                                ? 'opacity-50'
                                : 'bg-white dark:bg-surface-raised'
                            }`}
                          >
                            {/* Checkbox */}
                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                              !isExcluded
                                ? 'border-olive bg-olive text-white dark:border-accent dark:bg-accent dark:text-surface'
                                : 'border-stone-300 dark:border-dt-muted'
                            }`}>
                              {!isExcluded && <Check className="h-2.5 w-2.5" />}
                            </span>

                            <div className="min-w-0 flex-1">
                              <span className={`font-medium ${isExcluded ? 'line-through text-stone-400 dark:text-dt-muted' : 'text-stone-800 dark:text-dt-primary'}`}>
                                {item.ingredient_name}
                              </span>
                              {item.total_quantity > 0 && (
                                <span className="ml-1.5 text-xs text-stone-400 dark:text-dt-muted">
                                  {item.total_quantity}{item.unit ? ` ${item.unit}` : ''}
                                </span>
                              )}
                              {item.already_have && (
                                <span className="ml-1.5 rounded-full bg-green-100 px-1.5 py-px text-[10px] font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
                                  In pantry
                                </span>
                              )}
                            </div>

                            <span className="shrink-0 text-[10px] text-stone-400 dark:text-dt-muted max-w-[120px] truncate">
                              {item.recipe_sources}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={handleAddToList} disabled={isAdding || selectedCount === 0} className="btn-primary w-full">
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                Add {selectedCount} item{selectedCount !== 1 ? 's' : ''} to shopping list
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
