import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CalendarDays, BookOpen, Package, ShoppingCart } from 'lucide-react'

const quickLinks = [
  {
    href: '/planner',
    label: "This week's plan",
    description: 'View and edit your meal schedule',
    icon: CalendarDays,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    href: '/recipes',
    label: 'Recipe book',
    description: 'Browse and add recipes',
    icon: BookOpen,
    color: 'bg-green-50 text-green-600',
  },
  {
    href: '/pantry',
    label: 'Pantry',
    description: "See what's in stock",
    icon: Package,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    href: '/shopping',
    label: 'Shopping list',
    description: 'Manage what to buy',
    icon: ShoppingCart,
    color: 'bg-purple-50 text-purple-600',
  },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const displayName =
    user?.user_metadata?.display_name ??
    user?.email?.split('@')[0] ??
    'there'

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="mx-auto max-w-4xl">
      {/* Greeting */}
      <div className="page-header">
        <h1 className="page-title">
          {greeting}, {displayName}! 👋
        </h1>
        <p className="page-subtitle">Here&apos;s a quick overview of your household.</p>
      </div>

      {/* Quick links */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-400">
          Quick access
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickLinks.map(({ href, label, description, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="card flex items-start gap-4 transition-shadow hover:shadow-md"
            >
              <div className={`rounded-xl p-2.5 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-stone-900">{label}</p>
                <p className="text-sm text-stone-500">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Placeholder stats */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-400">
          At a glance
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Meals planned', value: '—' },
            { label: 'Recipes saved', value: '—' },
            { label: 'Pantry items', value: '—' },
            { label: 'Shopping items', value: '—' },
          ].map(({ label, value }) => (
            <div key={label} className="card text-center">
              <p className="text-3xl font-bold text-stone-900">{value}</p>
              <p className="mt-1 text-xs text-stone-500">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
