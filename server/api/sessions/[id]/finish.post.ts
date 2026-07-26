import { finishSessionParamsSchema, finishSessionResponseSchema } from '~~/server/schema/session'
import { mapSessionRow, sessionColumns } from '~~/server/utils/sessions'
import { getSupabaseServerClient, requireUser } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { id } = finishSessionParamsSchema.parse({ id: getRouterParam(event, 'id') })
  const supabase = getSupabaseServerClient(event)
  const { data: advanced, error } = await supabase.rpc('finish_workout_session', {
    p_user_id: user.id,
    p_session_id: id,
  })
  if (error)
    throw createError({ statusCode: 404, statusMessage: 'Workout session not found.' })

  const { data, error: loadError } = await supabase
    .from('workout_sessions')
    .select(sessionColumns)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  if (loadError || !data)
    throw createError({ statusCode: 500, statusMessage: 'Could not load the finished workout session.' })

  return finishSessionResponseSchema.parse({ session: mapSessionRow(data), advanced })
})
