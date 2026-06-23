export const initialUpcomingWorkouts = [{
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

export type WorkoutPlanWorkout = (typeof initialUpcomingWorkouts)[number]

export function useWorkoutPlan() {
  return useState<WorkoutPlanWorkout[]>('workout-plan', () => structuredClone(initialUpcomingWorkouts))
}
