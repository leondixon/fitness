export default defineEventHandler(async (event) => {
  const body = await readBody<{
    workout?: unknown
    feedback?: string
  }>(event)

  // TODO: Send `body.workout` and `body.feedback` to the LLM, then return the edited workout.
  // This empty placeholder keeps the API contract ready without wiring an LLM provider yet.
  return {
    workout: body.workout,
    feedback: body.feedback,
    editedWorkout: null,
  }
})
