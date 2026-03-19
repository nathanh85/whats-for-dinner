'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addPantryItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const householdId = formData.get('household_id') as string
  if (!householdId) return { error: 'No household found' }

  const ingredientName = (formData.get('ingredient_name') as string).trim()
  if (!ingredientName) return { error: 'Item name is required' }

  const quantity = Number(formData.get('quantity') ?? 1)
  const unit = (formData.get('unit') as string)?.trim() || null
  const category = (formData.get('category') as string)?.trim() || null
  const expiryDate = (formData.get('expiry_date') as string) || null

  const { error } = await supabase.from('pantry_items').insert({
    household_id: householdId,
    ingredient_name: ingredientName,
    quantity,
    unit,
    category,
    expiry_date: expiryDate,
  })

  if (error) return { error: error.message }

  revalidatePath('/pantry')
  return { success: true }
}

export async function updatePantryItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const id = formData.get('id') as string
  const quantity = Number(formData.get('quantity'))

  const { error } = await supabase
    .from('pantry_items')
    .update({ quantity })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/pantry')
  return { success: true }
}

export async function deletePantryItem(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('pantry_items')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/pantry')
  return { success: true }
}
