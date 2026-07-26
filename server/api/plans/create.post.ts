import { createPlanRequestSchema, createPlanResponseSchema } from '~~/server/schema/create-plan'
import { mapWorkoutPlanRow, persistedPlanInsertSchema } from '~~/server/schema/persistedPlan'
import { generatePlan } from '~~/server/utils/create-plan'
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
  const generated = await generatePlan(
    getDeepSeekClient(),
    config.deepseekModel || 'deepseek-v4-flash',
    input.goal,
  )

  const planId = crypto.randomUUID()
  const insert = persistedPlanInsertSchema.parse({
    id: planId,
    user_id: user.id,
    goal: input.goal,
    title: generated.title,
    summary: generated.summary,
    version: 1,
    workouts: generated.workouts.map((workout, workoutIndex) => {
      const workoutId = `${planId}-workout-${workoutIndex + 1}`

      return {
        ...workout,
        id: workoutId,
        previousWorkoutId: workoutIndex === 0
          ? null
          : `${planId}-workout-${workoutIndex}`,
        exercises: workout.exercises.map((exercise, exerciseIndex) => ({
          ...exercise,
          id: `${workoutId}-exercise-${exerciseIndex + 1}`,
        })),
      }
    }),
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
