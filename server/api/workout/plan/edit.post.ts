import { z } from 'zod'

import { workoutSchema } from '~~/server/schema/workout'
import { getDeepSeekClient } from '~~/server/utils/deepseek'
import { requireUser } from '~~/server/utils/supabase'

const workoutPlanSchema = z.array(workoutSchema).min(1)

interface WorkoutPlanEditRequest {
  workouts?: unknown
  feedback?: string
}

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = await readBody<WorkoutPlanEditRequest>(event)
  const feedback = body.feedback?.trim()

  if (!feedback) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Feedback is required.',
    })
  }

  const workouts = workoutPlanSchema.parse(body.workouts)
  const config = useRuntimeConfig()
  const deepseek = getDeepSeekClient()

  const completion = await deepseek.chat.completions.create({
    model: config.deepseekModel || 'deepseek-v4-flash',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: [
          'You edit full workout plans as a practical strength and conditioning coach.',
          'Return only valid JSON with one top-level key named workouts.',
          'The workouts value must be an array of workout objects.',
          'Preserve workout and exercise ids when possible.',
          'Every workout must include title and exercises. Every exercise must include name and sets.',
          'Apply the requested change safely and keep the plan realistic.',
        ].join(' '),
      },
      {
        role: 'user',
        content: JSON.stringify({ workouts, requestedChange: feedback }),
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

  const parsed = JSON.parse(content)
  const editedWorkouts = workoutPlanSchema.parse(parsed.workouts)

  return {
    workouts,
    feedback,
    editedWorkouts,
  }
})
