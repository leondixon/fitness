import { sessionResponseSchema, undoExerciseResultRequestSchema } from '~~/server/schema/session'
import { mapSessionRow, sessionColumns } from '~~/server/utils/sessions'
import { getSupabaseServerClient, requireUser } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const sessionId = getRouterParam(event, 'id')
  const input = undoExerciseResultRequestSchema.parse(await readBody(event))
  const supabase = getSupabaseServerClient(event)
  const { data: session } = await supabase
    .from('workout_sessions')
    .select('id,status')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .eq('status', 'in_progress')
    .maybeSingle()
  if (!session)
    throw createError({ statusCode: 404, statusMessage: 'In-progress workout session not found.' })

  const { error } = await supabase
    .from('exercise_results')
    .update({ completed: false, sets: [], updated_at: new Date().toISOString() })
    .eq('session_id', session.id)
    .eq('exercise_id', input.exerciseId)
  if (error)
    throw createError({ statusCode: 500, statusMessage: 'Could not undo the exercise result.' })

  const { data } = await supabase.from('workout_sessions').select(sessionColumns).eq('id', session.id).single()
  return sessionResponseSchema.parse({ session: mapSessionRow(data) })
})
