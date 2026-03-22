'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, Loader2, Package, Pencil } from 'lucide-react'
import { updatePantryItem, deletePantryItem } from '@/app/(dashboard)/pantry/actions'
import AddPantryItemModal from './AddPantryItemModal'
import EditPantryItemModal from './EditPantryItemModal'

type PantryItem = {
  id: string
  ingredient_name: string
  quantity: number
  unit: string | null
  category: string | null
  expiry_date: string | null
  low_stock_threshold: number
  stock_level: 'high' | 'medium' | 'low' | 'out'
  meal_count: number | null
  notes: string | null
}

type Props = {
  items: PantryItem[]
  householdId: string
}

const STOCK_BADGE: Record<string, string> = {
  high:   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  low:    'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  out:    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

const STOCK_LABEL: Record<string, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  out: 'Out',
}

export default function PantryList({ items, householdId }: Props) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Group by category
  const grouped = items.reduce<Record<string, PantryItem[]>>((acc, item) => {
    const key = item.category ?? 'Uncategorized'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    if (a === 'Uncategorized') return 1
    if (b === 'Uncategorized') return -1
    return a.localeCompare(b)
  })

  function handleDelete(id: string) {
    setPendingId(id)
    startTransition(async () => {
      await deletePantryItem(id)
      setPendingId(null)
    })
  }

  if (items.length === 0) {
    return (
      <>
        <div className="rounded-xl border border-dashed border-stone-300 py-16 text-center dark:border-surface-border">
          <Package className="mx-auto h-8 w-8 text-stone-300 dark:text-dt-muted" />
          <p className="mt-3 text-sm font-medium text-stone-500 dark:text-dt-secondary">Your pantry is empty</p>
          <p className="mt-1 text-xs text-stone-400 dark:text-dt-muted">Add items to keep track of what you have on hand</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary mt-4"
          >
            <Plus className="h-4 w-4" />
            Add first item
          </button>
        </div>

        {showAddModal && (
          <AddPantryItemModal householdId={householdId} onClose={() => setShowAddModal(false)} />
        )}
      </>
    )
  }

  return (
    <>
      {/* Add button */}
      <div className="mb-6 flex justify-end">
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          Add item
        </button>
      </div>

      {/* Category groups */}
      <div className="space-y-6">
        {sortedCategories.map(category => (
          <div key={category}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-dt-muted">
              {category}
            </h3>
            <div className="card p-0 overflow-hidden">
              <ul className="divide-y divide-stone-100 dark:divide-surface-border">
                {grouped[category].map(item => {
                  const isBusy = pendingId === item.id && isPending

                  return (
                    <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                      {/* Name + badges + notes */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-stone-800 dark:text-dt-primary">
                            {item.ingredient_name}
                          </span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${STOCK_BADGE[item.stock_level]}`}>
                            {STOCK_LABEL[item.stock_level]}
                          </span>
                          {item.meal_count != null && (
                            <span className="text-[10px] text-stone-500 dark:text-dt-muted">
                              ~{item.meal_count} meal{item.meal_count !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="mt-0.5 text-xs italic text-stone-400 dark:text-dt-muted">
                            {item.notes}
                          </p>
                        )}
                      </div>

                      {/* Edit */}
                      <button
                        onClick={() => setEditingItem(item)}
                        className="rounded-lg p-1.5 text-stone-300 hover:bg-stone-50 hover:text-stone-500 dark:text-dt-muted dark:hover:bg-surface-hover dark:hover:text-dt-secondary"
                        aria-label="Edit item"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isBusy}
                        className="rounded-lg p-1.5 text-stone-300 hover:bg-red-50 hover:text-red-400 disabled:opacity-40 dark:text-dt-muted dark:hover:bg-red-900/30 dark:hover:text-red-400"
                        aria-label="Delete item"
                      >
                        {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <AddPantryItemModal householdId={householdId} onClose={() => setShowAddModal(false)} />
      )}

      {editingItem && (
        <EditPantryItemModal item={editingItem} onClose={() => setEditingItem(null)} />
      )}
    </>
  )
}
