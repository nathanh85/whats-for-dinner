type Props = {
  view: 'week' | 'month'
  label: string
  prevHref: string
  nextHref: string
  todayHref?: string
  weekHref: string
  monthHref: string
}

export default function PlannerHeader({ view, label, prevHref, nextHref, todayHref, weekHref, monthHref }: Props) {
  return (
    <div className="page-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="page-title">Meal Planner</h1>
        <p className="page-subtitle">{label}</p>
      </div>

      <div className="flex items-center gap-2">
        {/* View toggle — desktop only */}
        <div className="hidden md:flex items-center rounded-lg border border-stone-200 p-0.5 dark:border-surface-border">
          <a
            href={weekHref}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              view === 'week'
                ? 'bg-brand-500 text-white dark:bg-accent dark:text-surface'
                : 'text-stone-500 hover:text-stone-700 dark:text-dt-muted dark:hover:text-dt-secondary'
            }`}
          >
            Week
          </a>
          <a
            href={monthHref}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              view === 'month'
                ? 'bg-brand-500 text-white dark:bg-accent dark:text-surface'
                : 'text-stone-500 hover:text-stone-700 dark:text-dt-muted dark:hover:text-dt-secondary'
            }`}
          >
            Month
          </a>
        </div>

        {/* Nav arrows */}
        <a href={prevHref} className="btn-secondary px-3" aria-label="Previous">←</a>
        {todayHref && (
          <a href={todayHref} className="btn-secondary text-xs">Today</a>
        )}
        <a href={nextHref} className="btn-secondary px-3" aria-label="Next">→</a>
      </div>
    </div>
  )
}
