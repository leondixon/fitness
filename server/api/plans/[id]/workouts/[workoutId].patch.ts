import { mapWorkoutPlanRow } from '~~/server/schema/persistedPlan'
import { updatePlanRequestSchema, updatePlanResponseSchema } from '~~/server/schema/updatePlan'
import { workoutSchema } from '~~/server/schema/workout'
import { getDeepSeekClient } from '~~/server/utils/deepseek'
import { getOwnedPlan } from '~~/server/utils/plans'
import { getSupabaseServerClient, requireUser } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const workoutId = getRouterParam(event, 'workoutId')
  if (!id || !workoutId)
    throw createError({ statusCode: 400, statusMessage: 'Plan and workout ids are required.' })

  const user = await requireUser(event)
  const input = updatePlanRequestSchema.parse(await readBody(event))
  const plan = await getOwnedPlan(event, user.id, id)
  const workoutIndex = plan.workouts.findIndex(workout => String(workout.id) === workoutId)
  if (workoutIndex === -1)
    throw createError({ statusCode: 404, statusMessage: 'Workout not found in plan.' })

  const workout = plan.workouts[workoutIndex]
  const config = useRuntimeConfig()
  const completion = await getDeepSeekClient().chat.completions.create({
    model: config.deepseekModel || 'deepseek-v4-flash',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Edit the supplied workout only. Return valid JSON with a top-level workout key. Preserve its ids and include non-empty exercises and sets.' },
      { role: 'user', content: JSON.stringify({ workout, requestedChange: input.adjustment }) },
    ],
  })
  const content = completion.choices[0]?.message.content
  if (!content)
    throw createError({ statusCode: 502, statusMessage: 'LLM returned an empty response.' })

  let response: unknown
  try {
    response = JSON.parse(content)
  }
  catch {
    throw createError({ statusCode: 502, statusMessage: 'LLM returned an invalid workout response.' })
  }

  const editedWorkout = workoutSchema.parse({ ...(response as { workout?: unknown }).workout, id: workout.id ?? workoutId })
  const workouts = plan.workouts.map((item, index) => index === workoutIndex ? editedWorkout : item)
  const { data, error } = await getSupabaseServerClient(event)
    .from('workout_plans')
    .update({
      workouts,
      change_log: [...plan.changeLog, `Updated workout ${workout.title}: ${input.adjustment}`],
      version: plan.version + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', plan.id)
    .eq('user_id', user.id)
    .select('id,user_id,goal,title,summary,workouts,change_log,version,created_at,updated_at')
    .single()

  if (error || !data)
    throw createError({ statusCode: 500, statusMessage: 'Could not update the workout plan.' })
  return updatePlanResponseSchema.parse(mapWorkoutPlanRow(data))
})
