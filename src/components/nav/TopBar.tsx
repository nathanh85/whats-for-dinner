import { createClient } from '@/lib/supabase/server'
import { User } from 'lucide-react'

export default async function TopBar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const displayName =
    user?.user_metadata?.display_name ??
    user?.email?.split('@')[0] ??
    'User'

  return (
    <header className="flex h-14 items-center justify-end border-b border-stone-200 bg-white px-6">
      <div className="flex items-center gap-2 text-sm text-stone-600">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <User className="h-4 w-4" />
        </div>
        <span className="font-medium">{displayName}</span>
      </div>
    </header>
  )
}
