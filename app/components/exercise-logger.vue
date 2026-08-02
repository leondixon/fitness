<script setup lang="ts">
import type { z } from 'zod'
import type { loggedSetSchema } from '~~/server/schema/session'
import type { Exercise } from '~~/server/schema/workout'

type LoggedSet = z.infer<typeof loggedSetSchema>

const props = defineProps<{
  exercise: Exercise
  initialSets?: LoggedSet[]
  completed?: boolean
  saving?: boolean
}>()

const emit = defineEmits<{
  done: [sets: LoggedSet[]]
  undo: []
}>()

const values = ref<Record<number, { kg: string, reps: string }>>({})

watch(
  () => props.initialSets,
  (sets) => {
    const existing = new Map((sets ?? []).map(set => [set.position, set]))
    values.value = Object.fromEntries(props.exercise.sets.map((set) => {
      const logged = existing.get(set.position)
      return [set.position, {
        kg: logged ? String(logged.kg) : '',
        reps: logged ? String(logged.reps) : '',
      }]
    }))
  },
  { immediate: true },
)

const workingSets = computed(() => props.exercise.sets.filter(set => !set.warmup))

function save() {
  const sets = workingSets.value.flatMap((set) => {
    const value = values.value[set.position]
    if (!value?.kg.trim() || !value.reps.trim())
      return []
    return [{
      position: set.position,
      kg: Number(value.kg),
      reps: Number(value.reps),
    }]
  }).filter(set =>
    Number.isFinite(set.kg) && set.kg >= 0
    && Number.isInteger(set.reps) && set.reps >= 0,
  )
  emit('done', sets)
}
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">
          Exercise
        </p>
        <h2 class="text-xl font-bold text-slate-900">
          {{ exercise.name }}
        </h2>
      </div>
      <span v-if="completed" class="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">Done</span>
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
        <span class="text-xs text-slate-600">{{ set.weight.replaceAll('%', '') }} × {{ set.reps }}</span>
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

    <div class="mt-3 flex gap-2">
      <button class="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50" :disabled="saving" type="button" @click="save">
        {{ saving ? 'Saving…' : completed ? 'Save again' : 'Done' }}
      </button>
      <button v-if="completed" class="rounded-xl px-3 py-2 text-sm font-bold text-slate-600" :disabled="saving" type="button" @click="emit('undo')">
        Undo
      </button>
    </div>
  </section>
</template>
