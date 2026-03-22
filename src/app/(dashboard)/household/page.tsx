import { createClient } from '@/lib/supabase/server'
import { Users, Shield, User, UserCheck } from 'lucide-react'
import CreateHouseholdModal from '@/components/household/CreateHouseholdModal'
import RenameHouseholdForm from '@/components/household/RenameHouseholdForm'
import InviteSection from '@/components/household/InviteSection'
import AddManagedProfileModal from '@/components/household/AddManagedProfileModal'

const roleLabel = { admin: 'Admin', member: 'Member' } as const

export default async function HouseholdPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch profile + household in one query
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, households(id, name)')
    .eq('id', user!.id)
    .maybeSingle()

  const household = profile?.households as unknown as { id: string; name: string } | null

  // If they're in a household, load members, invites, and all profiles (including managed)
  const members = household
    ? await supabase
        .from('household_members')
        .select('id, role, user_id, profiles(id, display_name, avatar_color, is_managed)')
        .eq('household_id', household.id)
        .then(({ data }) => data ?? [])
    : []

  // Load managed profiles (no user_id, not in household_members)
  const managedProfiles = household
    ? await supabase
        .from('profiles')
        .select('id, display_name, avatar_color, dietary_restrictions, is_managed')
        .eq('household_id', household.id)
        .eq('is_managed', true)
        .then(({ data }) => data ?? [])
    : []

  // Load pending invites
  const pendingInvites = household
    ? await supabase
        .from('household_invites')
        .select('id, email, created_at, expires_at')
        .eq('household_id', household.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .then(({ data }) => data ?? [])
    : []

  // Query current user's role directly
  const { data: myMembership } = household
    ? await supabase
        .from('household_members')
        .select('role')
        .eq('household_id', household.id)
        .eq('user_id', user!.id)
        .maybeSingle()
    : { data: null }

  const currentMember = myMembership ?? members.find((m) => m.user_id === user!.id)
  const isAdmin = currentMember?.role === 'admin'

  return (
    <div className="mx-auto max-w-3xl">
      <div className="page-header">
        <h1 className="page-title">Household</h1>
        <p className="page-subtitle">Manage your household members and settings</p>
      </div>

      {household ? (
        <>
          {/* Household info */}
          <div className="card mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-stone-900 dark:text-dt-primary">{household.name}</h2>
                <p className="text-sm text-stone-500 dark:text-dt-muted">
                  Your role:{' '}
                  <span className="font-medium text-stone-700 dark:text-dt-secondary">
                    {currentMember ? roleLabel[currentMember.role as 'admin' | 'member'] : '—'}
                  </span>
                </p>
              </div>
              <RenameHouseholdForm
                householdId={household.id}
                currentName={household.name}
              />
            </div>
          </div>

          {/* Members list */}
          <div className="card mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-stone-900 dark:text-dt-primary">
                Members{' '}
                <span className="ml-1 text-sm font-normal text-stone-400 dark:text-dt-muted">
                  ({members.length + managedProfiles.length})
                </span>
              </h3>
              {isAdmin && <AddManagedProfileModal />}
            </div>

            <ul className="divide-y divide-stone-100 dark:divide-surface-border">
              {/* Auth members */}
              {members.map((member) => {
                const memberProfile = member.profiles as unknown as
                  | { id: string; display_name: string; avatar_color: string; is_managed: boolean }
                  | null
                const isYou = member.user_id === user!.id
                const RoleIcon = member.role === 'admin' ? Shield : User

                return (
                  <li key={member.id} className="flex items-center gap-3 py-3">
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: memberProfile?.avatar_color ?? '#5DCAA5' }}
                    >
                      {memberProfile?.display_name?.[0]?.toUpperCase() ?? '?'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-stone-900 dark:text-dt-primary">
                        {memberProfile?.display_name ?? 'Unknown'}
                        {isYou && (
                          <span className="ml-2 text-xs font-normal text-stone-400 dark:text-dt-muted">you</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-dt-muted">
                      <RoleIcon className="h-3.5 w-3.5" />
                      {roleLabel[member.role as 'admin' | 'member']}
                    </div>
                  </li>
                )
              })}

              {/* Managed profiles */}
              {managedProfiles.map((mp) => (
                <li key={mp.id} className="flex items-center gap-3 py-3">
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: mp.avatar_color ?? '#5DCAA5' }}
                  >
                    {mp.display_name?.[0]?.toUpperCase() ?? '?'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-stone-900 dark:text-dt-primary">
                      {mp.display_name}
                    </p>
                    {mp.dietary_restrictions?.length > 0 && (
                      <p className="truncate text-xs text-stone-400 dark:text-dt-muted">
                        {mp.dietary_restrictions.join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-dt-muted">
                    <UserCheck className="h-3.5 w-3.5" />
                    Managed
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Invite section */}
          {isAdmin && (
            <InviteSection
              householdId={household.id}
              initialInvites={pendingInvites}
            />
          )}
        </>
      ) : (
        /* No household yet */
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-2xl bg-green-50 dark:bg-green-900/30 p-5">
            <Users className="h-10 w-10 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-dt-primary">No household yet</h3>
          <p className="mt-1 max-w-xs text-sm text-stone-500 dark:text-dt-muted">
            Create a household to start planning meals with your family or housemates.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <CreateHouseholdModal />
            <button className="btn-secondary">Join with invite</button>
          </div>
        </div>
      )}
    </div>
  )
}
