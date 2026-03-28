'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logEvent } from '@/lib/events'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

type InviteInfo = {
  is_valid: boolean
  household_name: string | null
  email: string | null
  invite_type: 'member' | 'household'
}

export default function JoinPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [invite, setInvite] = useState<InviteInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')

  // Form state
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    async function validate() {
      const { data, error } = await supabase.rpc('validate_invite', {
        p_token: token,
      })
      if (error || !data) {
        setInvite({ is_valid: false, household_name: null, email: null, invite_type: 'member' })
      } else {
        // data could be a single object or array depending on RPC return
        const result = Array.isArray(data) ? data[0] : data
        setInvite(result as InviteInfo)
        if (result.email) setEmail(result.email)
      }
      setLoading(false)
    }
    validate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        })
        if (signUpError) throw signUpError
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
      }

      // Accept the invite after auth — use the right RPC based on invite type
      if (invite?.invite_type === 'household') {
        const { data: acceptData, error: acceptError } = await supabase.rpc('accept_household_invite', {
          p_token: token,
        })
        if (acceptError) throw acceptError
        const result = acceptData as unknown as { success: boolean; error?: string }
        if (!result?.success) throw new Error(result?.error ?? 'Failed to accept invite')
      } else {
        const { error: acceptError } = await supabase.rpc('accept_invite', {
          p_token: token,
        })
        if (acceptError) throw acceptError
      }

      logEvent('invite.accepted', { token })
      setAccepted(true)
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-surface dark:via-surface dark:to-surface p-4">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    )
  }

  // Invalid / expired token
  if (!invite?.is_valid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-surface dark:via-surface dark:to-surface p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
            <XCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-dt-primary">Invalid or expired invite</h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-dt-muted">
            This invite link is no longer valid. Ask your household admin for a new one.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="btn-primary mt-6"
          >
            Go to sign in
          </button>
        </div>
      </div>
    )
  }

  // Success state
  if (accepted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-surface dark:via-surface dark:to-surface p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-dt-primary">
            {invite.invite_type === 'household'
              ? 'Welcome to What\'s for Dinner!'
              : `Welcome to ${invite.household_name}!`}
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-dt-muted">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-surface dark:via-surface dark:to-surface p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 shadow-lg">
            <span className="text-2xl">🍽️</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-dt-primary">What&apos;s for Dinner?</h1>
          {invite.invite_type === 'household' ? (
            <p className="mt-1 text-sm text-stone-500 dark:text-dt-muted">
              You&apos;ve been invited to join! Create your account to get started with your own household.
            </p>
          ) : (
            <p className="mt-1 text-sm text-stone-500 dark:text-dt-muted">
              You&apos;ve been invited to join{' '}
              <span className="font-semibold text-stone-700 dark:text-dt-secondary">{invite.household_name}</span>
            </p>
          )}
        </div>

        <div className="card">
          {/* Mode toggle */}
          <div className="mb-6 flex rounded-lg bg-stone-100 dark:bg-surface-hover p-1">
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                mode === 'signup'
                  ? 'bg-white dark:bg-surface-raised text-stone-900 dark:text-dt-primary shadow-sm'
                  : 'text-stone-500 dark:text-dt-muted hover:text-stone-700 dark:hover:text-dt-secondary'
              }`}
            >
              Create account
            </button>
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                mode === 'signin'
                  ? 'bg-white dark:bg-surface-raised text-stone-900 dark:text-dt-primary shadow-sm'
                  : 'text-stone-500 dark:text-dt-muted hover:text-stone-700 dark:hover:text-dt-secondary'
              }`}
            >
              Sign in
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="displayName" className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-dt-secondary">
                  Display name
                </label>
                <input
                  id="displayName"
                  type="text"
                  autoComplete="name"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-dt-secondary">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-dt-secondary">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {invite.invite_type === 'household'
                ? (mode === 'signup' ? 'Create account' : 'Sign in')
                : (mode === 'signup' ? 'Join household' : 'Sign in & join')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
