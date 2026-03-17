import { Plus, Search, Package, AlertTriangle } from 'lucide-react'

const CATEGORIES = ['All', 'Dairy', 'Produce', 'Meat', 'Grains', 'Canned', 'Spices', 'Other']

export default function PantryPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Pantry</h1>
          <p className="page-subtitle">Track what you have on hand</p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4" />
          Add item
        </button>
      </div>

      {/* Stats bar */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="card py-4 text-center">
          <p className="text-2xl font-bold text-stone-900">—</p>
          <p className="text-xs text-stone-500">Total items</p>
        </div>
        <div className="card py-4 text-center">
          <p className="text-2xl font-bold text-amber-500">—</p>
          <p className="text-xs text-stone-500">Expiring soon</p>
        </div>
        <div className="card py-4 text-center">
          <p className="text-2xl font-bold text-red-500">—</p>
          <p className="text-xs text-stone-500">Expired</p>
        </div>
      </div>

      {/* Search + category filter */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input type="search" placeholder="Search pantry…" className="input pl-9" />
        </div>
      </div>

      {/* Category pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              cat === 'All'
                ? 'bg-brand-500 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Empty state */}
      <div className="card flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 rounded-2xl bg-amber-50 p-5">
          <Package className="h-10 w-10 text-amber-400" />
        </div>
        <h3 className="text-lg font-semibold text-stone-900">Pantry is empty</h3>
        <p className="mt-1 max-w-xs text-sm text-stone-500">
          Start adding items to keep track of what you have at home.
        </p>
        <button className="btn-primary mt-6">
          <Plus className="h-4 w-4" />
          Add pantry item
        </button>
      </div>
    </div>
  )
}
