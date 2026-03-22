import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WeekGrid from '@/components/planner/WeekGrid'
import MonthGrid from '@/components/planner/MonthGrid'
import PlannerHeader from '@/components/planner/PlannerHeader'

// Return the Sunday of the week containing `date`
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getMonthRange(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  // Extend to cover full weeks (Sun-Sat)
  const gridStart = getWeekStart(first)
  const gridEnd = addDays(getWeekStart(addDays(last, 6)), 6)
  return { first, last, gridStart, gridEnd }
}

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; view?: string; month?: string }>
}) {
  const { week, view, month } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .maybeSingle()

  const isMonthView = view === 'month'
  const today = toDateString(new Date())

  if (isMonthView) {
    // Month view
    const baseDate = month ? new Date(month + '-01T00:00:00') : new Date()
    const { first, last, gridStart, gridEnd } = getMonthRange(baseDate)
    const gridStartStr = toDateString(gridStart)
    const gridEndStr = toDateString(gridEnd)

    const { data: mealPlans } = profile?.household_id
      ? await supabase
          .from('meal_plans')
          .select('id, date, meal_type, custom_meal_name, recipe_id, recipes(title)')
          .eq('household_id', profile.household_id)
          .gte('date', gridStartStr)
          .lte('date', gridEndStr)
          .order('meal_type')
      : { data: [] }

    const monthLabel = first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const prevMonth = `${first.getFullYear()}-${String(first.getMonth()).padStart(2, '0') || '12'}`
    const prevMonthDate = new Date(first.getFullYear(), first.getMonth() - 1, 1)
    const nextMonthDate = new Date(first.getFullYear(), first.getMonth() + 1, 1)
    const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`
    const nextMonthStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`
    const isCurrentMonth = first.getFullYear() === new Date().getFullYear() && first.getMonth() === new Date().getMonth()

    // Build grid days
    const totalDays = Math.round((gridEnd.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const days = Array.from({ length: totalDays }, (_, i) => {
      const d = addDays(gridStart, i)
      return {
        date: toDateString(d),
        dayNum: d.getDate(),
        isCurrentMonth: d.getMonth() === first.getMonth(),
      }
    })

    return (
      <div className="mx-auto max-w-6xl">
        <PlannerHeader
          view="month"
          label={monthLabel}
          prevHref={`/planner?view=month&month=${prevMonthStr}`}
          nextHref={`/planner?view=month&month=${nextMonthStr}`}
          todayHref={isCurrentMonth ? undefined : '/planner?view=month'}
          weekHref="/planner"
          monthHref={`/planner?view=month${month ? `&month=${month}` : ''}`}
        />

        {!profile?.household_id && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            You need a household to save meal plans.{' '}
            <a href="/household" className="font-medium underline underline-offset-2">Set one up →</a>
          </div>
        )}

        <MonthGrid
          days={days}
          mealPlans={(mealPlans ?? []) as any}
          today={today}
        />
      </div>
    )
  }

  // Week view (default)
  const weekStart = week
    ? new Date(week + 'T00:00:00')
    : getWeekStart(new Date())

  const weekEnd = addDays(weekStart, 6)
  const weekStartStr = toDateString(weekStart)
  const weekEndStr = toDateString(weekEnd)

  const days = Array.from({ length: 7 }, (_, i) => ({
    date: toDateString(addDays(weekStart, i)),
    label: addDays(weekStart, i).toLocaleDateString('en-US', { weekday: 'short' }),
    dayNum: addDays(weekStart, i).getDate(),
    month: addDays(weekStart, i).toLocaleDateString('en-US', { month: 'short' }),
  }))

  const prevWeek = toDateString(addDays(weekStart, -7))
  const nextWeek = toDateString(addDays(weekStart, 7))
  const isCurrentWeek = toDateString(getWeekStart(new Date())) === weekStartStr

  const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`

  const { data: mealPlans } = profile?.household_id
    ? await supabase
        .from('meal_plans')
        .select('id, date, meal_type, custom_meal_name, servings, notes, recipe_id, recipes(title)')
        .eq('household_id', profile.household_id)
        .gte('date', weekStartStr)
        .lte('date', weekEndStr)
        .order('meal_type')
    : { data: [] }

  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, prep_time, cook_time')
    .order('title')

  return (
    <div className="mx-auto max-w-6xl">
      <PlannerHeader
        view="week"
        label={weekLabel}
        prevHref={`/planner?week=${prevWeek}`}
        nextHref={`/planner?week=${nextWeek}`}
        todayHref={isCurrentWeek ? undefined : '/planner'}
        weekHref={`/planner${week ? `?week=${week}` : ''}`}
        monthHref="/planner?view=month"
      />

      {!profile?.household_id && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          You need a household to save meal plans.{' '}
          <a href="/household" className="font-medium underline underline-offset-2">Set one up →</a>
        </div>
      )}

      <WeekGrid
        days={days}
        mealPlans={(mealPlans ?? []) as unknown as Parameters<typeof WeekGrid>[0]['mealPlans']}
        recipes={recipes ?? []}
        householdId={profile?.household_id ?? null}
        today={today}
      />
    </div>
  )
}
