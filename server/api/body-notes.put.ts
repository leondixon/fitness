import { bodyNotesResponseSchema, updateBodyNotesRequestSchema } from '~~/server/schema/bodyNotes'
import { updateBodyNotes } from '~~/server/utils/body-notes'
import { requireUser } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const input = updateBodyNotesRequestSchema.parse(await readBody(event))
  return bodyNotesResponseSchema.parse({
    bodyNotes: await updateBodyNotes(event, user.id, input.bodyNotes),
  })
})
