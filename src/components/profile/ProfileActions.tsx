'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ThemeToggle from '@/components/ThemeToggle'

export default function ProfileActions() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-stone-600 dark:text-dt-secondary">Theme</span>
        <ThemeToggle />
      </div>

      <button
        onClick={handleSignOut}
        className="btn-danger w-full"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  )
}
