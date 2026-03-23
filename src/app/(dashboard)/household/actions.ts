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

export async function removeMember(memberId: string, householdId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('household_members')
    .delete()
    .eq('id', memberId)
    .eq('household_id', householdId)

  if (error) {
    await logEventServer('error.server', { message: error.message, action: 'removeMember' })
    return { error: error.message }
  }

  await logEventServer('household.member_removed', { member_id: memberId, household_id: householdId })
  revalidatePath('/household')
  return { success: true }
}

export async function removeManagedProfile(profileId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', profileId)

  if (error) {
    await logEventServer('error.server', { message: error.message, action: 'removeManagedProfile' })
    return { error: error.message }
  }

  await logEventServer('managed_profile.removed', { profile_id: profileId })
  revalidatePath('/household')
  return { success: true }
}

export async function leaveHousehold(householdId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error: memberError } = await supabase
    .from('household_members')
    .delete()
    .eq('user_id', user.id)
    .eq('household_id', householdId)

  if (memberError) {
    await logEventServer('error.server', { message: memberError.message, action: 'leaveHousehold' })
    return { error: memberError.message }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ household_id: null })
    .eq('id', user.id)

  if (profileError) {
    await logEventServer('error.server', { message: profileError.message, action: 'leaveHousehold.profile' })
    return { error: profileError.message }
  }

  await logEventServer('household.left', { household_id: householdId })
  revalidatePath('/household')
  return { success: true }
}