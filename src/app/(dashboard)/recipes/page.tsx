import { Plus, Search, BookOpen } from 'lucide-react'

export default function RecipesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Recipes</h1>
          <p className="page-subtitle">Your household recipe collection</p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4" />
          Add recipe
        </button>
      </div>

      {/* Search + filters */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            placeholder="Search recipes…"
            className="input pl-9"
          />
        </div>
        <select className="input w-auto">
          <option value="">All tags</option>
          <option value="quick">Quick</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="chicken">Chicken</option>
        </select>
      </div>

      {/* Empty state */}
      <div className="card flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 rounded-2xl bg-brand-50 p-5">
          <BookOpen className="h-10 w-10 text-brand-400" />
        </div>
        <h3 className="text-lg font-semibold text-stone-900">No recipes yet</h3>
        <p className="mt-1 max-w-xs text-sm text-stone-500">
          Add your first recipe to start building your household collection.
        </p>
        <button className="btn-primary mt-6">
          <Plus className="h-4 w-4" />
          Add your first recipe
        </button>
      </div>
    </div>
  )
}
