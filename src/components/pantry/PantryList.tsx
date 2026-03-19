'use client'

import { useState, useTransition } from 'react'
import { Plus, Minus, Trash2, Loader2, AlertTriangle, Package } from 'lucide-react'
import { updatePantryItem, deletePantryItem } from '@/app/(dashboard)/pantry/actions'
import AddPantryItemModal from './AddPantryItemModal'

type PantryItem = {
  id: string
  ingredient_name: string
  quantity: number
  unit: string | null
  category: string | null
  expiry_date: string | null
  low_stock_threshold: number
}

type Props = {
  items: PantryItem[]
  householdId: string
}

function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate + 'T00:00:00')
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export default function PantryList({ items, householdId }: Props) {
  const [showModal, setShowModal] = useState(false)
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

  function handleAdjust(item: PantryItem, delta: number) {
    const newQty = Math.max(0, item.quantity + delta)
    setPendingId(item.id)
    const fd = new FormData()
    fd.set('id', item.id)
    fd.set('quantity', String(newQty))
    startTransition(async () => {
      await updatePantryItem(fd)
      setPendingId(null)
    })
  }

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
        <div className="rounded-xl border border-dashed border-stone-300 py-16 text-center">
          <Package className="mx-auto h-8 w-8 text-stone-300" />
          <p className="mt-3 text-sm font-medium text-stone-500">Your pantry is empty</p>
          <p className="mt-1 text-xs text-stone-400">Add items to keep track of what you have on hand</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary mt-4"
          >
            <Plus className="h-4 w-4" />
            Add first item
          </button>
        </div>

        {showModal && (
          <AddPantryItemModal householdId={householdId} onClose={() => setShowModal(false)} />
        )}
      </>
    )
  }

  return (
    <>
      {/* Add button */}
      <div className="mb-6 flex justify-end">
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          Add item
        </button>
      </div>

      {/* Category groups */}
      <div className="space-y-6">
        {sortedCategories.map(category => (
          <div key={category}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
              {category}
            </h3>
            <div className="card p-0 overflow-hidden">
              <ul className="divide-y divide-stone-100">
                {grouped[category].map(item => {
                  const isLow = item.quantity <= item.low_stock_threshold
                  const daysLeft = item.expiry_date ? getDaysUntilExpiry(item.expiry_date) : null
                  const isExpiringSoon = daysLeft !== null && daysLeft <= 3
                  const isExpired = daysLeft !== null && daysLeft < 0
                  const isBusy = pendingId === item.id && isPending

                  return (
                    <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                      {/* Name + badges */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-stone-800">
                            {item.ingredient_name}
                          </span>
                          {isLow && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                              <AlertTriangle className="h-2.5 w-2.5" />
                              Low stock
                            </span>
                          )}
                          {isExpired && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                              Expired
                            </span>
                          )}
                          {!isExpired && isExpiringSoon && (
                            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700">
                              Expires in {daysLeft}d
                            </span>
                          )}
                        </div>
                        {item.expiry_date && !isExpiringSoon && !isExpired && (
                          <p className="mt-0.5 text-xs text-stone-400">
                            Exp {new Date(item.expiry_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        )}
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAdjust(item, -1)}
                          disabled={isBusy || item.quantity <= 0}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-40"
                        >
                          <Minus className="h-3 w-3" />
                        </button>

                        <span className="min-w-[4rem] text-center text-sm font-medium text-stone-700">
                          {isBusy
                            ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin text-stone-400" />
                            : <>{item.quantity}{item.unit ? ` ${item.unit}` : ''}</>
                          }
                        </span>

                        <button
                          onClick={() => handleAdjust(item, 1)}
                          disabled={isBusy}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-40"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isBusy}
                        className="ml-1 rounded-lg p-1.5 text-stone-300 hover:bg-red-50 hover:text-red-400 disabled:opacity-40"
                        aria-label="Delete item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <AddPantryItemModal householdId={householdId} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
