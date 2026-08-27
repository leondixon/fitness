import type { H3Event } from 'h3'
import type OpenAI from 'openai'
import { setTimeout as delay } from 'node:timers/promises'
import type { PrescribeWorkoutLlmResponse } from '~~/server/schema/prescribe'

import {
  prescribeWorkoutLlmResponseJsonSchema,
  prescribeWorkoutLlmResponseSchema,
} from '~~/server/schema/prescribe'
import { getBodyNotes } from './body-notes'
import { getDeepSeekClient } from './deepseek'
import { normalizeExerciseName, prescribedKilograms, sessionHistoryByExerciseName } from './plans'
import { getSupabaseServerClient } from './supabase'

const requiredSchema = JSON.stringify(prescribeWorkoutLlmResponseJsonSchema)

const systemPrompt = `You are a practical strength coach prescribing the next session of one repeating workout.
Keep the same exercises, the same number of sets, the same set ids, and the same warmup flags. Only change each set's reps and weight.
Use the full logged history to progressive-overload: increase load when the latest work shows the target was hit, hold or reduce when it was missed, and keep warmup sets lighter than work sets.
Prescribe weight as bare kilograms only (for example "60" or "62.5"). Never use percentages, 1RM, or units. For an exercise with no matching history, set every weight to "N/A".
Return only valid JSON matching this JSON Schema, with no markdown or extra text:
${requiredSchema}`

interface TemplateExercise {
  id: string
  name: string
  sets: { id: string, position: number, reps: string, weight: string, warmup: boolean }[]
}

interface TemplateWorkout {
  id: string
  title: string
  exercises: TemplateExercise[]
}

export function alignSetPrescriptions(
  workout: TemplateWorkout,
  generated: PrescribeWorkoutLlmResponse,
) {
  if (generated.exercises.length !== workout.exercises.length)
    return undefined

  const byId = new Map(generated.exercises.map(exercise => [exercise.id, exercise]))
  const updates: { id: string, reps: string, weight: string }[] = []

  for (const exercise of workout.exercises) {
    const match = byId.get(exercise.id)
    if (!match || match.sets.length !== exercise.sets.length)
      return undefined
    const setsById = new Map(match.sets.map(set => [set.id, set]))
    for (const set of exercise.sets) {
      const prescribed = setsById.get(set.id)
      if (!prescribed)
        return undefined
      updates.push({ id: set.id, reps: prescribed.reps, weight: prescribed.weight })
    }
  }

  return updates
}

export function isLoadPrescriptionStale(
  basedOnSessionId: string | undefined,
  lastCompletedSessionId: string | undefined,
) {
  if (!lastCompletedSessionId)
    return false
  return basedOnSessionId !== lastCompletedSessionId
}

export function applyEvidenceBasedLoads(
  workout: TemplateWorkout,
  updates: { id: string, reps: string, weight: string }[],
  lastKgByExercise: Map<string, number>,
) {
  const exerciseBySetId = new Map(
    workout.exercises.flatMap(exercise => exercise.sets.map(set => [set.id, exercise])),
  )

  return updates.map((update) => {
    const exercise = exerciseBySetId.get(update.id)
    if (!exercise)
      return { ...update, weight: 'N/A' }
    const fallbackKg = lastKgByExercise.get(normalizeExerciseName(exercise.name))
    return {
      ...update,
      weight: fallbackKg === undefined ? 'N/A' : prescribedKilograms(update.weight, fallbackKg),
    }
  })
}

function parseResponse(content: string | null | undefined) {
  if (!content)
    return undefined

  try {
    const parsed = prescribeWorkoutLlmResponseSchema.safeParse(JSON.parse(content))
    return parsed.success ? parsed.data : undefined
  }
  catch {
    return undefined
  }
}

export async function generateWorkoutPrescription(
  client: OpenAI,
  model: string,
  workout: TemplateWorkout,
  history: ReturnType<typeof sessionHistoryByExerciseName>,
  bodyNotes?: string,
) {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: JSON.stringify({ workout, history, bodyNotes }) },
  ]
  const completion = await client.chat.completions.create({
    model,
    response_format: { type: 'json_object' },
    messages,
  }, { timeout: 20_000 })
  const generated = parseResponse(completion.choices[0]?.message.content)
  const aligned = generated ? alignSetPrescriptions(workout, generated) : undefined
  if (aligned)
    return aligned

  const correction = await client.chat.completions.create({
    model,
    response_format: { type: 'json_object' },
    messages: [
      ...messages,
      { role: 'assistant', content: completion.choices[0]?.message.content ?? '' },
      {
        role: 'user',
        content: `Correct the response so it matches the required JSON Schema and uses the same exercise ids and set ids as the workout. Return only the corrected JSON.
Required JSON Schema:
${requiredSchema}`,
      },
    ],
  }, { timeout: 20_000 })
  const corrected = parseResponse(correction.choices[0]?.message.content)
  return corrected ? alignSetPrescriptions(workout, corrected) : undefined
}

