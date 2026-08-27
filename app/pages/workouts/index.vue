<script setup lang="ts">
import type { WorkoutPlan } from '~~/server/schema/workoutPlan'

definePageMeta({ middleware: 'require-plan' })

const { signOut } = useSupabaseAuth()
const { data, error } = await useFetch('/api/plans/current', {
  getCachedData: () => undefined,
})
const plan = computed(() => data.value?.plan as WorkoutPlan | null | undefined)
const adjustment = ref('')
const adjusting = ref(false)
const adjustmentError = ref('')

async function changeRoutine() {
  if (!plan.value || !adjustment.value.trim() || adjusting.value)
    return
  adjusting.value = true
  adjustmentError.value = ''
  try {
    data.value = {
      plan: await $fetch(`/api/plans/${plan.value.id}`, {
        method: 'PATCH',
        body: { adjustment: adjustment.value },
      }),
    }
    adjustment.value = ''
  }
  catch (requestError) {
    adjustmentError.value = requestError instanceof Error ? requestError.message : 'Could not change the routine.'
  }
  finally {
    adjusting.value = false
  }
}
</script>

<template>
  <main class="page">
    <header class="flex items-center justify-between">
      <NuxtLink class="link-mute no-underline" to="/">
        Fitness
      </NuxtLink>
      <button class="link-mute" type="button" @click="signOut">
        Sign out
      </button>
    </header>

    <p v-if="error" class="mt-10 text-[15px] text-red-700">
      Could not load your workout routine.
    </p>
    <template v-else-if="plan">
      <workout-plan :plan="plan" @select="navigateTo(`/workouts/${plan!.upcoming[0]!.workout.id}`)" />
      <form class="mt-10 border-t border-rule pt-5" @submit.prevent="changeRoutine">
        <label class="grid gap-2">
          <span>Change routine</span>
          <span class="text-[13px] text-mute">Describe what you want changed. The replacement starts immediately at its first workout.</span>
          <textarea v-model="adjustment" class="field min-h-24" placeholder="Example: More upper-body strength and shorter sessions." />
        </label>
        <button class="mt-4 text-[15px] disabled:opacity-40" :disabled="adjusting || !adjustment.trim()" type="submit">
          {{ adjusting ? 'Changing…' : 'Change routine' }}
        </button>
        <p v-if="adjustmentError" class="mt-2 text-[14px] text-red-700">
          {{ adjustmentError }}
        </p>
      </form>
    </template>
  </main>
</template>
