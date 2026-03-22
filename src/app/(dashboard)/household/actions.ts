'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logEventServer } from '@/lib/events-server'

export async function createHousehold(formData: FormData) {
  const name = (formData.get('name') as string).trim()
  if (!name) return { error: 'Household name is required' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Use SECURITY DEFINER function — handles all 3 steps in one transaction,
  // bypassing RLS which would block the household SELECT before household_members exists
  const { data, error } = await supabase.rpc('create_household', {
    household_name: name,
  })

  if (error) {
    await logEventServer('error.server', { message: error.message, action: 'createHousehold' })
    return { error: error.message }
  }

  await logEventServer('household.created', { household_id: data })
  revalidatePath('/household')
  revalidatePath('/dashboard')
  return { success: true, household: data }
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