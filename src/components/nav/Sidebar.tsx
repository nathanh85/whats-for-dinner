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
import ThemeToggle from '@/components/ThemeToggle'

const navItems = [
  { href: '/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/planner',   label: 'Meal Planner', icon: CalendarDays },
  { href: '/recipes',   label: 'Recipes',      icon: BookOpen },
  { href: '/pantry',    label: 'Pantry',       icon: Package },
  { href: '/shopping',  label: 'Shopping',     icon: ShoppingCart },
  { href: '/household', label: 'Household',    icon: Users },
]

// Bottom nav shows 5 items (no Dashboard — space is limited)
const bottomNavItems = navItems.filter(i => i.href !== '/dashboard')

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isActive(href: string) {
    return href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex h-full w-60 flex-col border-r border-stone-200 bg-white dark:border-surface-border dark:bg-surface-raised">
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-stone-200 px-5 py-4 dark:border-surface-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 shadow-sm dark:bg-accent">
            <ChefHat className="h-5 w-5 text-white dark:text-surface" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-stone-900 dark:text-dt-primary">What&apos;s for</p>
            <p className="text-sm font-semibold leading-tight text-brand-600 dark:text-accent">Dinner?</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-brand-50 text-brand-700 dark:bg-accent/15 dark:text-accent'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:text-dt-secondary dark:hover:bg-surface-hover dark:hover:text-dt-primary'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 flex-shrink-0 ${active ? 'text-brand-600 dark:text-accent' : 'text-stone-400 dark:text-dt-muted'}`}
                    />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Theme toggle + Sign out */}
        <div className="border-t border-stone-200 p-3 space-y-2 dark:border-surface-border">
          <div className="flex items-center justify-between px-3">
            <span className="text-xs text-stone-400 dark:text-dt-muted">Theme</span>
            <ThemeToggle />
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-900 dark:text-dt-muted dark:hover:bg-surface-hover dark:hover:text-dt-primary"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 flex border-t border-stone-200 bg-white dark:border-surface-border dark:bg-surface-raised">
        {bottomNavItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors min-h-[56px] ${
                active ? 'text-brand-600 dark:text-accent' : 'text-stone-400 dark:text-dt-muted'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-brand-600 dark:text-accent' : 'text-stone-400 dark:text-dt-muted'}`} />
              {label === 'Meal Planner' ? 'Planner' : label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
