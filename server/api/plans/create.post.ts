import type { CreatePlanLlmResponse, CreatePlanRequest } from '~~/server/schema/createPlan'
import type { Workout } from '~~/server/schema/workout'
import type { WorkoutPlan } from '~~/server/schema/workoutPlan'

import { createPlanLlmResponseSchema, createPlanRequestSchema, createPlanResponseSchema } from '~~/server/schema/createPlan'
import { getDeepSeekClient } from '~~/server/utils/deepseek'

export default defineEventHandler(async (event) => {
  const input = createPlanRequestSchema.parse(await readBody(event))

  return createPlanFromDeepSeek(input)
})

async function createPlanFromDeepSeek(input: CreatePlanRequest): Promise<WorkoutPlan> {
  void input
  void getDeepSeekClient
  throw createError({
    statusCode: 501,
    statusMessage: 'DeepSeek plan generation is not implemented yet.',
  })
}

export function parseCreatePlanLlmContent(content: string): CreatePlanLlmResponse {
  void content
  void createPlanLlmResponseSchema
  throw createError({
    statusCode: 501,
    statusMessage: 'DeepSeek create-plan parsing is not implemented yet.',
  })
}

export function composeCreatePlanResponse(input: CreatePlanRequest, llmResponse: CreatePlanLlmResponse): WorkoutPlan {
  void input
  void llmResponse
  void createPlanResponseSchema
  void normalizeGeneratedWorkouts
  throw createError({
    statusCode: 501,
    statusMessage: 'Create-plan response composition is not implemented yet.',
  })
}

export function normalizeGeneratedWorkouts(workouts: CreatePlanLlmResponse['workouts']): Workout[] {
  void workouts
  throw createError({
    statusCode: 501,
    statusMessage: 'Generated workout normalization is not implemented yet.',
  })
}
