import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | undefined

function getClient() {
  if (!client) {
    const config = useRuntimeConfig()
    client = createBrowserClient(config.public.supabaseUrl, config.public.supabasePublishableKey)
  }

  return client
}

export function useSupabaseAuth() {
  const user = useState<{ id: string, email?: string } | null>('supabase-user', () => null)
  const loading = useState('supabase-auth-loading', () => true)

  onMounted(async () => {
    const supabase = getClient()
    const { data: { user: sessionUser } } = await supabase.auth.getUser()
    user.value = sessionUser ? { id: sessionUser.id, email: sessionUser.email } : null
    loading.value = false

    supabase.auth.onAuthStateChange((_event, nextSession) => {
      user.value = nextSession?.user ? { id: nextSession.user.id, email: nextSession.user.email } : null
      loading.value = false
    })
  })

  async function signIn() {
    const { error } = await getClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/workouts` },
    })

    if (error) {
      throw error
    }
  }

  async function signOut() {
    const { error } = await getClient().auth.signOut()

    if (error) {
      throw error
    }

    await navigateTo('/')
  }

  return { user, loading, signIn, signOut }
}

export function useSupabaseBrowserClient() {
  return getClient()
}
