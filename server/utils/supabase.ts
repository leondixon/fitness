import type { H3Event } from 'h3'
import { createServerClient } from '@supabase/ssr'

export function getSupabaseServerClient(event: H3Event) {
  const config = useRuntimeConfig()

  if (!config.public.supabaseUrl || !config.public.supabasePublishableKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Supabase is not configured.',
    })
  }

  return createServerClient(config.public.supabaseUrl, config.public.supabasePublishableKey, {
    cookies: {
      getAll: () => Object.entries(parseCookies(event)).map(([name, value]) => ({ name, value })),
      setAll: cookies => cookies.forEach(({ name, value, options }) => setCookie(event, name, value, options)),
    },
  })
}

export async function requireUser(event: H3Event) {
  const { data: { user }, error } = await getSupabaseServerClient(event).auth.getUser()

  if (error || !user) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication is required.' })
  }

  return user
}
