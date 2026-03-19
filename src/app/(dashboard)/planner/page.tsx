import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarDays } from 'lucide-react'
import WeekGrid from '@/components/planner/WeekGrid'

// Return the Monday of the week containing `date`
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const { week } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get profile → household
  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .maybeSingle()

  // Determine week to show
  const weekStart = week
    ? new Date(week + 'T00:00:00')
    : getWeekStart(new Date())

  const weekEnd = addDays(weekStart, 6)
  const weekStartStr = toDateString(weekStart)
  const weekEndStr = toDateString(weekEnd)

  // Build the 7-day array for this week
  const days = Array.from({ length: 7 }, (_, i) => ({
    date: toDateString(addDays(weekStart, i)),
    label: addDays(weekStart, i).toLocaleDateString('en-US', { weekday: 'short' }),
    dayNum: addDays(weekStart, i).getDate(),
    month: addDays(weekStart, i).toLocaleDateString('en-US', { month: 'short' }),
  }))

  const prevWeek = toDateString(addDays(weekStart, -7))
  const nextWeek = toDateString(addDays(weekStart, 7))
  const isCurrentWeek = toDateString(getWeekStart(new Date())) === weekStartStr

  // Fetch meal plans + joined recipe title for this week
  const { data: mealPlans } = profile?.household_id
    ? await supabase
        .from('meal_plans')
        .select('id, date, meal_type, custom_meal_name, servings, notes, recipe_id, recipes(title)')
        .eq('household_id', profile.household_id)
        .gte('date', weekStartStr)
        .lte('date', weekEndStr)
        .order('meal_type')
    : { data: [] }

  // Fetch all recipes for the add-meal picker
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, prep_time, cook_time')
    .order('title')

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Meal Planner</h1>
          <p className="page-subtitle">
            {weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            {' – '}
            {weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-2">
          <a
            href={`/planner?week=${prevWeek}`}
            className="btn-secondary px-3"
            aria-label="Previous week"
          >
            ←
          </a>
          {!isCurrentWeek && (
            <a href="/planner" className="btn-secondary text-xs">
              Today
            </a>
          )}
          <a
            href={`/planner?week=${nextWeek}`}
            className="btn-secondary px-3"
            aria-label="Next week"
          >
            →
          </a>
        </div>
      </div>

      {/* No household warning */}
      {!profile?.household_id && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You need a household to save meal plans.{' '}
          <a href="/household" className="font-medium underline underline-offset-2">
            Set one up →
          </a>
        </div>
      )}

      {/* Week grid — interactive client component */}
      <WeekGrid
        days={days}
        mealPlans={mealPlans ?? []}
        recipes={recipes ?? []}
        householdId={profile?.household_id ?? null}
        today={toDateString(new Date())}
      />
    </div>
  )
}
