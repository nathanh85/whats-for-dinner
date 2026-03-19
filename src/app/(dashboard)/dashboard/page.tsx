import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CalendarDays, BookOpen, Package, ShoppingCart } from 'lucide-react'
import type { Profile } from '@/types/database'

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

  // Get household_id from profile
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const profile = profileData as Profile | null
  const householdId = profile?.household_id

  // Fetch all stats in parallel
  const [mealsRes, recipesRes, pantryRes, shoppingRes] = await Promise.all([
    householdId
      ? supabase.from('meal_plans').select('id', { count: 'exact', head: true })
          .eq('household_id', householdId)
          .gte('planned_for', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .lte('planned_for', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      : Promise.resolve({ count: 0 }),
    supabase.from('recipe_interactions').select('id', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .eq('is_saved', true),
    householdId
      ? supabase.from('pantry_items').select('id', { count: 'exact', head: true }).eq('household_id', householdId)
      : Promise.resolve({ count: 0 }),
    householdId
      ? supabase.from('shopping_items').select('id', { count: 'exact', head: true })
          .eq('household_id', householdId)
          .eq('is_checked', false)
      : Promise.resolve({ count: 0 }),
  ])

  const stats = [
    { label: 'Meals this week', value: mealsRes.count ?? 0 },
    { label: 'Recipes saved', value: recipesRes.count ?? 0 },
    { label: 'Pantry items', value: pantryRes.count ?? 0 },
    { label: 'Left to buy', value: shoppingRes.count ?? 0 },
  ]

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
          {stats.map(({ label, value }) => (
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
