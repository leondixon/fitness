import type OpenAI from 'openai'
import type { CreatePlanLlmResponse } from '~~/server/schema/create-plan'

import {
  createPlanLlmResponseJsonSchema,
  createPlanLlmResponseSchema,
} from '~~/server/schema/create-plan'

const requiredSchema = JSON.stringify(createPlanLlmResponseJsonSchema)

const systemPrompt = `You generate useful workout plans as a practical strength and conditioning coach.
Create exactly three ordered workout templates tailored to the user's request. These templates repeat forever in the given order, so do not add dates, weekdays, weeks, or scheduling fields.
Use numeric-looking prescriptions as strings for reps and weight, and explicitly identify warmup sets.
The user payload may include bodyNotes with injuries, imbalances, or other physical context. Use them to steer exercise selection and programming.
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
    return generated.data
  }

  const validationIssues = generated.error.issues.map(issue => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))
  console.error('DeepSeek plan validation failed', validationIssues)
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

  return corrected.data
}

export interface ExerciseHistory {
  exercise: string
  appearances: number
  averageKg: number
  averageReps: number
}
