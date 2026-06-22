<script setup lang="ts">
const upcomingWorkouts = [{
  id: 'functional-full-body-a',
  title: 'Functional Full Body A',
  subtitle: 'Movement-quality strength session built around squat, hinge, push, pull, and carry patterns.',
  date: 'Today',
  focus: 'Squat, hinge, push, pull, carry',
  notes: 'Move well before loading heavier. Keep every rep controlled and athletic.',
  exercises: [
    {
      id: 'worlds-greatest-stretch',
      name: 'World’s Greatest Stretch',
      restSeconds: 20,
      workSetSeconds: 45,
      sets: [
        { warmup: true, previous: 'Bodyweight x 5/side' },
        { warmup: true, previous: 'Bodyweight x 5/side' },
      ],
    },
    {
      id: 'kettlebell-goblet-squat',
      name: 'Kettlebell Goblet Squat',
      restSeconds: 75,
      workSetSeconds: 45,
      sets: [
        { warmup: true, previous: '16kg x 10' },
        { previous: '24kg x 10' },
        { previous: '24kg x 10' },
        { previous: '24kg x 10' },
      ],
    },
    {
      id: 'single-leg-rdl',
      name: 'Single-Leg Romanian Deadlift',
      restSeconds: 75,
      workSetSeconds: 50,
      sets: [
        { previous: '16kg x 8/side' },
        { previous: '16kg x 8/side' },
        { previous: '16kg x 8/side' },
      ],
    },
    {
      id: 'push-up',
      name: 'Push-up',
      restSeconds: 60,
      workSetSeconds: 40,
      sets: [
        { previous: 'Bodyweight x 12' },
        { previous: 'Bodyweight x 12' },
        { previous: 'Bodyweight x 10' },
      ],
    },
    {
      id: 'ring-row',
      name: 'Ring Row',
      restSeconds: 60,
      workSetSeconds: 40,
      sets: [
        { previous: 'Bodyweight x 12' },
        { previous: 'Bodyweight x 12' },
        { previous: 'Bodyweight x 10' },
      ],
    },
    {
      id: 'farmer-carry',
      name: 'Farmer Carry',
      restSeconds: 90,
      workSetSeconds: 45,
      sets: [
        { previous: '24kg/hand x 30m' },
        { previous: '24kg/hand x 30m' },
        { previous: '24kg/hand x 30m' },
      ],
    },
  ],
}, {
  id: 'functional-conditioning',
  title: 'Functional Conditioning',
  subtitle: 'Low-skill conditioning circuit using carries, hinges, crawls, and trunk work.',
  date: 'Wednesday',
  focus: 'Conditioning, trunk stability, loaded locomotion',
  notes: 'Use sustainable pacing. You should finish each round able to repeat the same effort.',
  exercises: [
    {
      id: 'jump-rope',
      name: 'Jump Rope',
      restSeconds: 30,
      workSetSeconds: 60,
      sets: [
        { warmup: true, previous: 'Bodyweight x 60s' },
        { warmup: true, previous: 'Bodyweight x 60s' },
      ],
    },
    {
      id: 'kettlebell-swing',
      name: 'Kettlebell Swing',
      restSeconds: 45,
      workSetSeconds: 40,
      sets: [
        { previous: '20kg x 15' },
        { previous: '20kg x 15' },
        { previous: '20kg x 15' },
        { previous: '20kg x 15' },
      ],
    },
    {
      id: 'sled-push',
      name: 'Sled Push',
      restSeconds: 75,
      workSetSeconds: 35,
      sets: [
        { previous: '60kg x 20m' },
        { previous: '60kg x 20m' },
        { previous: '60kg x 20m' },
        { previous: '60kg x 20m' },
      ],
    },
    {
      id: 'bear-crawl',
      name: 'Bear Crawl',
      restSeconds: 60,
      workSetSeconds: 35,
      sets: [
        { previous: 'Bodyweight x 20m' },
        { previous: 'Bodyweight x 20m' },
        { previous: 'Bodyweight x 20m' },
      ],
    },
    {
      id: 'dead-bug',
      name: 'Dead Bug',
      restSeconds: 45,
      workSetSeconds: 40,
      sets: [
        { previous: 'Bodyweight x 10/side' },
        { previous: 'Bodyweight x 10/side' },
        { previous: 'Bodyweight x 10/side' },
      ],
    },
  ],
}, {
  id: 'functional-unilateral-core',
  title: 'Unilateral + Core Control',
  subtitle: 'Single-side loading to build balance, rotation control, and resilient positions.',
  date: 'Friday',
  focus: 'Unilateral strength, anti-rotation, shoulder stability',
  notes: 'Match left and right side quality. Stop sets when balance or position breaks down.',
  exercises: [
    {
      id: 'turkish-get-up',
      name: 'Turkish Get-up',
      restSeconds: 90,
      workSetSeconds: 60,
      sets: [
        { warmup: true, previous: '8kg x 1/side' },
        { previous: '12kg x 1/side' },
        { previous: '12kg x 1/side' },
        { previous: '12kg x 1/side' },
      ],
    },
    {
      id: 'reverse-lunge',
      name: 'Front-Rack Reverse Lunge',
      restSeconds: 90,
      workSetSeconds: 50,
      sets: [
        { previous: '16kg x 8/side' },
        { previous: '16kg x 8/side' },
        { previous: '16kg x 8/side' },
      ],
    },
    {
      id: 'single-arm-kb-press',
      name: 'Single-Arm Kettlebell Press',
      restSeconds: 75,
      workSetSeconds: 45,
      sets: [
        { previous: '12kg x 8/side' },
        { previous: '12kg x 8/side' },
        { previous: '12kg x 7/side' },
      ],
    },
    {
      id: 'half-kneeling-cable-row',
      name: 'Half-Kneeling Cable Row',
      restSeconds: 75,
      workSetSeconds: 45,
      sets: [
        { previous: '25kg x 10/side' },
        { previous: '25kg x 10/side' },
        { previous: '25kg x 10/side' },
      ],
    },
    {
      id: 'pallof-press',
      name: 'Pallof Press',
      restSeconds: 45,
      workSetSeconds: 35,
      sets: [
        { previous: '12.5kg x 12/side' },
        { previous: '12.5kg x 12/side' },
        { previous: '12.5kg x 12/side' },
      ],
    },
  ],
}, {
  id: 'mobility-recovery-flow',
  title: 'Mobility + Recovery Flow',
  subtitle: 'Lower-intensity session for joint range, tissue prep, breathing, and easy trunk work.',
  date: 'Saturday',
  focus: 'Mobility, recovery, breath control',
  notes: 'Keep this easy. The goal is to leave moving better than when you started.',
  exercises: [
    {
      id: 'cat-cow-t-spine-rotation',
      name: 'Cat-Cow + T-Spine Rotation',
      restSeconds: 20,
      workSetSeconds: 60,
      sets: [
        { warmup: true, previous: 'Bodyweight x 60s' },
        { warmup: true, previous: 'Bodyweight x 60s' },
      ],
    },
    {
      id: 'cossack-squat',
      name: 'Cossack Squat',
      restSeconds: 45,
      workSetSeconds: 45,
      sets: [
        { previous: 'Bodyweight x 6/side' },
        { previous: 'Bodyweight x 6/side' },
        { previous: 'Bodyweight x 6/side' },
      ],
    },
    {
      id: 'hip-airplane',
      name: 'Hip Airplane',
      restSeconds: 45,
      workSetSeconds: 45,
      sets: [
        { previous: 'Bodyweight x 5/side' },
        { previous: 'Bodyweight x 5/side' },
        { previous: 'Bodyweight x 5/side' },
      ],
    },
    {
      id: 'side-plank-reach-through',
      name: 'Side Plank Reach-Through',
      restSeconds: 45,
      workSetSeconds: 40,
      sets: [
        { previous: 'Bodyweight x 8/side' },
        { previous: 'Bodyweight x 8/side' },
        { previous: 'Bodyweight x 8/side' },
      ],
    },
    {
      id: 'box-breathing',
      name: 'Box Breathing',
      restSeconds: 15,
      workSetSeconds: 60,
      sets: [
        { previous: '4-4-4-4 x 60s' },
        { previous: '4-4-4-4 x 60s' },
        { previous: '4-4-4-4 x 60s' },
      ],
    },
  ],
}, {
  id: 'functional-power-agility',
  title: 'Power + Agility',
  subtitle: 'Explosive but repeatable session for jumps, throws, direction changes, and bracing.',
  date: 'Monday',
  focus: 'Power, agility, landing mechanics',
  notes: 'Prioritise crisp reps. Rest longer if power output drops.',
  exercises: [
    {
      id: 'pogo-hop',
      name: 'Pogo Hop',
      restSeconds: 30,
      workSetSeconds: 25,
      sets: [
        { warmup: true, previous: 'Bodyweight x 20' },
        { warmup: true, previous: 'Bodyweight x 20' },
      ],
    },
    {
      id: 'box-jump',
      name: 'Box Jump',
      restSeconds: 90,
      workSetSeconds: 25,
      sets: [
        { previous: '24in x 5' },
        { previous: '24in x 5' },
        { previous: '24in x 5' },
        { previous: '24in x 5' },
      ],
    },
    {
      id: 'medicine-ball-slam',
      name: 'Medicine Ball Slam',
      restSeconds: 60,
      workSetSeconds: 30,
      sets: [
        { previous: '9kg x 8' },
        { previous: '9kg x 8' },
        { previous: '9kg x 8' },
        { previous: '9kg x 8' },
      ],
    },
    {
      id: 'lateral-shuffle',
      name: 'Lateral Shuffle',
      restSeconds: 60,
      workSetSeconds: 30,
      sets: [
        { previous: 'Bodyweight x 20m' },
        { previous: 'Bodyweight x 20m' },
        { previous: 'Bodyweight x 20m' },
      ],
    },
    {
      id: 'suitcase-carry',
      name: 'Suitcase Carry',
      restSeconds: 75,
      workSetSeconds: 45,
      sets: [
        { previous: '24kg x 25m/side' },
        { previous: '24kg x 25m/side' },
        { previous: '24kg x 25m/side' },
      ],
    },
  ],
}, {
  id: 'posterior-chain-resilience',
  title: 'Posterior Chain Resilience',
  subtitle: 'Hinge, glute, hamstring, and trunk work for durable hips and back.',
  date: 'Next Wednesday',
  focus: 'Hinge strength, glutes, hamstrings, trunk endurance',
  notes: 'Use a smooth tempo. No grinding reps on hinge movements.',
  exercises: [
    {
      id: 'glute-bridge-march',
      name: 'Glute Bridge March',
      restSeconds: 30,
      workSetSeconds: 40,
      sets: [
        { warmup: true, previous: 'Bodyweight x 10/side' },
        { warmup: true, previous: 'Bodyweight x 10/side' },
      ],
    },
    {
      id: 'trap-bar-deadlift',
      name: 'Trap Bar Deadlift',
      restSeconds: 120,
      workSetSeconds: 40,
      sets: [
        { warmup: true, previous: '60kg x 6' },
        { previous: '100kg x 5' },
        { previous: '100kg x 5' },
        { previous: '100kg x 5' },
      ],
    },
    {
      id: 'step-up',
      name: 'Step-up',
      restSeconds: 75,
      workSetSeconds: 45,
      sets: [
        { previous: '16kg x 8/side' },
        { previous: '16kg x 8/side' },
        { previous: '16kg x 8/side' },
      ],
    },
    {
      id: 'hamstring-walkout',
      name: 'Hamstring Walkout',
      restSeconds: 60,
      workSetSeconds: 40,
      sets: [
        { previous: 'Bodyweight x 8' },
        { previous: 'Bodyweight x 8' },
        { previous: 'Bodyweight x 8' },
      ],
    },
    {
      id: 'bird-dog-row',
      name: 'Bird Dog Row',
      restSeconds: 60,
      workSetSeconds: 45,
      sets: [
        { previous: '12kg x 8/side' },
        { previous: '12kg x 8/side' },
        { previous: '12kg x 8/side' },
      ],
    },
  ],
}]

