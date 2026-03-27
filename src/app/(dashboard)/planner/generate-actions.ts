'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logEventServer } from '@/lib/events-server'

type RecipeWithIngredients = {
  id: string
  title: string
  recipe_category: string | null
  servings: number
  prep_time: number | null
  cook_time: number | null
  ingredients: string[]
}

type ProposedMeal = {
  date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner'
  recipe_id: string
  recipe_title: string
  recipe_category: string | null
  servings: number
}

// Map recipe categories to protein types for variety
const PROTEIN_CATEGORIES: Record<string, string> = {
  'Chicken': 'chicken',
  'Beef': 'beef',
  'Seafood': 'seafood',
  'Tacos': 'mixed',
  'Burgers': 'beef',
}

const BREAKFAST_CATEGORY = 'Breakfast'
const LUNCH_CATEGORIES = ['Sandwiches', 'Bowls', 'Soups']
const EASY_CATEGORIES = ['Sandwiches', 'Tacos', 'Bowls']

export async function generateMealPlanPreview(
  householdId: string,
  weekStart: string,
  weekEnd: string,
  dinnersOnly: boolean
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // 1. Fetch all recipes with ingredients
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, recipe_category, servings, prep_time, cook_time')
    .order('title')

  if (!recipes || recipes.length === 0) return { error: 'No recipes found' }

  const { data: allIngredients } = await supabase
    .from('recipe_ingredients')
    .select('recipe_id, ingredient_name')

  const ingredientsByRecipe: Record<string, string[]> = {}
  for (const ing of allIngredients ?? []) {
    if (!ing.recipe_id) continue
    if (!ingredientsByRecipe[ing.recipe_id]) ingredientsByRecipe[ing.recipe_id] = []
    ingredientsByRecipe[ing.recipe_id].push(ing.ingredient_name.toLowerCase())
  }

  const recipesWithIngredients: RecipeWithIngredients[] = recipes.map(r => ({
    ...r,
    ingredients: ingredientsByRecipe[r.id] ?? [],
  }))

  // 2. Fetch pantry items for scoring
  const { data: pantryItems } = await supabase
    .from('pantry_items')
    .select('ingredient_name, stock_level')
    .eq('household_id', householdId)

  const pantrySet = new Set(
    (pantryItems ?? [])
      .filter(p => p.stock_level !== 'out')
      .map(p => p.ingredient_name.toLowerCase())
  )

  // 3. Fetch synonyms for matching
  const { data: synonyms } = await supabase
    .from('ingredient_synonyms')
    .select('canonical_name, variant_name')

  const synonymMap: Record<string, string> = {}
  for (const syn of synonyms ?? []) {
    synonymMap[syn.variant_name.toLowerCase()] = syn.canonical_name.toLowerCase()
  }

  function normalizeName(name: string): string {
    const lower = name.toLowerCase()
    return synonymMap[lower] ?? lower
  }

  // 4. Fetch existing meals for this week
  const { data: existingMeals } = await supabase
    .from('meal_plans')
    .select('id, date, meal_type, recipe_id, custom_meal_name')
    .eq('household_id', householdId)
    .gte('date', weekStart)
    .lte('date', weekEnd)

  const existingSlots = new Set(
    (existingMeals ?? []).map(m => `${m.date}-${m.meal_type}`)
  )
  const existingRecipeIds = new Set(
    (existingMeals ?? []).filter(m => m.recipe_id).map(m => m.recipe_id!)
  )

  // 5. Score recipes by pantry match
  function scoreRecipe(recipe: RecipeWithIngredients): number {
    if (recipe.ingredients.length === 0) return 0
    const matches = recipe.ingredients.filter(ing => {
      const normalized = normalizeName(ing)
      return pantrySet.has(normalized) || pantrySet.has(ing)
    })
    return matches.length / recipe.ingredients.length
  }

  // 6. Generate plan
  const days: string[] = []
  const current = new Date(weekStart + 'T00:00:00')
  const end = new Date(weekEnd + 'T00:00:00')
  while (current <= end) {
    const y = current.getFullYear()
    const m = String(current.getMonth() + 1).padStart(2, '0')
    const d = String(current.getDate()).padStart(2, '0')
    days.push(`${y}-${m}-${d}`)
    current.setDate(current.getDate() + 1)
  }

  const proposed: ProposedMeal[] = []
  const usedRecipeIds = new Set(existingRecipeIds)
  const recentProteins: string[] = []

  // Categorize recipes
  const breakfastRecipes = recipesWithIngredients.filter(r => r.recipe_category === BREAKFAST_CATEGORY)
  const lunchRecipes = recipesWithIngredients.filter(r =>
    LUNCH_CATEGORIES.includes(r.recipe_category ?? '') || r.recipe_category === BREAKFAST_CATEGORY
  )
  const dinnerRecipes = recipesWithIngredients.filter(r =>
    r.recipe_category !== BREAKFAST_CATEGORY
  )

  function pickRecipe(
    pool: RecipeWithIngredients[],
    avoidProteins: string[] = []
  ): RecipeWithIngredients | null {
    const available = pool
      .filter(r => !usedRecipeIds.has(r.id))
      .map(r => ({
        recipe: r,
        score: scoreRecipe(r),
        protein: PROTEIN_CATEGORIES[r.recipe_category ?? ''] ?? 'other',
      }))
      .filter(r => !avoidProteins.includes(r.protein) || avoidProteins.length >= 3)
      .sort((a, b) => b.score - a.score)

    // Add some randomness — pick from top 5
    const candidates = available.slice(0, 5)
    if (candidates.length === 0) return null
    const pick = candidates[Math.floor(Math.random() * candidates.length)]
    return pick.recipe
  }

  for (const day of days) {
    // Dinners (always)
    if (!existingSlots.has(`${day}-dinner`)) {
      const recipe = pickRecipe(dinnerRecipes, recentProteins.slice(-2))
      if (recipe) {
        proposed.push({
          date: day,
          meal_type: 'dinner',
          recipe_id: recipe.id,
          recipe_title: recipe.title,
          recipe_category: recipe.recipe_category,
          servings: recipe.servings,
        })
        usedRecipeIds.add(recipe.id)
        const protein = PROTEIN_CATEGORIES[recipe.recipe_category ?? ''] ?? 'other'
        recentProteins.push(protein)
      }
    }

    if (dinnersOnly) continue

    // Breakfast
    if (!existingSlots.has(`${day}-breakfast`) && breakfastRecipes.length > 0) {
      const recipe = pickRecipe(breakfastRecipes)
      if (recipe) {
        proposed.push({
          date: day,
          meal_type: 'breakfast',
          recipe_id: recipe.id,
          recipe_title: recipe.title,
          recipe_category: recipe.recipe_category,
          servings: recipe.servings,
        })
        usedRecipeIds.add(recipe.id)
      }
    }

    // Lunch
    if (!existingSlots.has(`${day}-lunch`) && lunchRecipes.length > 0) {
      const recipe = pickRecipe(lunchRecipes)
      if (recipe) {
        proposed.push({
          date: day,
          meal_type: 'lunch',
          recipe_id: recipe.id,
          recipe_title: recipe.title,
          recipe_category: recipe.recipe_category,
          servings: recipe.servings,
        })
        usedRecipeIds.add(recipe.id)
      }
    }
  }

  // Count pantry coverage
  const allIngredientNames = new Set<string>()
  const inPantryNames = new Set<string>()
  for (const meal of proposed) {
    const recipe = recipesWithIngredients.find(r => r.id === meal.recipe_id)
    if (!recipe) continue
    for (const ing of recipe.ingredients) {
      const normalized = normalizeName(ing)
      allIngredientNames.add(normalized)
      if (pantrySet.has(normalized) || pantrySet.has(ing)) {
        inPantryNames.add(normalized)
      }
    }
  }

  return {
    success: true,
    proposed,
    summary: {
      mealsPlanned: proposed.length,
      ingredientsInPantry: inPantryNames.size,
      ingredientsToBuy: allIngredientNames.size - inPantryNames.size,
    },
  }
}

export async function commitMealPlan(
  householdId: string,
  meals: { date: string; meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'; recipe_id: string; servings: number }[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const toInsert = meals.map(m => ({
    household_id: householdId,
    date: m.date,
    meal_type: m.meal_type as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    recipe_id: m.recipe_id,
    servings: m.servings,
  }))

  const { error } = await supabase.from('meal_plans').insert(toInsert)
  if (error) return { error: error.message }

  await logEventServer('mealplan.generated', { meals_count: meals.length })
  revalidatePath('/planner')
  return { success: true }
}
