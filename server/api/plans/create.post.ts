import { createPlanRequestSchema, createPlanResponseSchema } from '~~/server/schema/create-plan'
import { generatePlan } from '~~/server/utils/create-plan'
import { getDeepSeekClient } from '~~/server/utils/deepseek'
import { getCurrentPlan } from '~~/server/utils/plans'
import { activateRoutine, buildRoutinePayload } from '~~/server/utils/routine-generation'
import { requireUser } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const input = createPlanRequestSchema.parse(await readBody(event))
  const existing = await getCurrentPlan(event, user.id)
  if (existing)
    return createPlanResponseSchema.parse(existing)

  const config = useRuntimeConfig()
  const generated = await generatePlan(
    getDeepSeekClient(),
    config.deepseekModel || 'deepseek-v4-flash',
    input.goal,
  )
  await activateRoutine(event, user.id, buildRoutinePayload(generated, input.goal, 1))

  const plan = await getCurrentPlan(event, user.id)
  if (!plan)
    throw createError({ statusCode: 500, statusMessage: 'Could not load the activated workout routine.' })

  return createPlanResponseSchema.parse(plan)
})
