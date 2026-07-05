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
        content: `You generate useful workout plans as a practical strength and conditioning coach. Return only valid JSON matching this exact shape, with no markdown or extra text:
{
  "title": "string",
  "summary": "string",
  "workouts": [
    {
      "title": "string",
      "subtitle": "string",
      "date": "string",
      "focus": "string",
      "notes": "string",
      "exercises": [
        {
          "name": "string",
          "restSeconds": 120,
          "workSetSeconds": 45,
          "sets": [
            {
              "reps": "8-10",
              "weight": "moderate",
              "previous": "optional string",
              "warmup": false
            }
          ]
        }
      ]
    }
  ]
}
Do not include plan metadata such as id, goal, createdAt, updatedAt, version, or changeLog. The workouts array must be non-empty. Every workout must include title and a non-empty exercises array. Every exercise must include name and a non-empty sets array. Use realistic exercises, set prescriptions, rest times, and progression notes tailored to the user goal.`, 
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

  const parsedPlan = createPlanLlmResponseSchema.safeParse(JSON.parse(content))
  if (!parsedPlan.success) {
    console.error(parsedPlan.error)
    throw createError({
      statusCode: 502,
      statusMessage: 'LLM returned an invalid plan response.',
    })
  }

  const plan = parsedPlan.data
  const now = new Date().toISOString()
  const planId = crypto.randomUUID()
  const generatedPlan = {
    id: planId,
    goal: input.goal,
    title: plan.title,
    summary: plan.summary,
    createdAt: now,
    updatedAt: now,
    version: 1,
    workouts: plan.workouts.map((workout, workoutIndex) => ({
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
