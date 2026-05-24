<script setup lang="ts">
type ExerciseLoggerSet = {
  previous?: string
  warmup?: boolean
}

type LoggedSet = {
  index: number
  warmup: boolean
  previous: string
  kg: string | number
  reps: string | number
  done: boolean
}

const props = withDefaults(
  defineProps<{
    exerciseName?: string
    sets?: ExerciseLoggerSet[]
  }>(),
  {
    exerciseName: 'Exercise',
    sets: () => [],
  },
)

const loggedSets = ref<LoggedSet[]>([])

const hasValue = (value: string | number) => String(value).trim() !== ''

const canCompleteSet = (set: LoggedSet) => hasValue(set.kg) && hasValue(set.reps)

const setLabel = (index: number) => {
  const set = loggedSets.value[index]

  if (set.warmup) {
    return 'W'
  }

  return loggedSets.value.slice(0, index + 1).filter((entry) => !entry.warmup).length.toString()
}

watch(
  () => props.sets,
  (sets) => {
    loggedSets.value = sets.map((set, index) => {
      const existingSet = loggedSets.value[index]

      return {
        index,
        warmup: set.warmup === true,
        previous: set.previous ?? '—',
        kg: existingSet?.kg ?? '',
        reps: existingSet?.reps ?? '',
        done: existingSet?.done ?? false,
      }
    })
  },
  { immediate: true },
)

watch(
  loggedSets,
  (currentSets) => {
    currentSets.forEach((set) => {
      if (!canCompleteSet(set)) {
        set.done = false
      }
    })
  },
  { deep: true },
)
</script>

<template>
  <section
    class="w-full max-w-[760px] rounded-[20px] border border-gray-200 bg-white p-4 shadow-[0_18px_50px_rgb(15_23_42_/_8%)] sm:p-6"
    aria-labelledby="exercise-logger-title"
  >
    <div class="mb-5">
      <p class="mb-1 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Exercise</p>
      <h2 id="exercise-logger-title" class="text-[clamp(1.5rem,3vw,2rem)] text-slate-900">
        {{ exerciseName }}
      </h2>
    </div>

    <div class="grid gap-2" role="table" aria-label="Exercise sets">
      <div
        class="grid grid-cols-[44px_minmax(88px,1fr)_minmax(64px,88px)_minmax(64px,88px)_48px] items-center gap-1.5 rounded-[14px] px-2 py-2.5 text-xs font-extrabold uppercase tracking-[0.06em] text-slate-500 sm:grid-cols-[56px_minmax(110px,1fr)_minmax(80px,110px)_minmax(80px,110px)_64px] sm:gap-2.5 sm:px-3"
        role="row"
      >
        <span role="columnheader">Set</span>
        <span role="columnheader">Previous</span>
        <span role="columnheader">kg</span>
        <span role="columnheader">Reps</span>
        <span role="columnheader">Done</span>
      </div>

      <div
        v-for="(set, index) in loggedSets"
        :key="set.index"
        class="grid grid-cols-[44px_minmax(88px,1fr)_minmax(64px,88px)_minmax(64px,88px)_48px] items-center gap-1.5 rounded-[14px] px-2 py-2.5 sm:grid-cols-[56px_minmax(110px,1fr)_minmax(80px,110px)_minmax(80px,110px)_64px] sm:gap-2.5 sm:px-3"
        :class="set.done ? 'bg-emerald-50' : 'bg-slate-50'"
        role="row"
      >
        <strong role="cell">{{ setLabel(index) }}</strong>
        <span class="font-semibold text-slate-600" role="cell">{{ set.previous }}</span>
        <label role="cell">
          <span class="sr-only">Weight in kg for set {{ setLabel(index) }}</span>
          <input
            v-model="set.kg"
            class="box-border w-full rounded-[10px] border border-slate-300 bg-white p-2.5 font-inherit text-slate-900 disabled:cursor-not-allowed disabled:opacity-45"
            type="number"
            min="0"
            step="0.5"
            inputmode="decimal"
            placeholder="0"
          />
        </label>
        <label role="cell">
          <span class="sr-only">Reps for set {{ setLabel(index) }}</span>
          <input
            v-model="set.reps"
            class="box-border w-full rounded-[10px] border border-slate-300 bg-white p-2.5 font-inherit text-slate-900 disabled:cursor-not-allowed disabled:opacity-45"
            type="number"
            min="0"
            step="1"
            inputmode="numeric"
            placeholder="0"
          />
        </label>
        <label class="grid place-items-center" role="cell">
          <input
            v-model="set.done"
            class="size-[22px] accent-green-600 disabled:cursor-not-allowed disabled:opacity-45"
            type="checkbox"
            :disabled="!canCompleteSet(set)"
          />
          <span class="sr-only">Mark set {{ setLabel(index) }} done</span>
        </label>
      </div>
    </div>
  </section>
</template>
