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
  <main class="grid min-h-screen place-items-center bg-slate-100 p-4 text-slate-950">
    <section class="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgb(15_23_42_/_12%)] sm:p-8">
      <p class="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
        Fitness
      </p>
      <h1 class="mt-2 text-3xl font-black tracking-tight">
        Your practical training plan
      </h1>
      <p class="mt-3 text-sm leading-6 text-slate-600">
        Create a personalised workout plan, then use it to guide your upcoming sessions.
      </p>

      <p v-if="authLoading" class="mt-6 text-sm font-semibold text-slate-500">
        Loading account…
      </p>
      <template v-else-if="!user">
        <button class="mt-6 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700" type="button" @click="signIn">
          Continue with Google
        </button>
      </template>
      <template v-else>
        <div class="mt-6 flex items-center justify-between gap-3 text-sm">
          <p class="font-semibold text-slate-600">
            {{ user.email || 'Signed in' }}
          </p>
          <button class="font-bold text-emerald-700 hover:text-emerald-800" type="button" @click="signOut">
            Sign out
          </button>
        </div>
        <section class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-sm font-black text-slate-900">
                Body notes
              </h2>
              <p class="mt-1 text-xs leading-5 text-slate-600">
                Add injuries, imbalances, or other context for future routine changes.
              </p>
            </div>
            <button class="shrink-0 rounded-lg border border-emerald-600 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50" type="button" @click="editBodyNotes">
              {{ savedBodyNotes ? 'Edit body notes' : 'Add body notes' }}
            </button>
          </div>
          <form v-if="editingBodyNotes" class="mt-3 grid gap-3" @submit.prevent="saveBodyNotes">
            <label class="grid gap-1.5">
              <span class="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Your body notes</span>
              <textarea v-model="bodyNotes" class="min-h-28 rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" maxlength="2000" placeholder="Example: Right shoulder feels restricted overhead; improve single-leg balance." />
            </label>
            <div class="flex items-center gap-3">
              <button class="w-fit rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:bg-slate-300" :disabled="savingBodyNotes" type="submit">
                {{ savingBodyNotes ? 'Saving…' : 'Save notes' }}
              </button>
              <button class="text-sm font-bold text-slate-600 hover:text-slate-900" :disabled="savingBodyNotes" type="button" @click="editingBodyNotes = false">
                Cancel
              </button>
            </div>
          </form>
          <p v-else-if="savedBodyNotes" class="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {{ savedBodyNotes }}
          </p>
        </section>
        <p v-if="loadingPlan" class="mt-6 text-sm font-semibold text-slate-500">
          Loading your plan…
        </p>
        <template v-else-if="plan">
          <h2 class="mt-6 text-xl font-black">
            You already have a plan
          </h2>
          <p class="mt-2 text-sm text-slate-600">
            Your saved plan is ready whenever you are.
          </p>
          <NuxtLink class="mt-4 inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700" to="/workouts">
            View workouts
          </NuxtLink>
        </template>
        <form v-else class="mt-6 grid gap-3" @submit.prevent="createPlan">
          <label class="grid gap-1.5"><span class="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">What is your goal?</span><textarea v-model="goal" class="min-h-28 rounded-2xl border border-slate-300 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" placeholder="Example: Build a 3-day strength plan for functional fitness." /></label>
          <button class="w-fit rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:bg-slate-300" :disabled="!goal.trim() || pending" type="submit">
            {{ pending ? 'Creating…' : 'Create plan' }}
          </button>
        </form>
      </template>
      <p v-if="error" class="mt-4 text-sm font-semibold text-red-700">
        {{ error }}
      </p>
    </section>
  </main>
</template>
