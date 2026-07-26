import type OpenAI from 'openai'
import type { CreatePlanLlmResponse } from '~~/server/schema/create-plan'

import {
  createPlanLlmResponseJsonSchema,
  createPlanLlmResponseSchema,
} from '~~/server/schema/create-plan'

const requiredSchema = JSON.stringify(createPlanLlmResponseJsonSchema)

const systemPrompt = `You generate useful workout plans as a practical strength and conditioning coach.
Create a complete 12-week plan tailored to the user's stated activity and goal. Include every workout for all 12 weeks and include at least one workout in each week.
Order workouts chronologically. Set the first workout's restDaysAfterPrevious to 0 because it is due on the plan creation day. For every later workout, restDaysAfterPrevious is the number of full rest days after the previous workout: 0 means the next day, 1 means two days later. Do not use fixed dates, weekdays, or week numbers.
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
  goal: string,
): Promise<CreatePlanLlmResponse> {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: JSON.stringify({ goal }) },
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
