'use client'

import { useState, useTransition } from 'react'
import { Plus, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { removeMeal } from '@/app/(dashboard)/planner/actions'
import AddMealModal, { type ExistingMeal } from './AddMealModal'

type Day = {
  date: string
  label: string
  dayNum: number
  month: string
}

type MealPlan = {
  id: string
  date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  custom_meal_name: string | null
  servings: number
  notes: string | null
  recipe_id: string | null
  recipes: { title: string } | null
}

type Recipe = {
  id: string
  title: string
  prep_time: number | null
  cook_time: number | null
}

type Props = {
  days: Day[]
  mealPlans: MealPlan[]
  recipes: Recipe[]
  householdId: string | null
  today: string
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const

const MEAL_COLORS: Record<string, string> = {
  breakfast: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300',
  lunch:     'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-900/30 dark:border-sky-800 dark:text-sky-300',
  dinner:    'bg-brand-50 border-brand-200 text-brand-800 dark:bg-accent/15 dark:border-accent/30 dark:text-accent',
  snack:     'bg-stone-50 border-stone-200 text-stone-600 dark:bg-surface dark:border-surface-border dark:text-dt-secondary',
}

const MEAL_DOT: Record<string, string> = {
  breakfast: 'bg-amber-400',
  lunch:     'bg-sky-400',
  dinner:    'bg-brand-500 dark:bg-accent',
  snack:     'bg-stone-300 dark:bg-dt-muted',
}

const MEAL_LABEL_COLOR: Record<string, string> = {
  breakfast: 'text-amber-600 dark:text-amber-400',
  lunch:     'text-sky-600 dark:text-sky-400',
  dinner:    'text-brand-600 dark:text-accent',
  snack:     'text-stone-500 dark:text-dt-muted',
}

export default function WeekGrid({ days, mealPlans, recipes, householdId, today }: Props) {
  const todayIdx = days.findIndex(d => d.date === today)
  const [selectedDayIdx, setSelectedDayIdx] = useState(todayIdx >= 0 ? todayIdx : 0)
  const [modalState, setModalState] = useState<{
    date: string
    mealType: string
    existingMeal?: ExistingMeal
  } | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function getMealsForDay(date: string, mealType: string) {
    return mealPlans.filter(m => m.date === date && m.meal_type === mealType)
  }

  function getMealName(meal: MealPlan) {
    return meal.recipes?.title ?? meal.custom_meal_name ?? 'Unnamed meal'
  }

  function handleRemove(id: string) {
    setRemovingId(id)
    startTransition(async () => {
      await removeMeal(id)
      setRemovingId(null)
    })
  }

  function openEditModal(meal: MealPlan, date: string, mealType: string) {
    setModalState({
      date,
      mealType,
      existingMeal: {
        id: meal.id,
        recipe_id: meal.recipe_id,
        custom_meal_name: meal.custom_meal_name,
        servings: meal.servings,
        notes: meal.notes,
      },
    })
  }

  // ── Mobile: single-day view ─────────────────────────────────────────
  const selectedDay = days[selectedDayIdx]

  const MobileDayView = () => (
    <div className="md:hidden">
      {/* Week strip */}
      <div className="mb-4 flex items-center gap-1">
        <button
          onClick={() => setSelectedDayIdx(i => Math.max(0, i - 1))}
          disabled={selectedDayIdx === 0}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 disabled:opacity-30 dark:text-dt-muted dark:hover:bg-surface-hover"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex flex-1 gap-1">
          {days.map((day, idx) => {
            const isSelected = idx === selectedDayIdx
            const isToday = day.date === today
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDayIdx(idx)}
                className={`flex flex-1 flex-col items-center rounded-lg py-1.5 text-center transition-colors ${
                  isSelected
                    ? 'bg-brand-500 text-white dark:bg-accent dark:text-surface'
                    : isToday
                    ? 'bg-brand-50 text-brand-600 dark:bg-accent/15 dark:text-accent'
                    : 'text-stone-500 hover:bg-stone-100 dark:text-dt-muted dark:hover:bg-surface-hover'
                }`}
              >
                <span className="text-[10px] font-medium">{day.label[0]}</span>
                <span className="text-sm font-semibold leading-tight">{day.dayNum}</span>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setSelectedDayIdx(i => Math.min(days.length - 1, i + 1))}
          disabled={selectedDayIdx === days.length - 1}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 disabled:opacity-30 dark:text-dt-muted dark:hover:bg-surface-hover"
          aria-label="Next day"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day heading */}
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-dt-primary">
          {new Date(selectedDay.date + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long', month: 'short', day: 'numeric',
          })}
        </h2>
        {selectedDay.date === today && (
          <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-medium text-white dark:bg-accent dark:text-surface">
            today
          </span>
        )}
      </div>

      {/* Meal slots */}
      <div className="space-y-3">
        {MEAL_TYPES.map((mealType) => {
          const meals = getMealsForDay(selectedDay.date, mealType)
          return (
            <div key={mealType} className="rounded-xl border border-stone-100 bg-white p-3 dark:border-surface-border dark:bg-surface-raised">
              <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${MEAL_LABEL_COLOR[mealType]}`}>
                <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${MEAL_DOT[mealType]}`} />
                {mealType}
              </p>

              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className={`mb-2 flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 ${MEAL_COLORS[mealType]}`}
                >
                  <button
                    onClick={() => openEditModal(meal, selectedDay.date, mealType)}
                    className="min-w-0 flex-1 text-left text-sm font-medium leading-tight hover:underline"
                  >
                    {getMealName(meal)}
                  </button>
                  <button
                    onClick={() => handleRemove(meal.id)}
                    disabled={removingId === meal.id}
                    className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-lg hover:bg-black/10 disabled:opacity-40"
                    aria-label="Remove meal"
                  >
                    {removingId === meal.id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <X className="h-4 w-4" />
                    }
                  </button>
                </div>
              ))}

              {householdId && (
                <button
                  onClick={() => setModalState({ date: selectedDay.date, mealType })}
                  className="flex min-h-[44px] w-full items-center gap-2 rounded-lg border-2 border-dashed border-stone-200 px-3 text-sm text-stone-400 transition-colors hover:border-brand-300 hover:text-brand-500 dark:border-surface-border dark:text-dt-muted dark:hover:border-accent/50 dark:hover:text-accent"
                >
                  <Plus className="h-4 w-4" />
                  Add {mealType}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {mealPlans.length === 0 && (
        <p className="mt-4 text-center text-sm text-stone-400 dark:text-dt-muted">
          {householdId ? 'Tap a meal slot to get started' : 'Set up a household first'}
        </p>
      )}
    </div>
  )

  // ── Desktop: 7-column grid ──────────────────────────────────────────
  const DesktopGrid = () => (
    <div className="hidden md:block">
      {/* Legend */}
      <div className="mb-4 flex items-center gap-4 text-xs text-stone-500 dark:text-dt-secondary">
        {MEAL_TYPES.map(type => (
          <span key={type} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${MEAL_DOT[type]}`} />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isToday = day.date === today
          const isPast = day.date < today

          return (
            <div
              key={day.date}
              className={`flex min-h-[200px] flex-col rounded-xl border p-2 transition-colors ${
                isToday
                  ? 'border-brand-400 bg-brand-50/60 shadow-sm dark:border-accent dark:bg-accent/10'
                  : 'border-stone-200 bg-white dark:border-surface-border dark:bg-surface-raised'
              } ${isPast ? 'opacity-60' : ''}`}
            >
              {/* Day header */}
              <div className="mb-2 text-center">
                <p className={`text-xs font-medium ${isToday ? 'text-brand-600 dark:text-accent' : 'text-stone-400 dark:text-dt-muted'}`}>
                  {day.label}
                </p>
                <p className={`text-lg font-semibold leading-tight ${
                  isToday ? 'text-brand-700 dark:text-accent' : 'text-stone-800 dark:text-dt-primary'
                }`}>
                  {day.dayNum}
                </p>
                {isToday && (
                  <span className="mt-0.5 inline-block rounded-full bg-brand-500 px-1.5 py-px text-[10px] font-medium text-white dark:bg-accent dark:text-surface">
                    today
                  </span>
                )}
              </div>

              {/* Meal slots */}
              <div className="flex flex-1 flex-col gap-1.5">
                {MEAL_TYPES.map((mealType) => {
                  const meals = getMealsForDay(day.date, mealType)

                  return (
                    <div key={mealType} className="group/slot">
                      {meals.map((meal) => (
                        <div
                          key={meal.id}
                          className={`mb-1 flex items-start justify-between gap-1 rounded-lg border px-2 py-1.5 text-xs ${MEAL_COLORS[mealType]}`}
                        >
                          <button
                            onClick={() => openEditModal(meal, day.date, mealType)}
                            className="min-w-0 flex-1 truncate text-left font-medium leading-tight hover:underline"
                          >
                            {getMealName(meal)}
                          </button>
                          <button
                            onClick={() => handleRemove(meal.id)}
                            disabled={removingId === meal.id}
                            className="ml-1 flex-shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:bg-black/10 group-hover/slot:opacity-100"
                            aria-label="Remove meal"
                          >
                            {removingId === meal.id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <X className="h-3 w-3" />
                            }
                          </button>
                        </div>
                      ))}

                      {householdId && (
                        <button
                          onClick={() => setModalState({ date: day.date, mealType })}
                          className={`flex w-full items-center gap-1 rounded-md px-1.5 py-1 text-[10px] text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:text-dt-muted dark:hover:bg-surface-hover dark:hover:text-dt-secondary ${
                            isToday ? 'opacity-100' : 'opacity-0 group-hover/slot:opacity-100'
                          }`}
                        >
                          <Plus className="h-3 w-3" />
                          {mealType}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {mealPlans.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-stone-300 py-12 text-center dark:border-surface-border">
          <p className="text-sm font-medium text-stone-500 dark:text-dt-secondary">No meals planned this week</p>
          <p className="mt-1 text-xs text-stone-400 dark:text-dt-muted">
            {householdId
              ? 'Hover over any day and click a meal slot to get started'
              : 'Set up a household first to start planning meals'}
          </p>
        </div>
      )}
    </div>
  )

  return (
    <>
      <MobileDayView />
      <DesktopGrid />

      {/* Add / Edit meal modal */}
      {modalState && (
        <AddMealModal
          date={modalState.date}
          mealType={modalState.mealType}
          householdId={householdId!}
          recipes={recipes}
          existingMeal={modalState.existingMeal}
          onClose={() => setModalState(null)}
        />
      )}
    </>
  )
}
