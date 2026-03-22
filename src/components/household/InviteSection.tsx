'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logEvent } from '@/lib/events'
import { Copy, Check, Mail, Clock, Loader2 } from 'lucide-react'

type PendingInvite = {
  id: string
  email: string
  created_at: string
  expires_at: string
}

export default function InviteSection({
  householdId,
  initialInvites,
}: {
  householdId: string
  initialInvites: PendingInvite[]
}) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [invites, setInvites] = useState(initialInvites)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: insertError } = await supabase
        .from('household_invites')
        .insert({
          household_id: householdId,
          invited_by: user.id,
          email: email.trim().toLowerCase(),
        })
        .select('id, email, token, created_at, expires_at')
        .single()

      if (insertError) throw insertError

      // Build invite URL and copy to clipboard
      const url = `${window.location.origin}/join/${data.token}`
      await navigator.clipboard.writeText(url)
      setCopiedToken(data.id)
      setTimeout(() => setCopiedToken(null), 3000)

      logEvent('invite.sent', { email: data.email })
      setInvites((prev) => [data, ...prev])
      setEmail('')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create invite'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card mb-6">
      <h3 className="mb-3 font-semibold text-stone-900 dark:text-dt-primary">Invite members</h3>
      <p className="mb-4 text-sm text-stone-500 dark:text-dt-muted">
        Enter an email to generate an invite link. Copy and share it however you like.
      </p>

      <form onSubmit={handleInvite} className="mb-4 flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="friend@example.com"
          className="input flex-1"
        />
        <button type="submit" disabled={loading} className="btn-primary shrink-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          Invite
        </button>
      </form>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {invites.length > 0 && (
        <>
          <h4 className="mb-2 text-sm font-medium text-stone-600 dark:text-dt-secondary">Pending invites</h4>
          <ul className="divide-y divide-stone-100 dark:divide-surface-border">
            {invites.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-3.5 w-3.5 text-stone-400 dark:text-dt-muted" />
                  <span className="text-stone-700 dark:text-dt-secondary">{inv.email}</span>
                </div>
                <span className="text-xs text-stone-400 dark:text-dt-muted">
                  {copiedToken === inv.id ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <Check className="h-3.5 w-3.5" /> Copied!
                    </span>
                  ) : (
                    <span className="text-xs text-stone-400 dark:text-dt-muted">
                      expires {new Date(inv.expires_at).toLocaleDateString()}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
