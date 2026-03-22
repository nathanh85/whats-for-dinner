'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logEventServer } from '@/lib/events-server'
import type { GroceryListItem } from '@/types/database'

export async function addShoppingItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const householdId = formData.get('household_id') as string
  if (!householdId) return { error: 'No household found' }

  const ingredientName = (formData.get('ingredient_name') as string)?.trim()
  if (!ingredientName) return { error: 'Item name is required' }

  const quantity = Number(formData.get('quantity') || 1)
  const unit = (formData.get('unit') as string)?.trim() || null
  const category = (formData.get('category') as string)?.trim() || null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  const { error } = await supabase.from('shopping_items').insert({
    household_id: householdId,
    ingredient_name: ingredientName,
    quantity,
    unit,
    category,
    source: 'manual',
    added_by: profile?.id ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath('/shopping')
  return { success: true }
}

export async function toggleShoppingItem(id: string, currentValue: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('shopping_items')
    .update({ is_checked: !currentValue })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/shopping')
  return { success: true }
}

export async function deleteShoppingItem(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('shopping_items')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/shopping')
  return { success: true }
}

export async function clearCheckedItems(householdId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('shopping_items')
    .delete()
    .eq('household_id', householdId)
    .eq('is_checked', true)

  if (error) return { error: error.message }

  revalidatePath('/shopping')
  return { success: true }
}

export async function generateGroceryList(householdId: string, startDate: string, endDate: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', items: [] as GroceryListItem[] }

  const { data, error } = await supabase.rpc('generate_grocery_list', {
    p_household_id: householdId,
    p_start_date: startDate,
    p_end_date: endDate,
  })

  if (error) return { error: error.message, items: [] as GroceryListItem[] }
  if (!data || data.length === 0) return { error: 'No recipes with ingredients found for this date range', items: [] as GroceryListItem[] }

  return { items: data as GroceryListItem[] }
}

export async function addToShoppingList(
  householdId: string,
  items: { ingredient_name: string; quantity: number; unit: string | null; category: string }[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  const toInsert = items.map(item => ({
    household_id: householdId,
    ingredient_name: item.ingredient_name,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    source: 'meal_plan' as const,
    is_checked: false,
    added_by: profile?.id ?? null,
  }))

  const { error } = await supabase.from('shopping_items').insert(toInsert)

  if (error) return { error: error.message }

  await logEventServer('shopping.generated', { items_added: toInsert.length })
  revalidatePath('/shopping')
  return { success: true, added: toInsert.length }
}
