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
}, { immediate: true })

function snapshot() {
  return {
    exerciseId: props.exercise.id,
    sets: loggedSets.value,
  }
}

defineExpose({ snapshot })

function collapseOnLeave(event: FocusEvent) {
  if (!(event.target instanceof HTMLInputElement))
    return
  const next = event.relatedTarget
  if (next instanceof Node && (event.currentTarget as HTMLElement).contains(next))
    return
  if (isComplete.value)
    collapsed.value = true
}

function toggle() {
  collapsed.value = !collapsed.value
}

function targetFor(set: Exercise['sets'][number]) {
  return `${set.weight} × ${set.reps}`
}

function summary() {
  const logged = loggedSets.value.map(set => `${set.kg}×${set.reps}`).join(' · ')
  if (logged)
    return logged
  const work = workingSets.value
  const unique = [...new Set(work.map(set => targetFor(set)))]
  if (unique.length === 1)
    return unique[0]!
  const count = work.length
  return `${count} ${count === 1 ? 'set' : 'sets'}`
}

function setLabel(set: Exercise['sets'][number]) {
  if (set.warmup)
    return 'W'
  return String(workingSets.value.findIndex(item => item.position === set.position) + 1)
}
</script>

<template>
  <section class="border-t border-rule py-4" @focusout="collapseOnLeave">
    <button
      class="flex w-full items-baseline justify-between gap-4 py-1 text-left"
      type="button"
      @click="toggle"
    >
      <h2 class="text-[17px]">
        {{ exercise.name }}
      </h2>
      <span v-if="collapsed" class="text-[14px] text-mute">{{ summary() }}</span>
    </button>

    <div v-if="!collapsed" class="mt-3 grid gap-2">
      <div class="grid grid-cols-[36px_1fr_1fr_1fr] gap-2 text-[12px] text-mute">
        <span>Set</span><span>Target</span><span>kg</span><span>Reps</span>
      </div>
      <div
        v-for="set in exercise.sets"
        :key="set.id"
        class="grid grid-cols-[36px_1fr_1fr_1fr] items-center gap-2 py-1.5"
      >
        <span>{{ setLabel(set) }}</span>
        <span class="text-[14px] text-mute">{{ targetFor(set) }}</span>
        <template v-if="set.warmup">
          <span class="col-span-2 text-[14px] text-mute">warmup</span>
        </template>
        <template v-else>
          <input
            v-model="values[set.position]!.kg"
            class="field-line"
            :placeholder="set.weight"
            min="0"
            inputmode="decimal"
            type="number"
          >
          <input
            v-model="values[set.position]!.reps"
            class="field-line"
            :placeholder="set.reps"
            min="0"
            step="1"
            inputmode="numeric"
            type="number"
          >
        </template>
      </div>
    </div>
  </section>
</template>
