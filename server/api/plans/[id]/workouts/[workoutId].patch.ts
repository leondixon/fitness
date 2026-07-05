import { updatePlanRequestSchema, updatePlanResponseSchema } from '~~/server/schema/updatePlan'
import { workoutSchema } from '~~/server/schema/workout'
import { getDeepSeekClient } from '~~/server/utils/deepseek'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const workoutId = getRouterParam(event, 'workoutId')
  const input = updatePlanRequestSchema.parse(await readBody(event))

  if (!id || id !== input.plan.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Route plan id must match request plan id',
    })
  }

  if (!workoutId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Workout id is required',
    })
  }

  const workoutIndex = input.plan.workouts.findIndex(workout => String(workout.id) === workoutId)

  if (workoutIndex === -1) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Workout not found in plan',
    })
  }

  const workout = input.plan.workouts[workoutIndex]
  const config = useRuntimeConfig()
  const deepseek = getDeepSeekClient()

  const completion = await deepseek.chat.completions.create({
    model: config.deepseekModel || 'deepseek-v4-flash',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: [
          'You edit a workout that belongs to a workout plan as a practical strength and conditioning coach.',
          'Return only valid JSON with one top-level key named workout.',
          'Preserve the workout shape: id, title, subtitle, date, focus, notes, exercises[].',
          'Preserve workout and exercise ids when possible. Every exercise must include name and sets.',
          'Apply the requested change to this workout only and keep it realistic.',
        ].join(' '),
      },
      {
        role: 'user',
        content: JSON.stringify({ plan: input.plan, workout, requestedChange: input.adjustment }),
      },
    ],
  })

  const content = completion.choices[0]?.message.content

  if (!content) {
    throw createError({
      statusCode: 502,
      statusMessage: 'LLM returned an empty response.',
    })
  }

  const parsed = JSON.parse(content)
  const editedWorkout = workoutSchema.parse({ ...parsed.workout, id: workout.id ?? workoutId })
  const updatedPlan = {
    ...input.plan,
    updatedAt: new Date().toISOString(),
    version: input.plan.version + 1,
    workouts: input.plan.workouts.map((item, index) => index === workoutIndex ? editedWorkout : item),
    changeLog: [...input.plan.changeLog, `Updated workout ${workout.title}: ${input.adjustment}`],
  }

  return updatePlanResponseSchema.parse(updatedPlan)
})
