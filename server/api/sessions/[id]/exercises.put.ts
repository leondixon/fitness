import { saveExerciseResultRequestSchema, sessionResponseSchema } from '~~/server/schema/session'
import { normalizeExerciseName } from '~~/server/utils/plans'
import { mapSessionRow, sessionColumns } from '~~/server/utils/sessions'
import { getSupabaseServerClient, requireUser } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const sessionId = getRouterParam(event, 'id')
  const input = saveExerciseResultRequestSchema.parse(await readBody(event))
  const supabase = getSupabaseServerClient(event)
  const { data: session } = await supabase
    .from('workout_sessions')
    .select('id,workout_template_id,status')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .eq('status', 'in_progress')
    .maybeSingle()
  if (!session)
    throw createError({ statusCode: 404, statusMessage: 'In-progress workout session not found.' })

  const { data: exercise } = await supabase
    .from('prescribed_exercises')
    .select('id,name')
    .eq('id', input.exerciseId)
    .eq('workout_template_id', session.workout_template_id)
    .maybeSingle()
  if (!exercise)
    throw createError({ statusCode: 404, statusMessage: 'Exercise not found in this workout.' })

  const { error } = await supabase.from('exercise_results').upsert({
    id: crypto.randomUUID(),
    session_id: session.id,
    exercise_id: exercise.id,
    exercise_name: exercise.name,
    normalized_name: normalizeExerciseName(exercise.name),
    completed: true,
    sets: input.sets,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'session_id,exercise_id', ignoreDuplicates: false })
  if (error)
    throw createError({ statusCode: 500, statusMessage: 'Could not save the exercise result.' })

  const { data } = await supabase.from('workout_sessions').select(sessionColumns).eq('id', session.id).single()
  return sessionResponseSchema.parse({ session: mapSessionRow(data) })
})
