import { CalendarDays, Plus } from 'lucide-react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'] as const

export default function PlannerPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Meal Planner</h1>
          <p className="page-subtitle">Plan your household meals for the week</p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4" />
          Add meal
        </button>
      </div>

      {/* Week navigation */}
      <div className="mb-6 flex items-center gap-3">
        <button className="btn-secondary text-xs">← Prev week</button>
        <span className="flex items-center gap-1.5 text-sm font-medium text-stone-700">
          <CalendarDays className="h-4 w-4 text-stone-400" />
          This week
        </span>
        <button className="btn-secondary text-xs">Next week →</button>
      </div>

      {/* Planner grid */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr>
              <th className="w-24 pb-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-400" />
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="pb-3 text-center text-xs font-semibold uppercase tracking-wider text-stone-400"
                >
                  {day.slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {MEAL_TYPES.map((meal) => (
              <tr key={meal}>
                <td className="py-3 pr-4 text-sm font-medium text-stone-500">{meal}</td>
                {DAYS.map((day) => (
                  <td key={day} className="px-1 py-2">
                    <button className="group flex h-16 w-full flex-col items-center justify-center rounded-lg border border-dashed border-stone-200 bg-white transition-colors hover:border-brand-300 hover:bg-brand-50">
                      <Plus className="h-4 w-4 text-stone-300 transition-colors group-hover:text-brand-400" />
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-center text-sm text-stone-400">
        Connect your recipes to start filling in the planner.
      </p>
    </div>
  )
}
