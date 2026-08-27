import { finishSessionParamsSchema, finishSessionRequestSchema, finishSessionResponseSchema } from '~~/server/schema/session'
import { normalizeExerciseName } from '~~/server/utils/plans'
import { mapSessionRow, sessionColumns } from '~~/server/utils/sessions'
import { getSupabaseServerClient, requireUser } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { id } = finishSessionParamsSchema.parse({ id: getRouterParam(event, 'id') })
  const input = finishSessionRequestSchema.parse(await readBody(event))
  const supabase = getSupabaseServerClient(event)
  const { data: session } = await supabase
    .from('workout_sessions')
    .select('id,workout_template_id,status')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('status', 'in_progress')
    .maybeSingle()
  if (!session)
    throw createError({ statusCode: 404, statusMessage: 'In-progress workout session not found.' })

  const { data: exercises, error: exerciseError } = await supabase
    .from('prescribed_exercises')
    .select('id,name')
    .eq('workout_template_id', session.workout_template_id)
  if (exerciseError)
    throw createError({ statusCode: 500, statusMessage: 'Could not load the workout exercises.' })

  const exercisesById = new Map((exercises ?? []).map(exercise => [exercise.id, exercise]))
  const loggedAt = new Date().toISOString()
  for (const result of input.results) {
    const exercise = exercisesById.get(result.exerciseId)
    if (!exercise)
      throw createError({ statusCode: 400, statusMessage: 'Exercise not found in this workout.' })

    const { error } = await supabase.from('exercise_results').upsert({
      id: crypto.randomUUID(),
      session_id: session.id,
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      normalized_name: normalizeExerciseName(exercise.name),
      completed: true,
      sets: result.sets,
      updated_at: loggedAt,
    }, { onConflict: 'session_id,exercise_id', ignoreDuplicates: false })
    if (error)
      throw createError({ statusCode: 500, statusMessage: 'Could not log the workout.' })
  }

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
