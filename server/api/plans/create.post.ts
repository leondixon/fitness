import { createPlanLlmResponseSchema, createPlanRequestSchema, createPlanResponseSchema } from '~~/server/schema/createPlan'
import { getDeepSeekClient } from '~~/server/utils/deepseek'

export default defineEventHandler(async (event) => {
  const input = createPlanRequestSchema.parse(await readBody(event))
  const config = useRuntimeConfig()
  const deepseek = getDeepSeekClient()

  const completion = await deepseek.chat.completions.create({
    model: config.deepseekModel || 'deepseek-v4-flash',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: [
          'You generate useful workout plans as a practical strength and conditioning coach.',
          'Return only valid JSON with exactly these top-level keys: title, summary, workouts.',
          'Do not include plan metadata such as id, goal, createdAt, updatedAt, version, or changeLog.',
          'The workouts value must be a non-empty array of workout objects.',
          'Every workout must include title and a non-empty exercises array. Optional workout keys may include id, subtitle, date, focus, and notes.',
          'Every exercise must include name and sets. Optional exercise keys may include id, restSeconds, and workSetSeconds.',
          'Use realistic exercises, set prescriptions, rest times, and progression notes tailored to the user goal.',
        ].join(' '),
      },
      {
        role: 'user',
        content: JSON.stringify({ goal: input.goal }),
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

  let llmPlan

  try {
    llmPlan = createPlanLlmResponseSchema.parse(JSON.parse(content))
  }
  catch {
    throw createError({
      statusCode: 502,
      statusMessage: 'LLM returned an invalid plan response.',
    })
  }

  const now = new Date().toISOString()
  const planId = crypto.randomUUID()
  const generatedPlan = {
    id: planId,
    goal: input.goal,
    title: llmPlan.title,
    summary: llmPlan.summary,
    createdAt: now,
    updatedAt: now,
    version: 1,
    workouts: llmPlan.workouts.map((workout, workoutIndex) => ({
      ...workout,
      id: workout.id ?? `${planId}-workout-${workoutIndex + 1}`,
      exercises: workout.exercises.map((exercise, exerciseIndex) => ({
        ...exercise,
        id: exercise.id ?? `${planId}-workout-${workoutIndex + 1}-exercise-${exerciseIndex + 1}`,
      })),
    })),
    changeLog: [`Created plan for goal: ${input.goal}`],
  }

  return createPlanResponseSchema.parse(generatedPlan)
})
