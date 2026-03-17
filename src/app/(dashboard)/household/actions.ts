'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createHousehold(formData: FormData) {
  const name = (formData.get('name') as string).trim()
  if (!name) return { error: 'Household name is required' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // 1. Create the household
  const { data: household, error: householdError } = await supabase
    .from('households')
    .insert({ name })
    .select('id')
    .single()

  if (householdError) return { error: householdError.message }

  // 2. Add the creator as admin member
  const { error: memberError } = await supabase
    .from('household_members')
    .insert({ household_id: household.id, user_id: user.id, role: 'admin' })

  if (memberError) return { error: memberError.message }

  // 3. Link the profile to the household
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ household_id: household.id })
    .eq('id', user.id)

  if (profileError) return { error: profileError.message }

  revalidatePath('/household')
  return { success: true }
}

export async function renameHousehold(formData: FormData) {
  const name = (formData.get('name') as string).trim()
  const householdId = formData.get('householdId') as string
  if (!name) return { error: 'Name is required' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('households')
    .update({ name })
    .eq('id', householdId)

  if (error) return { error: error.message }

  revalidatePath('/household')
  return { success: true }
}
