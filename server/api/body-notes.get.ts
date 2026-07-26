import { bodyNotesResponseSchema } from '~~/server/schema/bodyNotes'
import { getBodyNotes } from '~~/server/utils/body-notes'
import { requireUser } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return bodyNotesResponseSchema.parse({ bodyNotes: await getBodyNotes(event, user.id) })
})
