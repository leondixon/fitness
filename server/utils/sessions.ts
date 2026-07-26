import { exerciseResultSchema, workoutSessionSchema } from '~~/server/schema/session'

export const sessionColumns = 'id,user_id,routine_id,workout_template_id,rotation_position,status,started_at,completed_at,exercise_results(exercise_id,exercise_name,completed,sets)'

export function mapSessionRow(row: unknown) {
  const parsed = row as {
    id: string
    routine_id: string
    workout_template_id: string
    rotation_position: number
    status: string
    started_at: string
    completed_at: string | null
    exercise_results?: {
      exercise_id: string
      exercise_name: string
      completed: boolean
      sets: unknown
    }[]
  }

  return workoutSessionSchema.parse({
    id: parsed.id,
    routineId: parsed.routine_id,
    workoutTemplateId: parsed.workout_template_id,
    rotationPosition: parsed.rotation_position,
    status: parsed.status,
    startedAt: parsed.started_at,
    completedAt: parsed.completed_at,
    results: (parsed.exercise_results ?? []).map(result => exerciseResultSchema.parse({
      exerciseId: result.exercise_id,
      exerciseName: result.exercise_name,
      completed: result.completed,
      sets: result.sets,
    })),
  })
}
