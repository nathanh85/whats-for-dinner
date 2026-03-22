'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logEventServer } from '@/lib/events-server'

export async function addMeal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const householdId = formData.get('household_id') as string
  const date = formData.get('date') as string
  const mealType = formData.get('meal_type') as 'breakfast' | 'lunch' | 'dinner' | 'snack'
  const recipeId = formData.get('recipe_id') as string | null
  const customName = (formData.get('custom_meal_name') as string)?.trim() || null
  const servings = Number(formData.get('servings') ?? 4)
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!householdId) return { error: 'No household found' }
  if (!date) return { error: 'Date is required' }
  if (!mealType) return { error: 'Meal type is required' }
  if (!recipeId && !customName) return { error: 'Choose a recipe or enter a meal name' }

  const { error } = await supabase.from('meal_plans').insert({
    household_id: householdId,
    date: date,
    meal_type: mealType,
    recipe_id: recipeId || null,
    custom_meal_name: recipeId ? null : customName,
    servings,
    notes,
  })

  if (error) {
    await logEventServer('error.server', { message: error.message, action: 'addMeal' })
    return { error: error.message }
  }

  await logEventServer('meal.planned', { recipe_id: recipeId, meal_type: mealType, date })
  revalidatePath('/planner')
  return { success: true }
}

export async function updateMeal(mealPlanId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const recipeId = formData.get('recipe_id') as string | null
  const customName = (formData.get('custom_meal_name') as string)?.trim() || null
  const servings = Number(formData.get('servings') ?? 4)
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!recipeId && !customName) return { error: 'Choose a recipe or enter a meal name' }

  const { error } = await supabase
    .from('meal_plans')
    .update({
      recipe_id: recipeId || null,
      custom_meal_name: recipeId ? null : customName,
      servings,
      notes,
    })
    .eq('id', mealPlanId)

  if (error) return { error: error.message }

  revalidatePath('/planner')
  return { success: true }
}

export async function removeMeal(mealPlanId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('meal_plans')
    .delete()
    .eq('id', mealPlanId)

  if (error) return { error: error.message }

  revalidatePath('/planner')
  return { success: true }
}
