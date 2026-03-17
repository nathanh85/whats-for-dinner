'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search } from 'lucide-react'
import { useTransition } from 'react'

export default function RecipeSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const currentFilter = searchParams.get('filter') ?? 'all'

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      params.set('q', e.target.value)
    } else {
      params.delete('q')
    }
    startTransition(() => router.replace(`${pathname}?${params.toString()}`))
  }

  function handleFilter(filter: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (filter === 'all') {
      params.delete('filter')
    } else {
      params.set('filter', filter)
    }
    startTransition(() => router.replace(`${pathname}?${params.toString()}`))
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          defaultValue={searchParams.get('q') ?? ''}
          onChange={handleSearch}
          placeholder="Search recipes…"
          className="input pl-9"
        />
      </div>
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'All recipes' },
          { value: 'mine', label: 'My recipes' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleFilter(value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              currentFilter === value
                ? 'bg-brand-500 text-white'
                : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
