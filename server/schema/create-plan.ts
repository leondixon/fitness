import { z } from 'zod'
import { workoutPlanSchema } from './workoutPlan'

export const createPlanRequestSchema = z.object({
  goal: z.string().trim().min(1, 'Goal is required'),
})

const createPlanLlmSetSchema = z.strictObject({
  reps: z.string().trim().min(1, 'Reps are required'),
  weight: z.string().trim().min(1, 'Weight is required'),
  previous: z.string().optional(),
  warmup: z.boolean().optional(),
})

const createPlanLlmExerciseSchema = z.strictObject({
  name: z.string().trim().min(1, 'Exercise name is required'),
  restSeconds: z.number().int().nonnegative().optional(),
  workSetSeconds: z.number().int().positive().optional(),
  sets: z.array(createPlanLlmSetSchema).min(1, 'At least one set is required'),
})

const createPlanLlmWorkoutSchema = z.strictObject({
  restDaysAfterPrevious: z.number().int().nonnegative(),
  title: z.string().trim().min(1, 'Workout title is required'),
  subtitle: z.string().optional(),
  focus: z.string().optional(),
  notes: z.string().optional(),
  exercises: z.array(createPlanLlmExerciseSchema).min(1, 'At least one exercise is required'),
})

export const createPlanLlmResponseSchema = z.strictObject({
  title: z.string().trim().min(1, 'Plan title is required'),
  summary: z.string().trim().min(1, 'Plan summary is required'),
  workouts: z.array(createPlanLlmWorkoutSchema).min(1, 'At least one workout is required'),
}).superRefine((plan, context) => {
  if (plan.workouts.length === 0)
    return

  if (plan.workouts[0]?.restDaysAfterPrevious !== 0) {
    context.addIssue({
      code: 'custom',
      path: ['workouts', 0, 'restDaysAfterPrevious'],
      message: 'The first workout must have zero rest days',
    })
  }

  let day = 0
  const scheduledWeeks = new Set([1])

  for (const [index, workout] of plan.workouts.entries()) {
    if (index === 0)
      continue

    day += workout.restDaysAfterPrevious + 1

    if (day > 83) {
      context.addIssue({
        code: 'custom',
        path: ['workouts', index, 'restDaysAfterPrevious'],
        message: 'Workout falls outside the 12-week plan',
      })
      continue
    }

    scheduledWeeks.add(Math.floor(day / 7) + 1)
  }

  for (let week = 1; week <= 12; week++) {
    if (!scheduledWeeks.has(week)) {
      context.addIssue({
        code: 'custom',
        path: ['workouts'],
        message: `The schedule must contain a workout in week ${week}`,
      })
    }
  }
})

export const createPlanLlmResponseJsonSchema = z.toJSONSchema(createPlanLlmResponseSchema)

export const createPlanResponseSchema = workoutPlanSchema

export type CreatePlanRequest = z.infer<typeof createPlanRequestSchema>
export type CreatePlanLlmResponse = z.infer<typeof createPlanLlmResponseSchema>
