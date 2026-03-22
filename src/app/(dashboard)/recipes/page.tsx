import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Clock, Users, BookOpen } from 'lucide-react'
import RecipeSearch from '@/components/recipes/RecipeSearch'
import RecipePlaceholder from '@/components/recipes/RecipePlaceholder'

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>
}) {
  const { q, filter } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('recipes')
    .select('id, title, description, prep_time, cook_time, servings, source, created_by, image_url, recipe_category')
    .order('created_at', { ascending: false })

  if (q) {
    query = query.ilike('title', `%${q}%`)
  }
  if (filter === 'mine') {
    const { data: { user } } = await supabase.auth.getUser()
    query = query.eq('created_by', user!.id)
  }

  const { data: recipes } = await query

  return (
    <div className="mx-auto max-w-5xl">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Recipes</h1>
          <p className="page-subtitle">
            {recipes?.length ?? 0} recipe{recipes?.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <Link href="/recipes/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          Add recipe
        </Link>
      </div>

      <RecipeSearch />

      {recipes && recipes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="card group flex flex-col transition-shadow hover:shadow-md"
            >
              {/* Recipe image area */}
              {recipe.image_url ? (
                <Image src={recipe.image_url} alt={recipe.title} width={400} height={250} className="mb-4 h-32 w-full rounded-lg object-cover" />
              ) : (
                <RecipePlaceholder
                  category={recipe.recipe_category}
                  className="mb-4 h-32"
                />
              )}

              <h3 className="font-semibold text-stone-900 group-hover:text-brand-600 transition-colors dark:text-dt-primary dark:group-hover:text-accent">
                {recipe.title}
              </h3>

              {recipe.description && (
                <p className="mt-1 line-clamp-2 text-sm text-stone-500 dark:text-dt-secondary">
                  {recipe.description}
                </p>
              )}

              <div className="mt-auto flex items-center gap-4 pt-4 text-xs text-stone-400 dark:text-dt-muted">
                {(recipe.prep_time || recipe.cook_time) && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {(recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)} min
                  </span>
                )}
                {recipe.servings && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {recipe.servings} servings
                  </span>
                )}
                {recipe.source === 'seeded' && (
                  <span className="ml-auto rounded-full bg-stone-100 px-2 py-0.5 text-stone-400 dark:bg-surface dark:text-dt-muted">
                    starter
                  </span>
                )}
                {recipe.source === 'user' && (
                  <span className="ml-auto rounded-full bg-brand-50 px-2 py-0.5 text-brand-500 dark:bg-accent/15 dark:text-accent">
                    yours
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-2xl bg-brand-50 p-5 dark:bg-accent/15">
            <BookOpen className="h-10 w-10 text-brand-400 dark:text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-dt-primary">No recipes found</h3>
          <p className="mt-1 max-w-xs text-sm text-stone-500 dark:text-dt-secondary">
            {q ? `No results for "${q}"` : 'Add your first recipe to get started.'}
          </p>
          {!q && (
            <Link href="/recipes/new" className="btn-primary mt-6">
              <Plus className="h-4 w-4" />
              Add your first recipe
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
