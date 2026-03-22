type Day = {
  date: string
  dayNum: number
  isCurrentMonth: boolean
}

type MealPlan = {
  id: string
  date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  custom_meal_name: string | null
  recipe_id: string | null
  recipes: { title: string } | null
}

type Props = {
  days: Day[]
  mealPlans: MealPlan[]
  today: string
}

const MEAL_DOT: Record<string, string> = {
  breakfast: 'bg-amber-400',
  lunch:     'bg-sky-400',
  dinner:    'bg-brand-500 dark:bg-accent',
  snack:     'bg-stone-300 dark:bg-dt-muted',
}

const MEAL_PILL: Record<string, string> = {
  breakfast: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  lunch:     'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  dinner:    'bg-brand-50 text-brand-700 dark:bg-accent/15 dark:text-accent',
  snack:     'bg-stone-50 text-stone-500 dark:bg-surface dark:text-dt-muted',
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function MonthGrid({ days, mealPlans, today }: Props) {
  function getMealsForDay(date: string) {
    return mealPlans.filter(m => m.date === date)
  }

  function getMealName(meal: MealPlan) {
    return meal.recipes?.title ?? meal.custom_meal_name ?? 'Unnamed'
  }

  // Desktop only — hidden on mobile (mobile stays on week view)
  return (
    <div className="hidden md:block">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(day => (
          <div key={day} className="py-2 text-center text-xs font-medium text-stone-400 dark:text-dt-muted">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-l border-t border-stone-200 dark:border-surface-border">
        {days.map(day => {
          const isToday = day.date === today
          const meals = getMealsForDay(day.date)
          // Link to week view for this day's week
          const d = new Date(day.date + 'T00:00:00')
          const weekSunday = new Date(d)
          weekSunday.setDate(d.getDate() - d.getDay())
          const weekParam = `${weekSunday.getFullYear()}-${String(weekSunday.getMonth() + 1).padStart(2, '0')}-${String(weekSunday.getDate()).padStart(2, '0')}`

          return (
            <div
              key={day.date}
              className={`min-h-[100px] border-b border-r border-stone-200 p-1.5 dark:border-surface-border ${
                day.isCurrentMonth
                  ? 'bg-white dark:bg-surface-raised'
                  : 'bg-stone-50/50 dark:bg-surface/50'
              }`}
            >
              {/* Day number — clickable to switch to week view */}
              <a
                href={`/planner?week=${weekParam}`}
                className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors hover:bg-stone-100 dark:hover:bg-surface-hover ${
                  isToday
                    ? 'bg-brand-500 text-white dark:bg-accent dark:text-surface'
                    : day.isCurrentMonth
                    ? 'text-stone-700 dark:text-dt-primary'
                    : 'text-stone-300 dark:text-dt-muted'
                }`}
              >
                {day.dayNum}
              </a>

              {/* Meal pills */}
              <div className="space-y-0.5">
                {meals.slice(0, 3).map(meal => (
                  <div
                    key={meal.id}
                    className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium leading-tight ${MEAL_PILL[meal.meal_type]}`}
                  >
                    {getMealName(meal)}
                  </div>
                ))}
                {meals.length > 3 && (
                  <p className="px-1.5 text-[10px] text-stone-400 dark:text-dt-muted">
                    +{meals.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-xs text-stone-500 dark:text-dt-secondary">
        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(type => (
          <span key={type} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${MEAL_DOT[type]}`} />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        ))}
        <span className="ml-auto text-stone-400 dark:text-dt-muted">Click a date to switch to week view</span>
      </div>
    </div>
  )
}
