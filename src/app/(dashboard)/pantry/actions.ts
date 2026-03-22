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

  const category = (formData.get('category') as string)?.trim() || null
  const stockLevel = ((formData.get('stock_level') as string) || 'medium') as 'high' | 'medium' | 'low' | 'out'
  const mealCountStr = formData.get('meal_count') as string
  const mealCount = mealCountStr ? Number(mealCountStr) : null
  const notes = (formData.get('notes') as string)?.trim() || null

  const { error } = await supabase.from('pantry_items').insert({
    household_id: householdId,
    ingredient_name: ingredientName,
    category,
    stock_level: stockLevel,
    meal_count: mealCount,
    notes,
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
  const stockLevel = (formData.get('stock_level') as string) as 'high' | 'medium' | 'low' | 'out'
  const mealCountStr = formData.get('meal_count') as string
  const mealCount = mealCountStr ? Number(mealCountStr) : null
  const notes = (formData.get('notes') as string)?.trim() || null
  const quantity = Number(formData.get('quantity') ?? 0)
  const unit = (formData.get('unit') as string)?.trim() || null

  const { error } = await supabase
    .from('pantry_items')
    .update({
      stock_level: stockLevel,
      meal_count: mealCount,
      notes,
      quantity,
      unit,
    })
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
