import { Plus, ShoppingCart, Trash2 } from 'lucide-react'

export default function ShoppingPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Shopping List</h1>
          <p className="page-subtitle">Items your household needs to buy</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-xs">
            <Trash2 className="h-3.5 w-3.5" />
            Clear checked
          </button>
          <button className="btn-primary">
            <Plus className="h-4 w-4" />
            Add item
          </button>
        </div>
      </div>

      {/* Quick add */}
      <div className="mb-6 flex items-center gap-2">
        <input
          type="text"
          placeholder="Quick add an item…"
          className="input flex-1"
        />
        <button className="btn-primary">Add</button>
      </div>

      {/* Generate from plan */}
      <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50 p-4">
        <p className="text-sm font-medium text-brand-800">
          Generate from meal plan
        </p>
        <p className="mt-0.5 text-xs text-brand-600">
          Automatically add missing ingredients based on this week&apos;s planned meals.
        </p>
        <button className="btn-primary mt-3 text-xs">
          Generate shopping list
        </button>
      </div>

      {/* Empty state */}
      <div className="card flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 rounded-2xl bg-purple-50 p-5">
          <ShoppingCart className="h-10 w-10 text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-stone-900">List is empty</h3>
        <p className="mt-1 max-w-xs text-sm text-stone-500">
          Add items manually or generate from your meal plan.
        </p>
      </div>
    </div>
  )
}
