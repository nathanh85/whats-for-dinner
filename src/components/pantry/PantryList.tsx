'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2, Package, Pencil, Search } from 'lucide-react'
import { updatePantryItem, deletePantryItem } from '@/app/(dashboard)/pantry/actions'
import AddPantryItemModal from './AddPantryItemModal'
import EditPantryItemModal from './EditPantryItemModal'
import PantryPrimingWizard from './PantryPrimingWizard'

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
  const router = useRouter()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('All')

  // All unique categories for filter pills
  const allCategories = useMemo(() => {
    const cats = new Set<string>()
    items.forEach(item => cats.add(item.category ?? 'Uncategorized'))
    return ['All', ...Array.from(cats).sort((a, b) => {
      if (a === 'Uncategorized') return 1
      if (b === 'Uncategorized') return -1
      return a.localeCompare(b)
    })]
  }, [items])

  // Filter items by search + category
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = searchQuery === '' || item.ingredient_name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = activeCategory === 'All' || (item.category ?? 'Uncategorized') === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [items, searchQuery, activeCategory])

  // Group by category
  const grouped = filteredItems.reduce<Record<string, PantryItem[]>>((acc, item) => {
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
      <PantryPrimingWizard
        householdId={householdId}
        onComplete={() => router.refresh()}
      />
    )
  }

  return (
    <>
      {/* Search + Add button */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-dt-muted" />
          <input
            type="text"
            placeholder="Search pantry items..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm text-stone-800 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-surface-border dark:bg-surface-raised dark:text-dt-primary dark:placeholder:text-dt-muted dark:focus:border-accent dark:focus:ring-accent"
          />
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary shrink-0">
          <Plus className="h-4 w-4" />
          Add item
        </button>
      </div>

      {/* Category filter pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {allCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-brand-500 text-white dark:bg-accent dark:text-white'
                : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 dark:border-surface-border dark:bg-surface-raised dark:text-dt-secondary dark:hover:bg-surface-hover'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Category groups — two columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
