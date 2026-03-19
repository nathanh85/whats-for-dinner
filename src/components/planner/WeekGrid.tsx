'use client'

import { useState, useTransition } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { removeMeal } from '@/app/(dashboard)/planner/actions'
import AddMealModal from './AddMealModal'

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
  breakfast: 'bg-amber-50 border-amber-200 text-amber-800',
  lunch:     'bg-sky-50 border-sky-200 text-sky-800',
  dinner:    'bg-brand-50 border-brand-200 text-brand-800',
  snack:     'bg-stone-50 border-stone-200 text-stone-600',
}

const MEAL_DOT: Record<string, string> = {
  breakfast: 'bg-amber-400',
  lunch:     'bg-sky-400',
  dinner:    'bg-brand-500',
  snack:     'bg-stone-300',
}

export default function WeekGrid({ days, mealPlans, recipes, householdId, today }: Props) {
  const [addingTo, setAddingTo] = useState<{ date: string; mealType: string } | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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

  return (
    <>
      {/* Legend */}
      <div className="mb-4 flex items-center gap-4 text-xs text-stone-500">
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
                  ? 'border-brand-400 bg-brand-50/60 shadow-sm'
                  : 'border-stone-200 bg-white'
              } ${isPast ? 'opacity-60' : ''}`}
            >
              {/* Day header */}
              <div className="mb-2 text-center">
                <p className={`text-xs font-medium ${isToday ? 'text-brand-600' : 'text-stone-400'}`}>
                  {day.label}
                </p>
                <p className={`text-lg font-semibold leading-tight ${
                  isToday ? 'text-brand-700' : 'text-stone-800'
                }`}>
                  {day.dayNum}
                </p>
                {isToday && (
                  <span className="mt-0.5 inline-block rounded-full bg-brand-500 px-1.5 py-px text-[10px] font-medium text-white">
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
                          <span className="min-w-0 flex-1 truncate font-medium leading-tight">
                            {getMealName(meal)}
                          </span>
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

                      {/* Add button — always visible on today, hover on others */}
                      {householdId && (
                        <button
                          onClick={() => setAddingTo({ date: day.date, mealType })}
                          className={`flex w-full items-center gap-1 rounded-md px-1.5 py-1 text-[10px] text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 ${
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

      {/* Empty state */}
      {mealPlans.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-stone-300 py-12 text-center">
          <p className="text-sm font-medium text-stone-500">No meals planned this week</p>
          <p className="mt-1 text-xs text-stone-400">
            {householdId
              ? 'Hover over any day and click a meal slot to get started'
              : 'Set up a household first to start planning meals'}
          </p>
        </div>
      )}

      {/* Add meal modal */}
      {addingTo && (
        <AddMealModal
          date={addingTo.date}
          mealType={addingTo.mealType}
          householdId={householdId!}
          recipes={recipes}
          onClose={() => setAddingTo(null)}
        />
      )}
    </>
  )
}
