<script setup lang="ts">
const { user, loading: authLoading, signIn, signOut } = useSupabaseAuth()
const goal = ref('')
const bodyNotes = ref('')
const savedBodyNotes = ref<string | null>(null)
const editingBodyNotes = ref(false)
const savingBodyNotes = ref(false)
const pending = ref(false)
const error = ref('')
const loadingPlan = ref(false)
const plan = ref<Awaited<ReturnType<typeof $fetch<{ plan: unknown }>>> extends { plan: infer T } ? T : never>(null)

async function loadPlan() {
  if (!user.value)
    return
  loadingPlan.value = true
  error.value = ''
  try {
    const response = await $fetch('/api/plans/current')
    plan.value = response.plan
  }
  catch (requestError) {
    error.value = requestError instanceof Error ? requestError.message : 'Could not load your plan.'
  }
  finally { loadingPlan.value = false }
}

watch(user, loadPlan)

async function loadBodyNotes() {
  if (!user.value)
    return
  try {
    const response = await $fetch('/api/body-notes')
    savedBodyNotes.value = response.bodyNotes
    bodyNotes.value = response.bodyNotes ?? ''
  }
  catch (requestError) {
    error.value = requestError instanceof Error ? requestError.message : 'Could not load body notes.'
  }
}

watch(user, loadBodyNotes)

function editBodyNotes() {
  bodyNotes.value = savedBodyNotes.value ?? ''
  editingBodyNotes.value = true
}

async function saveBodyNotes() {
  if (savingBodyNotes.value)
    return
  savingBodyNotes.value = true
  error.value = ''
  try {
    const response = await $fetch('/api/body-notes', {
      method: 'PUT',
      body: { bodyNotes: bodyNotes.value },
    })
    savedBodyNotes.value = response.bodyNotes
    bodyNotes.value = response.bodyNotes ?? ''
    editingBodyNotes.value = false
  }
  catch (requestError) {
    error.value = requestError instanceof Error ? requestError.message : 'Could not save body notes.'
  }
  finally { savingBodyNotes.value = false }
}

async function createPlan() {
  if (!goal.value.trim() || pending.value || plan.value)
    return
  pending.value = true
  error.value = ''
  try {
    plan.value = await $fetch('/api/plans/create', { method: 'POST', body: { goal: goal.value } })
    goal.value = ''
  }
  catch (requestError) {
    error.value = requestError instanceof Error ? requestError.message : 'Could not create your plan.'
  }
  finally { pending.value = false }
}
</script>

<template>
  <main class="page">
    <header class="flex items-center justify-between">
      <p class="link-mute">
        Fitness
      </p>
      <button v-if="user" class="link-mute" type="button" @click="signOut">
        Sign out
      </button>
    </header>

    <p v-if="authLoading" class="mt-10 text-[15px] text-mute">
      Loading account…
    </p>
    <template v-else-if="!user">
      <h1 class="mt-10 text-[2.5rem] leading-none tracking-tight">
        Next workout
      </h1>
      <p class="mt-4 max-w-[36ch] text-[15px] leading-6 text-mute">
        Generate a repeating routine, then finish each session to pull the next target.
      </p>
      <button class="btn-ink mt-auto" type="button" @click="signIn">
        Continue with Google
      </button>
    </template>
    <template v-else>
      <section class="mt-10 border-t border-rule pt-5">
        <div class="flex items-baseline justify-between gap-3">
          <h2>Body notes</h2>
          <button class="link-mute" type="button" @click="editBodyNotes">
            {{ savedBodyNotes ? 'Edit' : 'Add' }}
          </button>
        </div>
        <p class="mt-1 text-[14px] leading-5 text-mute">
          Injuries, imbalances, or other context for later routine changes.
        </p>
        <form v-if="editingBodyNotes" class="mt-4 grid gap-3" @submit.prevent="saveBodyNotes">
          <label class="grid gap-1">
            <span class="text-[13px] text-mute">Your notes</span>
            <textarea v-model="bodyNotes" class="field min-h-28" maxlength="2000" placeholder="Example: Right shoulder feels restricted overhead; improve single-leg balance." />
          </label>
          <div class="flex items-center gap-4">
            <button class="btn-ink w-auto px-5" :disabled="savingBodyNotes" type="submit">
              {{ savingBodyNotes ? 'Saving…' : 'Save notes' }}
            </button>
            <button class="link-mute" :disabled="savingBodyNotes" type="button" @click="editingBodyNotes = false">
              Cancel
            </button>
          </div>
        </form>
        <p v-else-if="savedBodyNotes" class="mt-3 whitespace-pre-wrap text-[15px] leading-6">
          {{ savedBodyNotes }}
        </p>
      </section>

      <p v-if="loadingPlan" class="mt-10 text-[15px] text-mute">
        Loading your plan…
      </p>
      <template v-else-if="plan">
        <p class="mt-10 text-[15px] leading-6 text-mute">
          Your saved routine is ready.
        </p>
        <NuxtLink class="btn-ink mt-auto inline-flex items-center justify-center no-underline" to="/workouts">
          Start
        </NuxtLink>
      </template>
      <form v-else class="mt-10 flex flex-1 flex-col gap-3" @submit.prevent="createPlan">
        <label class="grid gap-1">
          <span class="text-[13px] text-mute">What is your goal?</span>
          <textarea v-model="goal" class="field min-h-28" placeholder="Example: Build a 3-day strength plan for functional fitness." />
        </label>
        <button class="btn-ink mt-auto" :disabled="!goal.trim() || pending" type="submit">
          {{ pending ? 'Creating…' : 'Create plan' }}
        </button>
      </form>
    </template>
    <p v-if="error" class="mt-4 text-[14px] text-red-700">
      {{ error }}
    </p>
  </main>
</template>
