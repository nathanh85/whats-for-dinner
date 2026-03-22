'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logEventServer } from '@/lib/events-server'

export async function createRecipe(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const title = (formData.get('title') as string).trim()
  if (!title) return { error: 'Title is required' }

  const prepTime = formData.get('prep_time') ? Number(formData.get('prep_time')) : null
  const cookTime = formData.get('cook_time') ? Number(formData.get('cook_time')) : null
  const servings = formData.get('servings') ? Number(formData.get('servings')) : 4

  const { data: recipe, error } = await supabase
    .from('recipes')
    .insert({
      title,
      description: (formData.get('description') as string).trim() || null,
      instructions: (formData.get('instructions') as string).trim() || null,
      prep_time: prepTime,
      cook_time: cookTime,
      servings,
      image_url: (formData.get('image_url') as string)?.trim() || null,
      source: 'user',
      created_by: user.id,
      is_public: formData.get('is_public') === 'true',
    })
    .select('id')
    .single()

  if (error) {
    await logEventServer('error.server', { message: error.message, action: 'createRecipe' })
    return { error: error.message }
  }

  // Insert ingredients
  const ingredientNames = formData.getAll('ingredient_name') as string[]
  const ingredientQtys = formData.getAll('ingredient_qty') as string[]
  const ingredientUnits = formData.getAll('ingredient_unit') as string[]

  const ingredients = ingredientNames
    .map((name, i) => ({
      recipe_id: recipe.id,
      ingredient_name: name.trim(),
      quantity: ingredientQtys[i] ? Number(ingredientQtys[i]) : null,
      unit: ingredientUnits[i]?.trim() || null,
    }))
    .filter((ing) => ing.ingredient_name)

  if (ingredients.length > 0) {
    await supabase.from('recipe_ingredients').insert(ingredients)
  }

  await logEventServer('recipe.created', { recipe_id: recipe.id })
  redirect(`/recipes/${recipe.id}`)
}

export async function addMealFromRecipe(input: {
  householdId: string
  recipeId: string
  date: string
  mealType: 'breakfast' | 'lunch' | 'dinner'
  servings: number
  notes: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('meal_plans').insert({
    household_id: input.householdId,
    date: input.date,
    meal_type: input.mealType,
    recipe_id: input.recipeId,
    servings: input.servings,
    notes: input.notes,
  })

  if (error) return { error: error.message }

  await logEventServer('meal.planned', {
    recipe_id: input.recipeId,
    meal_type: input.mealType,
    date: input.date,
  })
  return { success: true }
}

export async function logAsCooked(recipeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('recipe_interactions').insert({
    user_id: user.id,
    recipe_id: recipeId,
    cooked_at: new Date().toISOString(),
  })

  if (error) return { error: error.message }

  await logEventServer('recipe.cooked', { recipe_id: recipeId })
  return { success: true }
}
