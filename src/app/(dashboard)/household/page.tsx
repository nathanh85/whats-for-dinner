import { createClient } from '@/lib/supabase/server'
import { Users, Plus, Shield, User } from 'lucide-react'
import CreateHouseholdModal from '@/components/household/CreateHouseholdModal'
import RenameHouseholdForm from '@/components/household/RenameHouseholdForm'

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

  // If they're in a household, load all members with their profiles
  const members = household
    ? await supabase
        .from('household_members')
        .select('id, role, user_id, profiles(id, display_name, avatar_color)')
        .eq('household_id', household.id)
        .then(({ data }) => data ?? [])
    : []

  const currentMember = members.find((m) => m.user_id === user!.id)

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
                <h2 className="text-lg font-semibold text-stone-900">{household.name}</h2>
                <p className="text-sm text-stone-500">
                  Your role:{' '}
                  <span className="font-medium text-stone-700">
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
              <h3 className="font-semibold text-stone-900">
                Members{' '}
                <span className="ml-1 text-sm font-normal text-stone-400">
                  ({members.length})
                </span>
              </h3>
              <button className="btn-primary text-xs">
                <Plus className="h-3.5 w-3.5" />
                Invite member
              </button>
            </div>

            <ul className="divide-y divide-stone-100">
              {members.map((member) => {
                const memberProfile = member.profiles as unknown as
                  | { id: string; display_name: string; avatar_color: string }
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
                      <p className="truncate text-sm font-medium text-stone-900">
                        {memberProfile?.display_name ?? 'Unknown'}
                        {isYou && (
                          <span className="ml-2 text-xs font-normal text-stone-400">you</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                      <RoleIcon className="h-3.5 w-3.5" />
                      {roleLabel[member.role as 'admin' | 'member']}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Invite link — stub for now */}
          <div className="card">
            <h3 className="mb-2 font-semibold text-stone-900">Invite link</h3>
            <p className="mb-3 text-sm text-stone-500">
              Share this link to let others join your household.
            </p>
            <input
              readOnly
              value="Coming soon…"
              className="input font-mono text-xs text-stone-400"
            />
          </div>
        </>
      ) : (
        /* No household yet */
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-2xl bg-green-50 p-5">
            <Users className="h-10 w-10 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900">No household yet</h3>
          <p className="mt-1 max-w-xs text-sm text-stone-500">
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
