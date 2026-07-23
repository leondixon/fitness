import { workoutSchema } from '~~/server/schema/workout'
import { getDeepSeekClient } from '~~/server/utils/deepseek'
import { requireUser } from '~~/server/utils/supabase'

interface WorkoutEditRequest {
  workout?: unknown
  feedback?: string
}

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = await readBody<WorkoutEditRequest>(event)
  const feedback = body.feedback?.trim()

  if (!feedback) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Feedback is required.',
    })
  }

  const workout = workoutSchema.parse(body.workout)
  const config = useRuntimeConfig()
  const deepseek = getDeepSeekClient()

  const completion = await deepseek.chat.completions.create({
    model: config.deepseekModel || 'deepseek-v4-flash',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: [
          'You edit workout plans as a practical strength and conditioning coach.',
          'Return only valid JSON with one top-level key named workout.',
          'Preserve the workout shape: id, title, subtitle, date, focus, notes, exercises[].',
          'Preserve exercise ids when possible. Every exercise must include name and sets.',
          'Apply the requested change safely and keep the plan realistic.',
        ].join(' '),
      },
      {
        role: 'user',
        content: JSON.stringify({ workout, requestedChange: feedback }),
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
  const editedWorkout = workoutSchema.parse(parsed.workout)

  return {
    workout,
    feedback,
    editedWorkout,
  }
})
