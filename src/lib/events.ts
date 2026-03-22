import { createClient } from '@/lib/supabase/client'

type EventPayload = Record<string, string | number | boolean | null | undefined>

export function logEvent(eventType: string, payload: EventPayload = {}) {
  const supabase = createClient()
  // Fire and forget — never block the UI
  supabase
    .rpc('log_event', {
      p_event_type: eventType,
      p_payload: payload as Record<string, string>,
    })
    .then()
}
