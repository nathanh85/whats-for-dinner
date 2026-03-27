'use client'

import { useTransition } from 'react'
import { AlertTriangle, AlertCircle, CheckCircle2, Plus, Loader2 } from 'lucide-react'
import { addShoppingItem } from '@/app/(dashboard)/shopping/actions'
import type { PantryNudge } from '@/types/database'

type Props = {
  nudges: PantryNudge[]
  householdId: string
}

export default function PantryNudges({ nudges, householdId }: Props) {
  const [isPending, startTransition] = useTransition()

  const missing = nudges.filter(n => n.urgency === 'missing')
  const check = nudges.filter(n => n.urgency === 'check')

  function handleAddToList(ingredientName: string) {
    const fd = new FormData()
    fd.set('household_id', householdId)
    fd.set('ingredient_name', ingredientName)
    fd.set('quantity', '1')
    startTransition(async () => {
      await addShoppingItem(fd)
    })
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  if (nudges.length === 0) {
    return (
      <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500 dark:text-green-400" />
          <p className="text-sm font-medium text-green-700 dark:text-green-300">
            You&apos;re all set for the week
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 space-y-3">
      {/* Missing items */}
      {missing.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500 dark:text-red-400" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">Missing ingredients</p>
              <ul className="mt-2 space-y-2">
                {missing.map(n => (
                  <li key={n.ingredient_name} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        <span className="font-medium">{n.ingredient_name}</span>
                        {' — needed for '}
                        <span className="font-medium">{n.needed_for}</span>
                        {' on '}
                        {formatDate(n.planned_date)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddToList(n.ingredient_name)}
                      disabled={isPending}
                      className="flex shrink-0 items-center gap-1 rounded-lg bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
                    >
                      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                      Add to list
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Low items */}
      {check.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500 dark:text-amber-400" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Check on these</p>
              <ul className="mt-2 space-y-2">
                {check.map(n => (
                  <li key={n.ingredient_name} className="flex items-start justify-between gap-2">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      <span className="font-medium">{n.ingredient_name}</span>
                      {' — running low, needed for '}
                      <span className="font-medium">{n.needed_for}</span>
                      {' on '}
                      {formatDate(n.planned_date)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
