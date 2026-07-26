import type { H3Event } from 'h3'

import { getSupabaseServerClient } from './supabase'

export async function getBodyNotes(event: H3Event, userId: string) {
  const { data, error } = await getSupabaseServerClient(event)
    .from('user_body_notes')
    .select('notes')
    .eq('user_id', userId)
    .maybeSingle()

  if (error)
    throw createError({ statusCode: 500, statusMessage: 'Could not load body notes.' })

  return data?.notes ?? null
}

export async function updateBodyNotes(event: H3Event, userId: string, notes: string) {
  const client = getSupabaseServerClient(event)

  if (!notes) {
    const { error } = await client.from('user_body_notes').delete().eq('user_id', userId)
    if (error)
      throw createError({ statusCode: 500, statusMessage: 'Could not clear body notes.' })
    return null
  }

  const { data, error } = await client
    .from('user_body_notes')
    .upsert({ user_id: userId, notes }, { onConflict: 'user_id' })
    .select('notes')
    .single()

  if (error)
    throw createError({ statusCode: 500, statusMessage: 'Could not save body notes.' })

  return data.notes
}
