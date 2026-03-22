'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, Loader2, ShoppingCart, Sparkles, Check, ChevronDown } from 'lucide-react'
import {
  addShoppingItem,
  toggleShoppingItem,
  deleteShoppingItem,
  clearCheckedItems,
} from '@/app/(dashboard)/shopping/actions'
import GroceryListBuilder from './GroceryListBuilder'

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

const CATEGORY_ORDER = ['Proteins', 'Dairy', 'Produce', 'Pantry', 'Bread', 'Spices', 'Frozen', 'Other']

function sortCategories(cats: string[]) {
  return cats.sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a)
    const bi = CATEGORY_ORDER.indexOf(b)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
}

export default function ShoppingList({ items, householdId }: Props) {
  const [quickAdd, setQuickAdd] = useState('')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isAdding, startAddTransition] = useTransition()
  const [isClearing, startClearTransition] = useTransition()

  const unchecked = items.filter(i => !i.is_checked)
  const checked = items.filter(i => i.is_checked)

  // Group unchecked by category
  const groupedUnchecked = unchecked.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
    const cat = item.category ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})
  const uncheckedCategories = sortCategories(Object.keys(groupedUnchecked))

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

      {/* Grocery list builder */}
      <GroceryListBuilder householdId={householdId} />

      {/* Empty state */}
      {items.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-300 py-16 text-center dark:border-surface-border">
          <ShoppingCart className="mx-auto h-8 w-8 text-stone-300 dark:text-dt-muted" />
          <p className="mt-3 text-sm font-medium text-stone-500 dark:text-dt-secondary">Your list is empty</p>
          <p className="mt-1 text-xs text-stone-400 dark:text-dt-muted">
            Quick-add items above or generate from your meal plan
          </p>
        </div>
      )}

      {/* Unchecked items grouped by category */}
      {uncheckedCategories.length > 0 && (
        <div className="space-y-4">
          {uncheckedCategories.map(cat => (
            <div key={cat}>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-dt-muted">
                {cat}
              </h3>
              <div className="card p-0 overflow-hidden">
                <ul className="divide-y divide-stone-100 dark:divide-surface-border">
                  {groupedUnchecked[cat]
                    .sort((a, b) => a.ingredient_name.localeCompare(b.ingredient_name))
                    .map(item => (
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
          ))}
        </div>
      )}

      {/* Checked items */}
      {checked.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-dt-muted">
              Done ({checked.length})
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
      {/* Checkbox — 44px touch target */}
      <button
        onClick={onToggle}
        disabled={isPending}
        className={`flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-lg transition-colors ${
          item.is_checked ? '' : 'hover:bg-stone-50 dark:hover:bg-surface-hover'
        }`}
        aria-label={item.is_checked ? 'Uncheck item' : 'Check item'}
      >
        <span className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
          item.is_checked
            ? 'border-olive bg-olive text-white dark:border-accent dark:bg-accent dark:text-surface'
            : 'border-stone-300 dark:border-dt-muted'
        }`}>
          {isPending
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : item.is_checked && <Check className="h-3 w-3" />
          }
        </span>
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
        className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-lg text-stone-300 hover:bg-red-50 hover:text-red-400 transition-colors disabled:opacity-40 dark:text-dt-muted dark:hover:bg-red-900/30 dark:hover:text-red-400"
        aria-label="Delete item"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  )
}
