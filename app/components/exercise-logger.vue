<script setup lang="ts">
import type { z } from 'zod'
import type { loggedSetSchema } from '~~/server/schema/session'
import type { Exercise } from '~~/server/schema/workout'

type LoggedSet = z.infer<typeof loggedSetSchema>

const props = defineProps<{
  exercise: Exercise
  initialSets?: LoggedSet[]
  completed?: boolean
}>()

const emit = defineEmits<{
  done: [sets: LoggedSet[]]
  undo: []
}>()

const values = ref<Record<number, { kg: string, reps: string }>>({})
const collapsed = ref(false)

function parseKg(raw: unknown) {
  const text = String(raw ?? '').trim()
  if (!text)
    return undefined
  const kg = Number(text)
  return Number.isFinite(kg) && kg >= 0 ? kg : undefined
}

function parseReps(raw: unknown) {
  const text = String(raw ?? '').trim()
  if (!text)
    return undefined
  const reps = Number(text)
  return Number.isInteger(reps) && reps >= 0 ? reps : undefined
}

function hydrate() {
  const existing = new Map((props.initialSets ?? []).map(set => [set.position, set]))
  values.value = Object.fromEntries(props.exercise.sets.map((set) => {
    const logged = existing.get(set.position)
    return [set.position, {
      kg: logged ? String(logged.kg) : '',
      reps: logged ? String(logged.reps) : '',
    }]
  }))
  collapsed.value = props.completed ?? false
}

watch(() => props.exercise.id, hydrate, { immediate: true })

const workingSets = computed(() => props.exercise.sets.filter(set => !set.warmup))

const loggedSets = computed(() =>
  workingSets.value.flatMap((set) => {
    const value = values.value[set.position]
    const kg = parseKg(value?.kg)
    const reps = parseReps(value?.reps)
    if (kg === undefined || reps === undefined)
      return []
    return [{ position: set.position, kg, reps }]
  }),
)

const isComplete = computed(() =>
  workingSets.value.length > 0 && loggedSets.value.length === workingSets.value.length,
)

watch(isComplete, (complete, wasComplete) => {
  if (complete)
    emit('done', loggedSets.value)
  else if (wasComplete)
    emit('undo')
})

function collapseOnLeave(event: FocusEvent) {
  if (!(event.target instanceof HTMLInputElement))
    return
  const next = event.relatedTarget
  if (next instanceof Node && (event.currentTarget as HTMLElement).contains(next))
    return
  if (isComplete.value)
    collapsed.value = true
}

function expand() {
  collapsed.value = false
}

function targetFor(set: Exercise['sets'][number]) {
  const logged = loggedSets.value.find(loggedSet => loggedSet.position === set.position)
    ?? (props.initialSets ?? []).find(loggedSet => loggedSet.position === set.position)
  if (logged)
    return `${logged.kg} × ${logged.reps}`
  return `${String(set.weight).replaceAll('%', '')} × ${set.reps}`
}

function summary() {
  return loggedSets.value.map(set => `${set.kg} × ${set.reps}`).join(' · ')
}
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" @focusout="collapseOnLeave">
    <button
      v-if="collapsed"
      class="flex w-full items-center justify-between gap-3 text-left"
      type="button"
      @click="expand"
    >
      <div>
        <p class="text-[0.65rem] font-bold uppercase tracking-wider text-emerald-700">
          Logged
        </p>
        <h2 class="text-xl font-bold text-slate-900">
          {{ exercise.name }}
        </h2>
        <p class="mt-1 text-sm font-semibold text-slate-600">
          {{ summary() }}
        </p>
      </div>
      <span class="text-xs font-bold text-emerald-700">Edit</span>
    </button>

    <template v-else>
      <div>
        <p class="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">
          Exercise
        </p>
        <h2 class="text-xl font-bold text-slate-900">
          {{ exercise.name }}
        </h2>
      </div>

      <div class="mt-3 grid gap-2">
        <div class="grid grid-cols-[36px_1fr_1fr_1fr] gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          <span>Set</span><span>Target</span><span>kg</span><span>Reps</span>
        </div>
        <div
          v-for="(set, index) in exercise.sets"
          :key="set.id"
          class="grid grid-cols-[36px_1fr_1fr_1fr] items-center gap-2 rounded-xl bg-slate-50 p-2"
        >
          <strong>{{ set.warmup ? 'W' : index + 1 }}</strong>
          <span class="text-xs text-slate-600">{{ targetFor(set) }}</span>
          <template v-if="set.warmup">
            <span class="col-span-2 text-xs font-semibold text-slate-400">Warmup — not logged</span>
          </template>
          <template v-else>
            <input
              v-model="values[set.position]!.kg"
              class="min-w-0 rounded-lg border border-slate-300 bg-white px-2 py-1.5"
              min="0"
              inputmode="decimal"
              type="number"
            >
            <input
              v-model="values[set.position]!.reps"
              class="min-w-0 rounded-lg border border-slate-300 bg-white px-2 py-1.5"
              min="0"
              step="1"
              inputmode="numeric"
              type="number"
            >
          </template>
        </div>
      </div>
    </template>
  </section>
</template>
