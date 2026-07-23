import { currentPlanResponseSchema } from '~~/server/schema/persistedPlan'
import { getCurrentPlan } from '~~/server/utils/plans'
import { requireUser } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return currentPlanResponseSchema.parse({ plan: await getCurrentPlan(event, user.id) })
})
