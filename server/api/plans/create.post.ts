import { createPlanRequestSchema, createPlanResponseSchema } from '~~/server/schema/createPlan'
import { getDeepSeekClient } from '~~/server/utils/deepseek'

export default defineEventHandler(async (event) => {
  const input = createPlanRequestSchema.parse(await readBody(event))

  void input
  void getDeepSeekClient
  void createPlanResponseSchema
  throw createError({
    statusCode: 501,
    statusMessage: 'DeepSeek plan generation is not implemented yet.',
  })
})
