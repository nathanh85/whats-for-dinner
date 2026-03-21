'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// Helper: Monday of the current week
function getWeekRange() {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(today)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  }
}

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

  // Get profile id for added_by
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

export async function generateFromMealPlan(householdId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { start, end } = getWeekRange()

  // Get this week's meal plans that have a recipe
  const { data: plans, error: plansError } = await supabase
    .from('meal_plans')
    .select('recipe_id, servings')
    .eq('household_id', householdId)
    .gte('date', start)
    .lte('date', end)
    .not('recipe_id', 'is', null)

  if (plansError) return { error: plansError.message }
  if (!plans || plans.length === 0) return { error: 'No recipes planned this week' }

  const recipeIds = Array.from(new Set(plans.map(p => p.recipe_id!)))

  // Get all ingredients for those recipes
  const { data: ingredients, error: ingError } = await supabase
    .from('recipe_ingredients')
    .select('recipe_id, ingredient_name, quantity, unit')
    .in('recipe_id', recipeIds)

  if (ingError) return { error: ingError.message }
  if (!ingredients || ingredients.length === 0) {
    return { error: 'No ingredients found for this week\'s recipes' }
  }

  // Get existing shopping items to avoid duplicates
  const { data: existing } = await supabase
    .from('shopping_items')
    .select('ingredient_name')
    .eq('household_id', householdId)
    .eq('is_checked', false)

  const existingNames = new Set(
    (existing ?? []).map(i => i.ingredient_name.toLowerCase().trim())
  )

  // Build insert list — skip already-on-list items
  const toInsert = ingredients
    .filter(ing => !existingNames.has(ing.ingredient_name.toLowerCase().trim()))
    .map(ing => ({
      household_id: householdId,
      ingredient_name: ing.ingredient_name,
      quantity: ing.quantity ?? 1,
      unit: ing.unit ?? null,
      source: 'meal_plan' as const,
      is_checked: false,
    }))

  if (toInsert.length === 0) {
    return { error: 'All ingredients are already on your list' }
  }

  const { error: insertError } = await supabase
    .from('shopping_items')
    .insert(toInsert)

  if (insertError) return { error: insertError.message }

  revalidatePath('/shopping')
  return { success: true, added: toInsert.length }
}
