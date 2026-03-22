import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, BookOpen } from 'lucide-react'
import RecipeActions from '@/components/recipes/RecipeActions'

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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

  // Get household_id for meal plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user!.id)
    .maybeSingle()

  const totalTime = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back */}
      <Link
        href="/recipes"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 dark:text-dt-secondary dark:hover:text-dt-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to recipes
      </Link>

      {/* Header */}
      <div className="card mb-6">
        {recipe.image_url ? (
          <Image src={recipe.image_url} alt={recipe.title} width={800} height={300} className="mb-4 h-56 w-full rounded-xl object-cover" />
        ) : (
          <div className="mb-4 flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-orange-50 to-amber-100 dark:from-surface dark:to-surface-hover">
            <BookOpen className="h-12 w-12 text-brand-300 dark:text-accent/50" />
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-dt-primary">{recipe.title}</h1>
          {recipe.source === 'seeded' && (
            <span className="flex-shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-400 dark:bg-surface dark:text-dt-muted">
              starter recipe
            </span>
          )}
        </div>

        {recipe.description && (
          <p className="mt-2 text-stone-600 dark:text-dt-secondary">{recipe.description}</p>
        )}

        {/* Stats */}
        <div className="mt-4 flex flex-wrap gap-6 border-t border-stone-100 pt-4 dark:border-surface-border">
          {recipe.prep_time && (
            <div className="text-center">
              <p className="text-lg font-semibold text-stone-900 dark:text-dt-primary">{recipe.prep_time}m</p>
              <p className="text-xs text-stone-400 dark:text-dt-muted">Prep</p>
            </div>
          )}
          {recipe.cook_time && (
            <div className="text-center">
              <p className="text-lg font-semibold text-stone-900 dark:text-dt-primary">{recipe.cook_time}m</p>
              <p className="text-xs text-stone-400 dark:text-dt-muted">Cook</p>
            </div>
          )}
          {totalTime > 0 && (
            <div className="text-center">
              <p className="text-lg font-semibold text-stone-900 dark:text-dt-primary">{totalTime}m</p>
              <p className="text-xs text-stone-400 dark:text-dt-muted">Total</p>
            </div>
          )}
          {recipe.servings && (
            <div className="text-center">
              <p className="text-lg font-semibold text-stone-900 dark:text-dt-primary">{recipe.servings}</p>
              <p className="text-xs text-stone-400 dark:text-dt-muted">Servings</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Ingredients */}
        <div className="card sm:col-span-1">
          <h2 className="mb-4 font-semibold text-stone-900 dark:text-dt-primary">Ingredients</h2>
          {ingredients && ingredients.length > 0 ? (
            <ul className="space-y-2">
              {ingredients.map((ing) => (
                <li key={ing.id} className="flex items-baseline gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-400 dark:bg-accent" />
                  <span className="text-stone-600 dark:text-dt-secondary">
                    {ing.quantity && (
                      <span className="font-medium text-stone-900 dark:text-dt-primary">
                        {ing.quantity}{ing.unit ? ` ${ing.unit}` : ''}{' '}
                      </span>
                    )}
                    {ing.ingredient_name}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-stone-400 dark:text-dt-muted">No ingredients listed.</p>
          )}
        </div>

        {/* Instructions */}
        <div className="card sm:col-span-2">
          <h2 className="mb-4 font-semibold text-stone-900 dark:text-dt-primary">Instructions</h2>
          {recipe.instructions ? (
            <div className="prose prose-sm prose-stone max-w-none dark:prose-invert">
              {recipe.instructions.split('\n').filter(Boolean).map((step, i) => (
                <div key={i} className="mb-4 flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-accent/20 dark:text-accent">
                    {i + 1}
                  </span>
                  <p className="text-sm text-stone-700 leading-relaxed dark:text-dt-secondary">{step}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-400 dark:text-dt-muted">No instructions yet.</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <RecipeActions
        recipeId={recipe.id}
        recipeTitle={recipe.title}
        defaultServings={recipe.servings}
        householdId={profile?.household_id ?? null}
      />
    </div>
  )
}
