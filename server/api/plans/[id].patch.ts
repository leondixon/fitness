import { updatePlanRequestSchema, updatePlanResponseSchema } from '../../schema/updatePlan'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const input = updatePlanRequestSchema.parse(await readBody(event))

  if (!id || id !== input.plan.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Route plan id must match request plan id',
    })
  }

  const nextVersion = input.plan.version + 1
  const updatedPlan = {
    ...input.plan,
    updatedAt: new Date().toISOString(),
    version: nextVersion,
    summary: `${input.plan.summary}\n\nUpdate ${nextVersion}: ${input.adjustment}`,
    changeLog: [...input.plan.changeLog, input.adjustment],
  }

  return updatePlanResponseSchema.parse(updatedPlan)
})
