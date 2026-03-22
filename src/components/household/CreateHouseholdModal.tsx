'use client'

import { useRef, useState, useTransition } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { createHousehold } from '@/app/(dashboard)/household/actions'

export default function CreateHouseholdModal() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createHousehold(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setOpen(false)
        formRef.current?.reset()
      }
    })
  }

  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Create household
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Dialog */}
          <div className="relative w-full rounded-t-2xl bg-white dark:bg-surface-raised p-6 shadow-xl md:max-w-md md:rounded-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-dt-primary">Create a household</h2>
              <button
                onClick={() => setOpen(false)}
                className="flex h-[44px] w-[44px] items-center justify-center rounded-lg text-stone-400 dark:text-dt-muted hover:bg-stone-100 dark:hover:bg-surface-hover hover:text-stone-600 dark:hover:text-dt-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-dt-secondary">
                  Household name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. The Smith Family"
                  className="input"
                />
                <p className="mt-1.5 text-xs text-stone-400 dark:text-dt-muted">
                  You can invite others after creating the household.
                </p>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="btn-primary">
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create household
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
