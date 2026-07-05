import { createPlanRequestSchema, createPlanResponseSchema } from '~~/server/schema/createPlan'
import { getDeepSeekClient } from '~~/server/utils/deepseek'

export default defineEventHandler(async (event) => {
  const input = createPlanRequestSchema.parse(await readBody(event))

  void input
  void getDeepSeekClient

  const generatedPlan = undefined as unknown

  return createPlanResponseSchema.parse(generatedPlan)
})
