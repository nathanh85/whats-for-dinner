'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logEvent } from '@/lib/events'
import { UserPlus, X, Loader2 } from 'lucide-react'

const AVATAR_COLORS = [
  '#5DCAA5', '#F97316', '#8B5CF6', '#EC4899',
  '#3B82F6', '#EAB308', '#14B8A6', '#EF4444',
]

const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free',
  'Nut-free', 'Keto', 'Halal', 'Kosher',
]

export default function AddManagedProfileModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(AVATAR_COLORS[0])
  const [dietary, setDietary] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleDietary(item: string) {
    setDietary((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: rpcError } = await supabase.rpc('create_managed_profile', {
        p_display_name: name.trim(),
        p_avatar_color: color,
        p_dietary_restrictions: dietary,
      })

      if (rpcError) throw rpcError

      logEvent('managed_profile.created', { display_name: name.trim() })
      setOpen(false)
      setName('')
      setColor(AVATAR_COLORS[0])
      setDietary([])
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add member'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary text-xs">
        <UserPlus className="h-3.5 w-3.5" />
        Add member
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-surface-raised p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-stone-900 dark:text-dt-primary">Add household member</h3>
          <button onClick={() => setOpen(false)} className="text-stone-400 dark:text-dt-muted hover:text-stone-600 dark:hover:text-dt-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-stone-500 dark:text-dt-muted">
          Add someone who doesn&apos;t need their own account (kids, family members, etc.)
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="mp-name" className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-dt-secondary">
              Display name
            </label>
            <input
              id="mp-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g. Emma"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-dt-secondary">
              Avatar color
            </label>
            <div className="flex gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full transition ${
                    color === c ? 'ring-2 ring-offset-2 ring-brand-500' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-dt-secondary">
              Dietary restrictions
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleDietary(item)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    dietary.includes(item)
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-stone-100 dark:bg-surface-hover text-stone-600 dark:text-dt-secondary hover:bg-stone-200 dark:hover:bg-surface-hover'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Add member
          </button>
        </form>
      </div>
    </div>
  )
}
