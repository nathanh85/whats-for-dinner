'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, Loader2, ShoppingCart, Sparkles, Check } from 'lucide-react'
import {
  addShoppingItem,
  toggleShoppingItem,
  deleteShoppingItem,
  clearCheckedItems,
  generateFromMealPlan,
} from '@/app/(dashboard)/shopping/actions'

type ShoppingItem = {
  id: string
  ingredient_name: string
  quantity: number | null
  unit: string | null
  category: string | null
  is_checked: boolean
  source: string
}

type Props = {
  items: ShoppingItem[]
  householdId: string
}

export default function ShoppingList({ items, householdId }: Props) {
  const [quickAdd, setQuickAdd] = useState('')
  const [generateMsg, setGenerateMsg] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isAdding, startAddTransition] = useTransition()
  const [isGenerating, startGenerateTransition] = useTransition()
  const [isClearing, startClearTransition] = useTransition()

  const unchecked = items.filter(i => !i.is_checked)
  const checked = items.filter(i => i.is_checked)

  function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!quickAdd.trim()) return
    const fd = new FormData()
    fd.set('household_id', householdId)
    fd.set('ingredient_name', quickAdd.trim())
    fd.set('quantity', '1')
    startAddTransition(async () => {
      const result = await addShoppingItem(fd)
      if (!result.error) setQuickAdd('')
    })
  }

  function handleToggle(item: ShoppingItem) {
    setPendingId(item.id)
    startAddTransition(async () => {
      await toggleShoppingItem(item.id, item.is_checked)
      setPendingId(null)
    })
  }

  function handleDelete(id: string) {
    setPendingId(id)
    startAddTransition(async () => {
      await deleteShoppingItem(id)
      setPendingId(null)
    })
  }

  function handleClearChecked() {
    startClearTransition(async () => {
      await clearCheckedItems(householdId)
    })
  }

  function handleGenerate() {
    setGenerateMsg(null)
    startGenerateTransition(async () => {
      const result = await generateFromMealPlan(householdId)
      if (result.error) {
        setGenerateMsg(result.error)
      } else {
        setGenerateMsg(`Added ${result.added} ingredient${result.added !== 1 ? 's' : ''} from this week's meal plan`)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Quick add */}
      <form onSubmit={handleQuickAdd} className="flex gap-2">
        <input
          type="text"
          value={quickAdd}
          onChange={e => setQuickAdd(e.target.value)}
          placeholder="Quick add an item…"
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={isAdding || !quickAdd.trim()}
          className="btn-primary"
        >
          {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </button>
      </form>

      {/* Generate from meal plan */}
      <div className="rounded-xl border border-olive/20 bg-olive/5 p-4 dark:border-accent/20 dark:bg-accent/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-stone-800 dark:text-dt-primary">Generate from meal plan</p>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-dt-muted">
              Add missing ingredients from this week&apos;s planned meals.
            </p>
            {generateMsg && (
              <p className={`mt-1.5 text-xs font-medium ${generateMsg.startsWith('Added') ? 'text-olive dark:text-accent' : 'text-amber-600 dark:text-amber-400'}`}>
                {generateMsg}
              </p>
            )}
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn-primary shrink-0 text-xs"
          >
            {isGenerating
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Sparkles className="h-3.5 w-3.5" />
            }
            Generate
          </button>
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-300 py-16 text-center dark:border-surface-border">
          <ShoppingCart className="mx-auto h-8 w-8 text-stone-300 dark:text-dt-muted" />
          <p className="mt-3 text-sm font-medium text-stone-500 dark:text-dt-secondary">Your list is empty</p>
          <p className="mt-1 text-xs text-stone-400 dark:text-dt-muted">
            Quick-add items above or generate from this week&apos;s meal plan
          </p>
        </div>
      )}

      {/* Unchecked items */}
      {unchecked.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <ul className="divide-y divide-stone-100 dark:divide-surface-border">
            {unchecked.map(item => (
              <ShoppingItemRow
                key={item.id}
                item={item}
                isPending={pendingId === item.id}
                onToggle={() => handleToggle(item)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Checked items */}
      {checked.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-dt-muted">
              In cart ({checked.length})
            </h3>
            <button
              onClick={handleClearChecked}
              disabled={isClearing}
              className="flex items-center gap-1 text-xs text-stone-400 hover:text-red-400 transition-colors dark:text-dt-muted dark:hover:text-red-400"
            >
              {isClearing
                ? <Loader2 className="h-3 w-3 animate-spin" />
                : <Trash2 className="h-3 w-3" />
              }
              Clear all
            </button>
          </div>
          <div className="card p-0 overflow-hidden opacity-60">
            <ul className="divide-y divide-stone-100 dark:divide-surface-border">
              {checked.map(item => (
                <ShoppingItemRow
                  key={item.id}
                  item={item}
                  isPending={pendingId === item.id}
                  onToggle={() => handleToggle(item)}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

function ShoppingItemRow({
  item,
  isPending,
  onToggle,
  onDelete,
}: {
  item: ShoppingItem
  isPending: boolean
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      {/* Checkbox */}
      <button
        onClick={onToggle}
        disabled={isPending}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
          item.is_checked
            ? 'border-olive bg-olive text-white dark:border-accent dark:bg-accent dark:text-surface'
            : 'border-stone-300 hover:border-olive dark:border-dt-muted dark:hover:border-accent'
        }`}
        aria-label={item.is_checked ? 'Uncheck item' : 'Check item'}
      >
        {isPending
          ? <Loader2 className="h-3 w-3 animate-spin" />
          : item.is_checked && <Check className="h-3 w-3" />
        }
      </button>

      {/* Name + meta */}
      <div className="min-w-0 flex-1">
        <span className={`text-sm font-medium ${item.is_checked ? 'line-through text-stone-400 dark:text-dt-muted' : 'text-stone-800 dark:text-dt-primary'}`}>
          {item.ingredient_name}
        </span>
        {(item.quantity || item.unit) && (
          <span className="ml-2 text-xs text-stone-400 dark:text-dt-muted">
            {item.quantity}{item.unit ? ` ${item.unit}` : ''}
          </span>
        )}
        {item.source === 'meal_plan' && (
          <span className="ml-2 inline-flex items-center gap-0.5 rounded-full bg-stone-100 px-1.5 py-px text-[10px] text-stone-400 dark:bg-surface dark:text-dt-muted">
            <Sparkles className="h-2.5 w-2.5" />
            meal plan
          </span>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        disabled={isPending}
        className="ml-1 rounded-lg p-1.5 text-stone-300 hover:bg-red-50 hover:text-red-400 transition-colors disabled:opacity-40 dark:text-dt-muted dark:hover:bg-red-900/30 dark:hover:text-red-400"
        aria-label="Delete item"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  )
}
