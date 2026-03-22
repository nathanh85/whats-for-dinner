import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import NewRecipeForm from '@/components/recipes/NewRecipeForm'

export default function NewRecipePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/recipes"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-dt-muted hover:text-stone-900 dark:hover:text-dt-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to recipes
      </Link>

      <div className="page-header">
        <h1 className="page-title">Add recipe</h1>
        <p className="page-subtitle">Save a recipe to your collection</p>
      </div>

      <NewRecipeForm />
    </div>
  )
}
