<script setup lang="ts">
import type { WorkoutPlan } from '~~/server/schema/workoutPlan'

definePageMeta({ middleware: 'require-plan' })

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
  <main class="min-h-screen bg-slate-100 p-3">
    <div class="mx-auto grid w-full max-w-[860px] gap-3">
      <p v-if="error" class="rounded-2xl bg-white p-4 text-sm font-semibold text-red-700">
        Could not load your workout routine.
      </p>
      <template v-else-if="plan">
        <workout-plan :plan="plan" @select="navigateTo(`/workouts/${plan!.upcoming[0]!.workout.id}`)" />
        <form class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" @submit.prevent="changeRoutine">
          <label class="grid gap-2">
            <span class="text-sm font-black text-slate-900">Change routine</span>
            <span class="text-xs text-slate-500">Describe what you want changed. The replacement starts immediately at its first workout.</span>
            <textarea v-model="adjustment" class="min-h-24 rounded-xl border border-slate-300 p-3 text-sm" placeholder="Example: More upper-body strength and shorter sessions." />
          </label>
          <button class="mt-3 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50" :disabled="adjusting || !adjustment.trim()" type="submit">
            {{ adjusting ? 'Changing…' : 'Change routine' }}
          </button>
          <p v-if="adjustmentError" class="mt-2 text-sm font-semibold text-red-700">
            {{ adjustmentError }}
          </p>
        </form>
      </template>
    </div>
  </main>
</template>
