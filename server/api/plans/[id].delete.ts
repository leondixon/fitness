import { endPlanParamsSchema, endPlanResponseSchema } from '~~/server/schema/endPlan'
import { getSupabaseServerClient, requireUser } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const { id } = endPlanParamsSchema.parse({ id: getRouterParam(event, 'id') })
  const user = await requireUser(event)
  const { data, error } = await getSupabaseServerClient(event)
    .from('workout_plans')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle()

  if (error)
    throw createError({ statusCode: 500, statusMessage: 'Could not end the workout plan.' })

  if (!data)
    throw createError({ statusCode: 404, statusMessage: 'Workout plan not found.' })

  return endPlanResponseSchema.parse({ endedPlanId: data.id })
})
