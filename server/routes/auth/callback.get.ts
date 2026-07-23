import { authCallbackSchema } from '~~/server/schema/authCallback'
import { getSupabaseServerClient } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const query = authCallbackSchema.safeParse(getQuery(event))

  if (!query.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid authentication callback.',
    })
  }

  const { error } = await getSupabaseServerClient(event).auth.exchangeCodeForSession(query.data.code)

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    })
  }

  return sendRedirect(event, query.data.next)
})
