'use client'

import { useEffect } from 'react'
import { logEvent } from '@/lib/events'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logEvent('error.client', {
      message: error.message,
      digest: error.digest ?? null,
    })
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-orange-50 dark:bg-surface p-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
          <span className="text-2xl">😵</span>
        </div>
        <h2 className="text-lg font-semibold text-stone-900 dark:text-dt-primary">Something went wrong</h2>
        <p className="mt-2 text-sm text-stone-500 dark:text-dt-muted">
          An unexpected error occurred. Please try again.
        </p>
        <button onClick={reset} className="btn-primary mt-6">
          Try again
        </button>
      </div>
    </div>
  )
}
