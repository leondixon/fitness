import { createPlanLlmResponseSchema, createPlanRequestSchema, createPlanResponseSchema } from '~~/server/schema/createPlan'
import { mapWorkoutPlanRow, persistedPlanInsertSchema } from '~~/server/schema/persistedPlan'
import { getDeepSeekClient } from '~~/server/utils/deepseek'
import { getCurrentPlan } from '~~/server/utils/plans'
import { getSupabaseServerClient, requireUser } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const input = createPlanRequestSchema.parse(await readBody(event))
  const existingPlan = await getCurrentPlan(event, user.id)

  if (existingPlan) {
    return createPlanResponseSchema.parse(existingPlan)
  }

  const config = useRuntimeConfig()
  const completion = await getDeepSeekClient().chat.completions.create({
    model: config.deepseekModel || 'deepseek-v4-flash',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You generate useful workout plans as a practical strength and conditioning coach. Return only valid JSON matching this exact shape, with no markdown or extra text:
{
  "title": "string", "summary": "string", "workouts": [{ "title": "string", "subtitle": "string", "date": "string", "focus": "string", "notes": "string", "exercises": [{ "name": "string", "restSeconds": 120, "workSetSeconds": 45, "sets": [{ "reps": "8-10", "weight": "moderate", "previous": "optional string", "warmup": false }] }] }]
}
Do not include plan metadata. The workouts array, each workout's exercises array, and each exercise's sets array must be non-empty.`,
      },
      { role: 'user', content: JSON.stringify({ goal: input.goal }) },
    ],
  })
  const content = completion.choices[0]?.message.content

  if (!content) {
    throw createError({ statusCode: 502, statusMessage: 'LLM returned an empty response.' })
  }

  let llmResponse: unknown
  try {
    llmResponse = JSON.parse(content)
  }
  catch {
    throw createError({ statusCode: 502, statusMessage: 'LLM returned an invalid plan response.' })
  }

  const generated = createPlanLlmResponseSchema.safeParse(llmResponse)
  if (!generated.success) {
    console.error(generated.error)
    throw createError({ statusCode: 502, statusMessage: 'LLM returned an invalid plan response.' })
  }

  const planId = crypto.randomUUID()
  const insert = persistedPlanInsertSchema.parse({
    id: planId,
    user_id: user.id,
    goal: input.goal,
    title: generated.data.title,
    summary: generated.data.summary,
    version: 1,
    workouts: generated.data.workouts.map((workout, workoutIndex) => ({
      ...workout,
      id: workout.id ?? `${planId}-workout-${workoutIndex + 1}`,
      exercises: workout.exercises.map((exercise, exerciseIndex) => ({
        ...exercise,
        id: exercise.id ?? `${planId}-workout-${workoutIndex + 1}-exercise-${exerciseIndex + 1}`,
      })),
    })),
    change_log: [`Created plan for goal: ${input.goal}`],
  })
  const { data, error } = await getSupabaseServerClient(event)
    .from('workout_plans')
    .insert(insert)
    .select('id,user_id,goal,title,summary,workouts,change_log,version,created_at,updated_at')
    .single()

  if (error?.code === '23505') {
    const currentPlan = await getCurrentPlan(event, user.id)
    if (currentPlan)
      return createPlanResponseSchema.parse(currentPlan)
  }

  if (error || !data) {
    throw createError({ statusCode: 500, statusMessage: 'Could not save the workout plan.' })
  }

  return createPlanResponseSchema.parse(mapWorkoutPlanRow(data))
})
