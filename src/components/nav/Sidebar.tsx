'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  ChefHat,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/planner',   label: 'Meal Planner', icon: CalendarDays },
  { href: '/recipes',   label: 'Recipes',      icon: BookOpen },
  { href: '/pantry',    label: 'Pantry',       icon: Package },
  { href: '/shopping',  label: 'Shopping',     icon: ShoppingCart },
  { href: '/household', label: 'Household',    icon: Users },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r border-stone-200 bg-white">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-stone-200 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 shadow-sm">
          <ChefHat className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-stone-900">What&apos;s for</p>
          <p className="text-sm font-semibold leading-tight text-brand-600">Dinner?</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-brand-600' : 'text-stone-400'}`}
                  />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Sign out */}
      <div className="border-t border-stone-200 p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-900"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
