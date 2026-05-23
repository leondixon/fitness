<script setup lang="ts">
type ExerciseLoggerSet = {
  previous?: string
  warmup?: boolean
}

type LoggedSet = {
  index: number
  warmup: boolean
  previous: string
  kg: string
  reps: string
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

const canCompleteSet = (set: LoggedSet) => set.kg.trim() !== '' && set.reps.trim() !== ''

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
  <section class="exercise-logger" aria-labelledby="exercise-logger-title">
    <div class="exercise-logger__header">
      <p class="exercise-logger__eyebrow">Exercise</p>
      <h2 id="exercise-logger-title">{{ exerciseName }}</h2>
    </div>

    <div class="exercise-logger__table" role="table" aria-label="Exercise sets">
      <div class="exercise-logger__row exercise-logger__row--head" role="row">
        <span role="columnheader">Set</span>
        <span role="columnheader">Previous</span>
        <span role="columnheader">kg</span>
        <span role="columnheader">Reps</span>
        <span role="columnheader">Done</span>
      </div>

      <div
        v-for="(set, index) in loggedSets"
        :key="set.index"
        class="exercise-logger__row"
        :class="{ 'exercise-logger__row--done': set.done }"
        role="row"
      >
        <strong role="cell">{{ setLabel(index) }}</strong>
        <span class="exercise-logger__previous" role="cell">{{ set.previous }}</span>
        <label role="cell">
          <span class="sr-only">Weight in kg for set {{ setLabel(index) }}</span>
          <input v-model="set.kg" type="number" min="0" step="0.5" inputmode="decimal" placeholder="0" />
        </label>
        <label role="cell">
          <span class="sr-only">Reps for set {{ setLabel(index) }}</span>
          <input v-model="set.reps" type="number" min="0" step="1" inputmode="numeric" placeholder="0" />
        </label>
        <label class="exercise-logger__checkbox" role="cell">
          <input v-model="set.done" type="checkbox" :disabled="!canCompleteSet(set)" />
          <span class="sr-only">Mark set {{ setLabel(index) }} done</span>
        </label>
      </div>
    </div>
  </section>
</template>

<style scoped>
.exercise-logger {
  width: min(100%, 760px);
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 18px 50px rgb(15 23 42 / 8%);
}

.exercise-logger__header {
  margin-bottom: 20px;
}

.exercise-logger__eyebrow {
  margin: 0 0 4px;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.5rem, 3vw, 2rem);
}

.exercise-logger__table {
  display: grid;
  gap: 8px;
}

.exercise-logger__row {
  display: grid;
  grid-template-columns: 56px minmax(110px, 1fr) minmax(80px, 110px) minmax(80px, 110px) 64px;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 14px;
  background: #f8fafc;
}

.exercise-logger__row--head {
  background: transparent;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.exercise-logger__row--done {
  background: #ecfdf5;
}

.exercise-logger__previous {
  color: #475569;
  font-weight: 600;
}

input[type='number'] {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px;
  background: #ffffff;
  color: #0f172a;
  font: inherit;
}

.exercise-logger__checkbox {
  display: grid;
  place-items: center;
}

input[type='checkbox'] {
  width: 22px;
  height: 22px;
  accent-color: #16a34a;
}

input:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 640px) {
  .exercise-logger {
    padding: 16px;
  }

  .exercise-logger__row {
    grid-template-columns: 44px minmax(88px, 1fr) minmax(64px, 88px) minmax(64px, 88px) 48px;
    gap: 6px;
    padding-inline: 8px;
  }
}
</style>
