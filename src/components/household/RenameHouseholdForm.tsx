'use client'

import { useState, useTransition } from 'react'
import { X, Check, Loader2, Pencil } from 'lucide-react'
import { renameHousehold } from '@/app/(dashboard)/household/actions'

export default function RenameHouseholdForm({
  householdId,
  currentName,
}: {
  householdId: string
  currentName: string
}) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('householdId', householdId)

    startTransition(async () => {
      const result = await renameHousehold(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setEditing(false)
      }
    })
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="btn-secondary text-xs"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit name
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        name="name"
        type="text"
        defaultValue={currentName}
        required
        autoFocus
        className="input w-48 text-sm"
      />
      <button type="submit" disabled={isPending} className="btn-primary py-1.5 text-xs">
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
      </button>
      <button
        type="button"
        onClick={() => { setEditing(false); setError(null) }}
        className="btn-secondary py-1.5 text-xs"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </form>
  )
}
