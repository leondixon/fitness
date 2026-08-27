import type OpenAI from 'openai'
import type { CreatePlanLlmResponse } from '~~/server/schema/create-plan'

import {
  createPlanLlmResponseJsonSchema,
  createPlanLlmResponseSchema,
} from '~~/server/schema/create-plan'
import { normalizeExerciseName, prescribedKilograms } from './plans'

const requiredSchema = JSON.stringify(createPlanLlmResponseJsonSchema)

const systemPrompt = `You generate useful workout plans as a practical strength and conditioning coach.
Create exactly three ordered workout templates tailored to the user's request. These templates repeat forever in the given order, so do not add dates, weekdays, weeks, or scheduling fields.
The user payload may include bodyNotes with injuries, imbalances, or other physical context. Use them to steer exercise selection and programming.
Use numeric-looking prescriptions as strings for reps and weight. For an exercise with no matching exercise history, set every weight to "N/A". When history is provided, prescribe only bare kilograms (for example "60" or "62.5") — never percentages, 1RM, or units. Explicitly identify warmup sets.
Return only valid JSON matching this JSON Schema, with no markdown or extra text:
${requiredSchema}`

function parseResponse(content: string | null | undefined) {
  if (!content) {
    throw createError({ statusCode: 502, statusMessage: 'LLM returned an empty response.' })
  }

  let response: unknown
  try {
    response = JSON.parse(content)
  }
  catch {
    throw createError({ statusCode: 502, statusMessage: 'LLM returned an invalid plan response.' })
  }

  return createPlanLlmResponseSchema.safeParse(response)
}

function applyEvidenceBasedWeights(plan: CreatePlanLlmResponse, exerciseHistory: ExerciseHistory[]) {
  const lastKg = new Map(
    exerciseHistory.map(entry => [normalizeExerciseName(entry.exercise), entry.averageKg]),
  )

  return {
    ...plan,
    workouts: plan.workouts.map(workout => ({
      ...workout,
      exercises: workout.exercises.map((exercise) => {
        const fallbackKg = lastKg.get(normalizeExerciseName(exercise.name))
        return {
          ...exercise,
          sets: exercise.sets.map(set => ({
            ...set,
            weight: fallbackKg === undefined ? 'N/A' : prescribedKilograms(set.weight, fallbackKg),
          })),
        }
      }),
    })),
  }
}

export async function generatePlan(
  client: OpenAI,
  model: string,
  request: string,
  exerciseHistory: ExerciseHistory[] = [],
  bodyNotes: string | null = null,
): Promise<CreatePlanLlmResponse> {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: JSON.stringify({ request, bodyNotes, exerciseHistory }) },
  ]
  const completion = await client.chat.completions.create({
    model,
    response_format: { type: 'json_object' },
    messages,
  })
  const generated = parseResponse(completion.choices[0]?.message.content)

  if (generated.success) {
    return applyEvidenceBasedWeights(generated.data, exerciseHistory)
  }

  const validationIssues = generated.error.issues.map(issue => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))
  console.warn('DeepSeek plan response needs correction', validationIssues)
  const correction = await client.chat.completions.create({
    model,
    response_format: { type: 'json_object' },
    messages: [
      ...messages,
      {
        role: 'assistant',
        content: completion.choices[0]?.message.content ?? '',
      },
      {
        role: 'user',
        content: `Correct the response so it matches the required JSON Schema. Return only the corrected JSON.
Validation issues:
${JSON.stringify(validationIssues)}
Required JSON Schema:
${requiredSchema}`,
      },
    ],
  })
  const corrected = parseResponse(correction.choices[0]?.message.content)

  if (!corrected.success) {
    console.error(
      'DeepSeek corrected plan validation failed',
      corrected.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    )
    throw createError({ statusCode: 502, statusMessage: 'LLM returned an invalid plan response.' })
  }

  return applyEvidenceBasedWeights(corrected.data, exerciseHistory)
}

export interface ExerciseHistory {
  exercise: string
  appearances: number
  averageKg: number
  averageReps: number
}
