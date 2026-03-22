import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Home } from 'lucide-react'
import ProfileActions from '@/components/profile/ProfileActions'
import { APP_VERSION } from '@/lib/version'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_color, household_id')
    .eq('id', user.id)
    .maybeSingle()

  let householdName: string | null = null
  if (profile?.household_id) {
    const { data: household } = await supabase
      .from('households')
      .select('name')
      .eq('id', profile.household_id)
      .single()
    householdName = household?.name ?? null
  }

  const displayName = profile?.display_name ?? user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? 'User'

  return (
    <div className="mx-auto max-w-md">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Your account details</p>
      </div>

      <div className="card space-y-5">
        {/* Avatar */}
        <div className="flex justify-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-white text-xl font-bold"
            style={{ backgroundColor: profile?.avatar_color ?? '#5DCAA5' }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-stone-400 dark:text-dt-muted" />
            <div>
              <p className="text-xs text-stone-400 dark:text-dt-muted">Display name</p>
              <p className="text-sm font-medium text-stone-800 dark:text-dt-primary">{displayName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-stone-400 dark:text-dt-muted" />
            <div>
              <p className="text-xs text-stone-400 dark:text-dt-muted">Email</p>
              <p className="text-sm text-stone-600 dark:text-dt-secondary">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Home className="h-4 w-4 text-stone-400 dark:text-dt-muted" />
            <div>
              <p className="text-xs text-stone-400 dark:text-dt-muted">Household</p>
              <p className="text-sm text-stone-600 dark:text-dt-secondary">{householdName ?? 'None'}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-100 pt-4 dark:border-surface-border">
          <ProfileActions />
        </div>

        <div className="border-t border-stone-100 pt-3 dark:border-surface-border">
          <p className="text-center text-[10px] text-stone-300 dark:text-dt-muted">
            What&apos;s for Dinner? v{APP_VERSION}
          </p>
        </div>
      </div>
    </div>
  )
}
