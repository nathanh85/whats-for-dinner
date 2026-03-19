import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ShoppingBasket } from 'lucide-react'
import PantryList from '@/components/pantry/PantryList'

export default async function PantryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .maybeSingle()

  const householdId = profile?.household_id ?? null

  const { data: items } = householdId
    ? await supabase
        .from('pantry_items')
        .select('id, ingredient_name, quantity, unit, category, expiry_date, low_stock_threshold')
        .eq('household_id', householdId)
        .order('category', { nullsFirst: false })
        .order('ingredient_name')
    : { data: [] }

  const totalItems = items?.length ?? 0
  const lowStockCount = items?.filter(i => i.quantity <= i.low_stock_threshold).length ?? 0

  return (
    <div className="mx-auto max-w-3xl">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Pantry</h1>
          <p className="page-subtitle">
            {totalItems === 0
              ? 'Track what you have on hand'
              : `${totalItems} item${totalItems !== 1 ? 's' : ''}${lowStockCount > 0 ? ` · ${lowStockCount} low stock` : ''}`
            }
          </p>
        </div>
        <ShoppingBasket className="h-6 w-6 text-stone-300 mt-1" />
      </div>

      {!householdId ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You need a household to manage your pantry.{' '}
          <a href="/household" className="font-medium underline underline-offset-2">
            Set one up →
          </a>
        </div>
      ) : (
        <PantryList items={items ?? []} householdId={householdId} />
      )}
    </div>
  )
}
