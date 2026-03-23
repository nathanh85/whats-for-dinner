'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2, LogOut } from 'lucide-react'
import { removeMember, removeManagedProfile, leaveHousehold } from '@/app/(dashboard)/household/actions'

type MemberActionsProps = {
  type: 'auth-member' | 'managed-profile' | 'leave'
  targetId: string
  targetName: string
  householdName: string
  householdId: string
  isOnlyAdmin: boolean
  currentUserRole: 'admin' | 'member'
}

export default function MemberActions({
  type,
  targetId,
  targetName,
  householdName,
  householdId,
  isOnlyAdmin,
  currentUserRole,
}: MemberActionsProps) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleConfirm() {
    setError(null)
    startTransition(async () => {
      let result: { success?: boolean; error?: string }

      if (type === 'auth-member') {
        result = await removeMember(targetId, householdId)
      } else if (type === 'managed-profile') {
        result = await removeManagedProfile(targetId)
      } else {
        result = await leaveHousehold(householdId)
      }

      if (result.error) {
        setError(result.error)
        setConfirming(false)
      } else {
        setConfirming(false)
      }
    })
  }

  // Auth member removal: only admins can remove
  if (type === 'auth-member') {
    if (currentUserRole !== 'admin') return null

    if (confirming) {
      return (
        <span className="flex items-center gap-2 text-xs">
          <span className="text-stone-500 dark:text-dt-muted">Remove {targetName}?</span>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="font-medium text-red-600 dark:text-red-400 hover:underline"
          >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Yes'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="font-medium text-stone-500 dark:text-dt-muted hover:underline"
          >
            Cancel
          </button>
        </span>
      )
    }

    return (
      <>
        {error && (
          <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
        )}
        <button
          onClick={() => setConfirming(true)}
          className="rounded p-1 text-stone-300 hover:bg-stone-100 hover:text-red-500 dark:text-dt-muted dark:hover:bg-surface-hover dark:hover:text-red-400 transition"
          title={`Remove ${targetName}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </>
    )
  }

  // Managed profile removal: only admins can remove
  if (type === 'managed-profile') {
    if (currentUserRole !== 'admin') return null

    if (confirming) {
      return (
        <span className="flex items-center gap-2 text-xs">
          <span className="text-stone-500 dark:text-dt-muted">Remove {targetName}? This managed profile will be permanently deleted.</span>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="font-medium text-red-600 dark:text-red-400 hover:underline"
          >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Yes'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="font-medium text-stone-500 dark:text-dt-muted hover:underline"
          >
            Cancel
          </button>
        </span>
      )
    }

    return (
      <>
        {error && (
          <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
        )}
        <button
          onClick={() => setConfirming(true)}
          className="rounded p-1 text-stone-300 hover:bg-stone-100 hover:text-red-500 dark:text-dt-muted dark:hover:bg-surface-hover dark:hover:text-red-400 transition"
          title={`Remove ${targetName}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </>
    )
  }

  // Leave household
  if (type === 'leave') {
    if (isOnlyAdmin) {
      return (
        <p className="text-xs text-stone-400 dark:text-dt-muted">
          You&apos;re the only admin &mdash; you can&apos;t leave this household.
        </p>
      )
    }

    if (confirming) {
      return (
        <div className="flex items-center gap-3">
          <span className="text-sm text-stone-500 dark:text-dt-muted">
            Leave {householdName}? You&apos;ll lose access to all shared data.
          </span>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
          >
            {isPending ? <Loader2 className="inline h-3.5 w-3.5 animate-spin" /> : 'Yes, leave'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-sm font-medium text-stone-500 dark:text-dt-muted hover:underline"
          >
            Cancel
          </button>
        </div>
      )
    }

    return (
      <div>
        {error && (
          <p className="mb-2 rounded-lg bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <button
          onClick={() => setConfirming(true)}
          className="flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-800 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          Leave household
        </button>
      </div>
    )
  }

  return null
}
