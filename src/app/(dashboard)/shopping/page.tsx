import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ShoppingList from '@/components/shopping/ShoppingList'

export default async function ShoppingPage() {
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
        .from('shopping_items')
        .select('id, ingredient_name, quantity, unit, category, is_checked, source')
        .eq('household_id', householdId)
        .order('is_checked')
        .order('created_at')
    : { data: [] }

  const uncheckedCount = items?.filter(i => !i.is_checked).length ?? 0

  return (
    <div className="mx-auto max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">Shopping List</h1>
        <p className="page-subtitle">
          {uncheckedCount === 0
            ? 'Nothing to buy — you\'re all stocked up!'
            : `${uncheckedCount} item${uncheckedCount !== 1 ? 's' : ''} to buy`}
        </p>
      </div>

      {!householdId ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You need a household to manage your shopping list.{' '}
          <a href="/household" className="font-medium underline underline-offset-2">
            Set one up →
          </a>
        </div>
      ) : (
        <ShoppingList items={items ?? []} householdId={householdId} />
      )}
    </div>
  )
}
