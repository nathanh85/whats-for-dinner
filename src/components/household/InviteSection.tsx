'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logEvent } from '@/lib/events'
import { Copy, Check, Mail, Clock, Loader2, Home, Users } from 'lucide-react'

type PendingInvite = {
  id: string
  email: string
  token: string
  invite_type: 'member' | 'household'
  created_at: string
  expires_at: string
}

function InviteRow({
  inv,
  copiedId,
  onCopy,
  badge,
}: {
  inv: PendingInvite
  copiedId: string | null
  onCopy: (id: string, token: string) => void
  badge?: string
}) {
  return (
    <li className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-3.5 w-3.5 text-stone-400 dark:text-dt-muted" />
        <span className="text-stone-700 dark:text-dt-secondary">{inv.email}</span>
        {badge && (
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500 dark:bg-surface-hover dark:text-dt-muted">
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {copiedId === inv.id ? (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <Check className="h-3.5 w-3.5" /> Copied!
          </span>
        ) : (
          <>
            <span className="text-xs text-stone-400 dark:text-dt-muted">
              expires {new Date(inv.expires_at).toLocaleDateString()}
            </span>
            <button
              onClick={() => onCopy(inv.id, inv.token)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:text-dt-muted dark:hover:bg-surface-hover dark:hover:text-dt-secondary"
              title="Copy invite link"
            >
              <Copy className="h-3 w-3" />
              Copy link
            </button>
          </>
        )}
      </div>
    </li>
  )
}

export default function InviteSection({
  householdId,
  householdName,
  initialInvites,
  isAppAdmin = false,
}: {
  householdId: string
  householdName: string
  initialInvites: PendingInvite[]
  isAppAdmin?: boolean
}) {
  const router = useRouter()
  const [memberEmail, setMemberEmail] = useState('')
  const [householdEmail, setHouseholdEmail] = useState('')
  const [invites, setInvites] = useState(initialInvites)
  const [memberLoading, setMemberLoading] = useState(false)
  const [householdLoading, setHouseholdLoading] = useState(false)
  const [memberError, setMemberError] = useState<string | null>(null)
  const [householdError, setHouseholdError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const memberInvites = invites.filter((i) => i.invite_type === 'member')
  const householdInvites = invites.filter((i) => i.invite_type === 'household')

  async function handleCopy(id: string, token: string) {
    const url = `${window.location.origin}/join/${token}`
    await navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 3000)
  }

  async function handleMemberInvite(e: React.FormEvent) {
    e.preventDefault()
    setMemberError(null)
    setMemberLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('household_invites')
        .insert({
          household_id: householdId,
          invited_by: user.id,
          email: memberEmail.trim().toLowerCase(),
          invite_type: 'member',
        })
        .select('id, email, token, invite_type, created_at, expires_at')
        .single()

      if (error) throw error

      const url = `${window.location.origin}/join/${data.token}`
      await navigator.clipboard.writeText(url)
      setCopiedId(data.id)
      setTimeout(() => setCopiedId(null), 3000)

      logEvent('invite.sent', { email: data.email, invite_type: 'member' })
      setInvites((prev) => [data as PendingInvite, ...prev])
      setMemberEmail('')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create invite'
      setMemberError(message)
    } finally {
      setMemberLoading(false)
    }
  }

  async function handleHouseholdInvite(e: React.FormEvent) {
    e.preventDefault()
    setHouseholdError(null)
    setHouseholdLoading(true)

    try {
      const supabase = createClient()

      const { data, error } = await supabase.rpc('create_household_invite', {
        p_email: householdEmail.trim().toLowerCase(),
      })

      if (error) throw error

      const result = data as unknown as { success: boolean; token: string; email: string; error?: string }
      if (!result?.success) throw new Error(result?.error ?? 'Failed to create invite')

      const url = `${window.location.origin}/join/${result.token}`
      await navigator.clipboard.writeText(url)

      // Refetch to get the full invite row
      const { data: newInvite } = await supabase
        .from('household_invites')
        .select('id, email, token, invite_type, created_at, expires_at')
        .eq('token', result.token)
        .single()

      if (newInvite) {
        setCopiedId(newInvite.id)
        setTimeout(() => setCopiedId(null), 3000)
        setInvites((prev) => [newInvite as PendingInvite, ...prev])
      }

      logEvent('invite.sent', { email: result.email, invite_type: 'household' })
      setHouseholdEmail('')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create invite'
      setHouseholdError(message)
    } finally {
      setHouseholdLoading(false)
    }
  }

  return (
    <>
      {/* Section 1: Invite to my household */}
      <div className="card mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-brand-500" />
          <h3 className="font-semibold text-stone-900 dark:text-dt-primary">Invite to my household</h3>
        </div>
        <p className="mb-4 text-sm text-stone-500 dark:text-dt-muted">
          Invite someone to join <span className="font-medium text-stone-700 dark:text-dt-secondary">{householdName}</span>.
          They&apos;ll become a member of your household.
        </p>

        <form onSubmit={handleMemberInvite} className="mb-4 flex gap-2">
          <input
            type="email"
            required
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            placeholder="friend@example.com"
            className="input flex-1"
          />
          <button type="submit" disabled={memberLoading} className="btn-primary shrink-0">
            {memberLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Invite
          </button>
        </form>

        {memberError && (
          <p className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm text-red-600 dark:text-red-400">{memberError}</p>
        )}

        {memberInvites.length > 0 && (
          <>
            <h4 className="mb-2 text-sm font-medium text-stone-600 dark:text-dt-secondary">Pending</h4>
            <ul className="divide-y divide-stone-100 dark:divide-surface-border">
              {memberInvites.map((inv) => (
                <InviteRow key={inv.id} inv={inv} copiedId={copiedId} onCopy={handleCopy} />
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Section 2: Invite a new household (app admin only) */}
      {isAppAdmin && <div className="card mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Home className="h-4 w-4 text-teal-500" />
          <h3 className="font-semibold text-stone-900 dark:text-dt-primary">Invite a new household</h3>
        </div>
        <p className="mb-4 text-sm text-stone-500 dark:text-dt-muted">
          Invite someone to create their own independent household.
          This will approve their email and let them sign up.
        </p>

        <form onSubmit={handleHouseholdInvite} className="mb-4 flex gap-2">
          <input
            type="email"
            required
            value={householdEmail}
            onChange={(e) => setHouseholdEmail(e.target.value)}
            placeholder="friend@example.com"
            className="input flex-1"
          />
          <button type="submit" disabled={householdLoading} className="btn-primary shrink-0">
            {householdLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Home className="h-4 w-4" />}
            Invite
          </button>
        </form>

        {householdError && (
          <p className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm text-red-600 dark:text-red-400">{householdError}</p>
        )}

        {householdInvites.length > 0 && (
          <>
            <h4 className="mb-2 text-sm font-medium text-stone-600 dark:text-dt-secondary">Pending</h4>
            <ul className="divide-y divide-stone-100 dark:divide-surface-border">
              {householdInvites.map((inv) => (
                <InviteRow key={inv.id} inv={inv} copiedId={copiedId} onCopy={handleCopy} badge="New household" />
              ))}
            </ul>
          </>
        )}
      </div>}
    </>
  )
}
