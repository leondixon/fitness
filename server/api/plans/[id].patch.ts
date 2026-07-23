import { mapWorkoutPlanRow } from '~~/server/schema/persistedPlan'
import { updatePlanRequestSchema, updatePlanResponseSchema } from '~~/server/schema/updatePlan'
import { getOwnedPlan } from '~~/server/utils/plans'
import { getSupabaseServerClient, requireUser } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Plan id is required.' })

  const user = await requireUser(event)
  const input = updatePlanRequestSchema.parse(await readBody(event))
  const plan = await getOwnedPlan(event, user.id, id)
  const version = plan.version + 1
  const { data, error } = await getSupabaseServerClient(event)
    .from('workout_plans')
    .update({
      summary: `${plan.summary}\n\nUpdate ${version}: ${input.adjustment}`,
      change_log: [...plan.changeLog, input.adjustment],
      version,
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
