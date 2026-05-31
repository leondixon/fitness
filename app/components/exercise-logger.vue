<script setup lang="ts">
interface ExerciseLoggerSet {
  previous?: string
  warmup?: boolean
}

interface LoggedSet {
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
    restTime?: string
    workSetTime?: string
    estimatedTime?: string
    sets?: ExerciseLoggerSet[]
  }>(),
  {
    exerciseName: 'Exercise',
    restTime: undefined,
    workSetTime: undefined,
    estimatedTime: undefined,
    sets: () => [],
  },
)

const loggedSets = ref<LoggedSet[]>([])

const hasValue = (value: string | number) => String(value).trim() !== ''

const canCompleteSet = (set: LoggedSet) => hasValue(set.kg) && hasValue(set.reps)

function setLabel(index: number) {
  const set = loggedSets.value[index]

  if (set?.warmup) {
    return 'W'
  }

  return loggedSets.value.slice(0, index + 1).filter(entry => !entry.warmup).length.toString()
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
    class="w-full rounded-2xl border border-gray-200 bg-white p-3 shadow-[0_10px_30px_rgb(15_23_42_/_7%)] sm:p-4"
    aria-labelledby="exercise-logger-title"
  >
    <div class="mb-3">
      <p class="mb-0.5 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-slate-500">
        Exercise
      </p>
      <h2 id="exercise-logger-title" class="text-xl font-bold leading-tight text-slate-900">
        {{ exerciseName }}
      </h2>
      <p v-if="restTime || workSetTime || estimatedTime" class="mt-1 text-xs font-semibold text-slate-500">
        <span v-if="workSetTime">Work {{ workSetTime }}/set</span>
        <span v-if="workSetTime && restTime"> · </span>
        <span v-if="restTime">Rest {{ restTime }}</span>
        <span v-if="(workSetTime || restTime) && estimatedTime"> · </span>
        <span v-if="estimatedTime">Est {{ estimatedTime }}</span>
      </p>
    </div>

    <div class="grid gap-1.5" role="table" aria-label="Exercise sets">
      <div
        class="grid grid-cols-[34px_minmax(76px,1fr)_minmax(54px,72px)_minmax(54px,72px)_38px] items-center gap-1 rounded-xl px-1.5 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-[0.05em] text-slate-500 sm:grid-cols-[44px_minmax(100px,1fr)_minmax(70px,90px)_minmax(70px,90px)_52px] sm:gap-2 sm:px-2"
        role="row"
      >
        <span role="columnheader">Set</span>
        <span role="columnheader">Previous</span>
        <span role="columnheader">kg</span>
        <span role="columnheader">Reps</span>
        <span role="columnheader">Done</span>
      </div>

      <div
        v-for="(set, index) in loggedSets" :key="set.index"
        class="grid grid-cols-[34px_minmax(76px,1fr)_minmax(54px,72px)_minmax(54px,72px)_38px] items-center gap-1 rounded-xl px-1.5 py-1.5 sm:grid-cols-[44px_minmax(100px,1fr)_minmax(70px,90px)_minmax(70px,90px)_52px] sm:gap-2 sm:px-2"
        :class="set.done ? 'bg-emerald-50' : 'bg-slate-50'" role="row"
      >
        <strong class="text-sm" role="cell">{{ setLabel(index) }}</strong>
        <span class="truncate text-xs font-semibold text-slate-600" role="cell">{{ set.previous }}</span>
        <label role="cell">
          <span class="sr-only">Weight in kg for set {{ setLabel(index) }}</span>
          <input
            v-model="set.kg"
            class="box-border w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-inherit text-slate-900 disabled:cursor-not-allowed disabled:opacity-45"
            type="text" inputmode="decimal" placeholder="0"
          >
        </label>
        <label role="cell">
          <span class="sr-only">Reps for set {{ setLabel(index) }}</span>
          <input
            v-model="set.reps"
            class="box-border w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-inherit text-slate-900 disabled:cursor-not-allowed disabled:opacity-45"
            type="text" inputmode="numeric" placeholder="0"
          >
        </label>
        <label class="grid place-items-center" role="cell">
          <input
            v-model="set.done" class="size-5 accent-green-600 disabled:cursor-not-allowed disabled:opacity-45"
            type="checkbox" :disabled="!canCompleteSet(set)"
          >
          <span class="sr-only">Mark set {{ setLabel(index) }} done</span>
        </label>
      </div>
    </div>
  </section>
</template>
