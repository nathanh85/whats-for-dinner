import { createClient } from '@/lib/supabase/server'

type EventPayload = Record<string, string | number | boolean | null | undefined>

export async function logEventServer(eventType: string, payload: EventPayload = {}) {
  try {
    const supabase = await createClient()
    await supabase.rpc('log_event', {
      p_event_type: eventType,
      p_payload: payload as Record<string, string>,
    })
  } catch {
    // Logging should never break the action
  }
}