const selectedWorkout = ref<(typeof upcomingWorkouts)[number]>()
const workoutEditFeedback = ref('')
const workoutEditPending = ref(false)
const workoutEditMessage = ref('')

const currentWorkout = computed(() => upcomingWorkouts[0])

async function submitWorkoutEditFeedback() {
  const feedback = workoutEditFeedback.value.trim()

  if (!feedback || workoutEditPending.value) {
    return
  }

  workoutEditPending.value = true
  workoutEditMessage.value = ''

  try {
    await $fetch('/api/workout/edit', {
      method: 'POST',
      body: {
        workout: currentWorkout.value,
        feedback,
      },
    })

    workoutEditFeedback.value = ''
    workoutEditMessage.value = 'Feedback sent. LLM edit hook is ready to be connected.'
  }
  catch {
    workoutEditMessage.value = 'Could not send feedback. Please try again.'
  }
  finally {
    workoutEditPending.value = false
  }
}
</script>

<template>
  <main class="app-shell">
    <div v-if="!selectedWorkout" class="mx-auto grid w-full max-w-[860px] gap-3">
      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgb(15_23_42_/_7%)] sm:p-5">
        <div class="mb-3">
          <p class="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-emerald-700">
            Edit workout
          </p>
          <h2 class="text-xl font-extrabold leading-tight text-slate-900">
            Ask for changes to {{ currentWorkout.title }}
          </h2>
          <p class="mt-1 text-sm leading-5 text-slate-500">
            Describe what you want changed. The current workout and your feedback will be sent to the edit API.
          </p>
        </div>

        <form class="grid gap-3" @submit.prevent="submitWorkoutEditFeedback">
          <label class="grid gap-1.5">
            <span class="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Feedback</span>
            <textarea
              v-model="workoutEditFeedback"
              class="min-h-28 w-full resize-y rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              placeholder="Example: Make this easier on my knees and add more core work."
            />
          </label>

          <div class="flex flex-wrap items-center gap-3">
            <button
              class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              type="submit"
              :disabled="!workoutEditFeedback.trim() || workoutEditPending"
            >
              {{ workoutEditPending ? 'Sending…' : 'Send edit request' }}
            </button>
            <p v-if="workoutEditMessage" class="text-sm font-semibold text-slate-500">
              {{ workoutEditMessage }}
            </p>
          </div>
        </form>
      </section>

      <workout-plan
        :workouts="upcomingWorkouts"
        @select="selectedWorkout = $event"
      />
    </div>

    <div v-else class="mx-auto grid w-full max-w-[860px] gap-3">
      <button
        class="w-fit rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        type="button"
        @click="selectedWorkout = undefined"
      >
        ← Back to plan
      </button>

      <workout-logger :workout="selectedWorkout" />
    </div>
  </main>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 12px;
  background: #f1f5f9;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}
</style>
