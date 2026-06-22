interface WorkoutEditRequest {
  workout?: unknown
  feedback?: string
}

async function requestWorkoutEditFromLlm(_request: WorkoutEditRequest) {
  // TODO: Wire this up to an LLM provider and return the edited workout.
  return null
}

export default defineEventHandler(async (event) => {
  const body = await readBody<WorkoutEditRequest>(event)
  const editedWorkout = await requestWorkoutEditFromLlm({
    workout: body.workout,
    feedback: body.feedback,
  })

  return {
    workout: body.workout,
    feedback: body.feedback,
    editedWorkout,
  }
})
