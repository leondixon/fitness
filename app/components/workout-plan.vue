<script setup lang="ts">
import type { Workout } from '~~/server/schema/workout'
import type { WorkoutPlan } from '~~/server/schema/workoutPlan'

const props = defineProps<{ plan: WorkoutPlan }>()
const emit = defineEmits<{ select: [] }>()

const next = computed(() => props.plan.upcoming[0])
const later = computed(() => props.plan.upcoming.slice(1))

function setCountLabel(exercise: Workout['exercises'][number]) {
  const count = exercise.sets.filter(set => !set.warmup).length
  return `${count} ${count === 1 ? 'set' : 'sets'}`
}
</script>

<template>
  <section v-if="next">
    <p class="mt-10 text-[13px] text-mute">
      Next
    </p>
    <h1 class="mt-1 text-[2.5rem] leading-none tracking-tight">
      {{ next.workout.title }}
    </h1>
    <p v-if="next.workout.focus" class="mt-3 text-[15px] text-mute">
      {{ next.workout.focus }}
    </p>

    <ul class="mt-10 divide-y divide-rule border-y border-rule">
      <li
        v-for="exercise in next.workout.exercises"
        :key="exercise.id"
        class="flex items-baseline justify-between gap-4 py-3.5"
      >
        <span>{{ exercise.name }}</span>
        <span class="text-[14px] text-mute">{{ setCountLabel(exercise) }}</span>
      </li>
    </ul>

    <div v-if="later.length" class="mt-10">
      <p class="text-[13px] text-mute">
        Later
      </p>
      <p v-for="item in later" :key="item.occurrence" class="mt-3 text-mute">
        {{ item.workout.title }}
      </p>
    </div>

    <button class="btn-ink mt-10" :disabled="!next.loggable" type="button" @click="emit('select')">
      Start
    </button>
  </section>
</template>
