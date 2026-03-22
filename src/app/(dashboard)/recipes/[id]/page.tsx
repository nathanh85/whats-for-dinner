import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock, Users, ArrowLeft, ChefHat } from 'lucide-react'
import RecipePlaceholder from '@/components/recipes/RecipePlaceholder'

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: recipe }, { data: ingredients }] = await Promise.all([
    supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single(),
    supabase
      .from('recipe_ingredients')
      .select('*')
      .eq('recipe_id', id)
      .order('id'),
  ])

  if (!recipe) notFound()

  const totalTime = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back */}
      <Link
        href="/recipes"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to recipes
      </Link>

      {/* Header */}
      <div className="card mb-6">
        <RecipePlaceholder
          category={recipe.recipe_category}
          iconSize="lg"
          className="mb-4 h-40 rounded-xl"
        />

        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-stone-900">{recipe.title}</h1>
          {recipe.source === 'seeded' && (
            <span className="flex-shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-400">
              starter recipe
            </span>
          )}
        </div>

        {recipe.description && (
          <p className="mt-2 text-stone-600">{recipe.description}</p>
        )}

        {/* Stats */}
        <div className="mt-4 flex flex-wrap gap-6 border-t border-stone-100 pt-4">
          {recipe.prep_time && (
            <div className="text-center">
              <p className="text-lg font-semibold text-stone-900">{recipe.prep_time}m</p>
              <p className="text-xs text-stone-400">Prep</p>
            </div>
          )}
          {recipe.cook_time && (
            <div className="text-center">
              <p className="text-lg font-semibold text-stone-900">{recipe.cook_time}m</p>
              <p className="text-xs text-stone-400">Cook</p>
            </div>
          )}
          {totalTime > 0 && (
            <div className="text-center">
              <p className="text-lg font-semibold text-stone-900">{totalTime}m</p>
              <p className="text-xs text-stone-400">Total</p>
            </div>
          )}
          {recipe.servings && (
            <div className="text-center">
              <p className="text-lg font-semibold text-stone-900">{recipe.servings}</p>
              <p className="text-xs text-stone-400">Servings</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Ingredients */}
        <div className="card sm:col-span-1">
          <h2 className="mb-4 font-semibold text-stone-900">Ingredients</h2>
          {ingredients && ingredients.length > 0 ? (
            <ul className="space-y-2">
              {ingredients.map((ing) => (
                <li key={ing.id} className="flex items-baseline gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-400" />
                  <span className="text-stone-600">
                    {ing.quantity && (
                      <span className="font-medium text-stone-900">
                        {ing.quantity}{ing.unit ? ` ${ing.unit}` : ''}{' '}
                      </span>
                    )}
                    {ing.ingredient_name}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-stone-400">No ingredients listed.</p>
          )}
        </div>

        {/* Instructions */}
        <div className="card sm:col-span-2">
          <h2 className="mb-4 font-semibold text-stone-900">Instructions</h2>
          {recipe.instructions ? (
            <div className="prose prose-sm prose-stone max-w-none">
              {recipe.instructions.split('\n').filter(Boolean).map((step, i) => (
                <div key={i} className="mb-4 flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                    {i + 1}
                  </span>
                  <p className="text-sm text-stone-700 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-400">No instructions yet.</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center gap-3">
        <button className="btn-primary">
          <ChefHat className="h-4 w-4" />
          Add to meal plan
        </button>
        <button className="btn-secondary">
          <Clock className="h-4 w-4" />
          Log as cooked
        </button>
      </div>
    </div>
  )
}