async function loadTemplateWorkout(
  event: H3Event,
  userId: string,
  templateId: string,
): Promise<TemplateWorkout | undefined> {
  const supabase = getSupabaseServerClient(event)
  const { data, error } = await supabase
    .from('workout_templates')
    .select(`
      id,title,routine_id,
      prescribed_exercises(
        id,position,name,
        prescribed_sets(id,position,reps,weight,warmup)
      )
    `)
    .eq('id', templateId)
    .maybeSingle()

  if (error)
    throw createError({ statusCode: 500, statusMessage: 'Could not load the workout template.' })
  if (!data)
    return undefined

  const { data: routine, error: routineError } = await supabase
    .from('routine_versions')
    .select('id')
    .eq('id', data.routine_id)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (routineError)
    throw createError({ statusCode: 500, statusMessage: 'Could not load the workout routine.' })
  if (!routine)
    return undefined

  const exercises = [...(data.prescribed_exercises ?? [])]
    .sort((a, b) => a.position - b.position)
    .map(exercise => ({
      id: exercise.id as string,
      name: exercise.name as string,
      sets: [...(exercise.prescribed_sets ?? [])]
        .sort((a, b) => a.position - b.position)
        .map(set => ({
          id: set.id as string,
          position: set.position as number,
          reps: set.reps as string,
          weight: set.weight as string,
          warmup: set.warmup as boolean,
        })),
    }))

  if (exercises.length === 0)
    return undefined

  return {
    id: data.id as string,
    title: data.title as string,
    exercises,
  }
}

async function loadHistory(event: H3Event, userId: string, names: string[]) {
  const wanted = new Set(names.map(name => normalizeExerciseName(name)))
  const { data, error } = await getSupabaseServerClient(event)
    .from('exercise_results')
    .select('normalized_name,exercise_name,sets,workout_sessions!inner(completed_at,status,user_id)')
    .eq('completed', true)
    .eq('workout_sessions.status', 'completed')
    .eq('workout_sessions.user_id', userId)

  if (error)
    throw createError({ statusCode: 500, statusMessage: 'Could not load exercise history.' })

  return sessionHistoryByExerciseName(data ?? []).filter(entry =>
    wanted.has(normalizeExerciseName(entry.exercise)),
  )
}

export async function prescribeWorkoutLoads(event: H3Event, userId: string, templateId: string) {
  const workout = await loadTemplateWorkout(event, userId, templateId)
  if (!workout)
    return

  const history = await loadHistory(event, userId, workout.exercises.map(exercise => exercise.name))
  const bodyNotes = await getBodyNotes(event, userId) ?? undefined
  const config = useRuntimeConfig()
  const updates = await generateWorkoutPrescription(
    getDeepSeekClient(),
    config.deepseekModel || 'deepseek-v4-flash',
    workout,
    history,
    bodyNotes,
  )
  if (!updates)
    return

  const applied = applyEvidenceBasedLoads(
    workout,
    updates,
    new Map(history.flatMap((entry) => {
      const last = entry.sessions.at(-1)
      if (!last?.sets.length)
        return []
      return [[normalizeExerciseName(entry.exercise), Math.max(...last.sets.map(set => set.kg))] as const]
    })),
  )
  const supabase = getSupabaseServerClient(event)
  for (const set of applied) {
    const { error } = await supabase
      .from('prescribed_sets')
      .update({ reps: set.reps, weight: set.weight })
      .eq('id', set.id)
    if (error)
      throw createError({ statusCode: 500, statusMessage: 'Could not save the next prescription.' })
  }

  const { data: lastCompleted, error: lastError } = await supabase
    .from('workout_sessions')
    .select('id')
    .eq('workout_template_id', templateId)
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (lastError)
    throw createError({ statusCode: 500, statusMessage: 'Could not load the last workout session.' })
  if (lastCompleted) {
    const { error: stampError } = await supabase
      .from('workout_templates')
      .update({ loads_based_on_session_id: lastCompleted.id })
      .eq('id', templateId)
    if (stampError)
      throw createError({ statusCode: 500, statusMessage: 'Could not save the next prescription.' })
  }
}

export async function ensureWorkoutLoads(event: H3Event, userId: string, templateId: string) {
  const supabase = getSupabaseServerClient(event)
  const { data: template, error: templateError } = await supabase
    .from('workout_templates')
    .select('id,loads_based_on_session_id')
    .eq('id', templateId)
    .maybeSingle()
  if (templateError)
    throw createError({ statusCode: 500, statusMessage: 'Could not load the workout template.' })
  if (!template)
    return

  const { data: lastCompleted, error: lastError } = await supabase
    .from('workout_sessions')
    .select('id')
    .eq('workout_template_id', templateId)
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (lastError)
    throw createError({ statusCode: 500, statusMessage: 'Could not load the last workout session.' })

  const basedOn = typeof template.loads_based_on_session_id === 'string'
    ? template.loads_based_on_session_id
    : undefined
  if (!isLoadPrescriptionStale(basedOn, lastCompleted?.id))
    return

  await prescribeWorkoutLoads(event, userId, templateId)
}

export async function waitUpTo(promise: Promise<unknown>, ms: number) {
  const ac = new AbortController()
  await Promise.race([
    promise.catch((error) => {
      console.error('Could not prescribe loads before start', error)
    }),
    delay(ms, undefined, { signal: ac.signal }).catch(() => undefined),
  ])
  ac.abort()
}
