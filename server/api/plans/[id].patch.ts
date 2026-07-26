import { updatePlanRequestSchema, updatePlanResponseSchema } from '~~/server/schema/updatePlan'
import { generatePlan } from '~~/server/utils/create-plan'
import { getDeepSeekClient } from '~~/server/utils/deepseek'
import { getCurrentPlan, getExerciseHistory } from '~~/server/utils/plans'
import { activateRoutine, buildRoutinePayload } from '~~/server/utils/routine-generation'
import { requireUser } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const input = updatePlanRequestSchema.parse(await readBody(event))
  const current = await getCurrentPlan(event, user.id)
  if (!current || current.id !== getRouterParam(event, 'id'))
    throw createError({ statusCode: 404, statusMessage: 'Workout routine not found.' })

  const history = await getExerciseHistory(event, user.id)
  const config = useRuntimeConfig()
  const generated = await generatePlan(
    getDeepSeekClient(),
    config.deepseekModel || 'deepseek-v4-flash',
    input.adjustment,
    history,
  )
  await activateRoutine(
    event,
    user.id,
    buildRoutinePayload(generated, input.adjustment, current.version + 1),
  )

  const replacement = await getCurrentPlan(event, user.id)
  if (!replacement)
    throw createError({ statusCode: 500, statusMessage: 'Could not load the replacement routine.' })

  return updatePlanResponseSchema.parse(replacement)
})
