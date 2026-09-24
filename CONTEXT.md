# Fitness

Personal training context: one athlete, a general-fitness Goal held as Qualities. Today's Session is generated at Check-in. There is no backlog of future Sessions. Picks require an Activation map.

## Intention

**Goal**:
General fitness: being well-rounded by keeping Qualities from starving. Not a single adaptation. Fat loss is not a Quality; Composition may still Flag overeating.
_Avoid_: goals (as a pile of co-equal product aims), well-rounded (as a vibe with no Qualities)

**Quality**:
A capability the Goal requires the athlete to keep developing. The Qualities are strength, hypertrophy, conditioning, and mobility. Which one is behind is judged from a weighted Lookback so they even out over the long term.
_Avoid_: pillar, modality, fitness component

**Lookback**:
The last five completed Training Sessions, newer weighted higher, used to see which Qualities are behind. Inactivity does not take a slot. A Session enters Lookback as its Classification, not as the Quality it was Picked as.
_Avoid_: rolling average, weekly split, five calendar days

**Setup**:
The persisted capture of the Plan, including Injuries. Filled before daily Check-ins. The athlete may update it whenever.
_Avoid_: onboarding, profile, pre-screen (as the domain term)

**Pick**:
Today's decision at Check-in: a full Session (Exercises, sets, reps, load) to do, or Inactivity. Fatigue from Activation overlap is considered before serving a starved Quality. Strength as a Quality may stack on consecutive days; the same Working group at strength may not. A lifting Pick has one primary Working group (a label, not the fatigue engine). If a Quality stays behind, Check-in may Hold competing runs or yoga so that Quality can land.
_Avoid_: recommendation (when it is the day's work), routine, quality sticker

**Constraint**:
A fact today's Session must respect. An Injury is a Constraint. An Exclusion is a Constraint.
_Avoid_: profile, information, notes

**Exclusion**:
Equipment the athlete marks unavailable. Standing: not at this gym, persist, do not Pick it again. Day-of: mention it in Check-in for today only. Not an inventory of what they have.
_Avoid_: equipment list, gym profile, kit

**Injury**:
A body limitation that restricts what a Session may contain or how hard it may be.

**Working group**:
A label on a lifting Pick: push, pull, or legs. Not the fatigue engine. Fatigue, overlap, and Trend transfer use Activation on Muscles.
_Avoid_: body part, lag (as the thing itself), split (as the fatigue model)

**Muscle**:
A body-tissue unit that can be loaded. Fatigue, overlap, and Trend transfer are about Muscles, not Working groups.
_Avoid_: body part (when the unit is Muscle)

**Activation**:
How much an Exercise or yoga type loads particular Muscles. Required before Picks. Filled by a research approximation and/or when an Exercise is first chosen as suitable.
_Avoid_: EMG, score (as the domain concept)

**Exercise**:
A named lift that can appear in a Session. Not a user-curated static list. Chosen as suitable for the Pick even if it has no History yet. Results are stored per Exercise. Trend transfers between Exercises when they share the same main muscle activation.
_Avoid_: movement, lift (as the catalog unit)

**Trend**:
Long-horizon progression of Results for an Exercise (monthly, from all History). A few recent Sessions must not define it. Used to infer expected growth and to inform load, including on related Exercises.
_Avoid_: progress, PR, last-three average

**Composition**:
Weight, body-fat %, and muscle mass as a coarse body signal. Not accurate enough to be a Goal.
_Avoid_: Hume, scale, body comp (as product aims)

**Flag**:
A Check-in message that is not a Pick. Composition may Flag overeating when a two-week Composition Trend shows weight up as fat, not muscle.
_Avoid_: nutrition plan, calorie target

**Hold**:
A Check-in instruction to skip competing Training (a run or yoga) so a starved Quality can be trained. Not a second Session and not Inactivity of the whole day.
_Avoid_: rest day, deload (as this specific instruction)

**Intensity**:
How heavily a Session contributes fatigue, derived from Activation (and from yoga type). Common yoga types include yin, rocket, hot, hot vinyasa, and dynamic vinyasa; weights come from the same research as Activation. Yoga still Classifies as mobility.
_Avoid_: difficulty, effort (when the domain fact is fatigue contribution)

**Plan**:
The standing Goal, Qualities, Constraints, and Injuries, persisted in Setup. Not a list of future Sessions. Not a calendar.
_Avoid_: program, routine, workout plan, backlog, schedule, platter

## Work

**Session**:
Today's chunk of work, generated at Check-in, or already performed. Not pinned to a calendar day ahead of time. It acquires a date when it is done, Declared, or inferred.
_Avoid_: workout, today's workout (as if the calendar owned it)

**Check-in**:
Produces today's Pick when sleep is recorded, or when the athlete asks. A missing sleep score does not block the Pick. If today's History already has a Session, Check-in consults before Picking another. May also emit a Flag or a Hold. Also the conversation that takes Readiness, Declarations, Exclusions, and training questions.
_Avoid_: chat, coach, grok-bot, webhook (as domain terms)

**Readiness**:
How the athlete says they feel at Check-in.

**Declaration**:
The athlete stating what they are doing or about to do. If that conflicts with today's Pick, Check-in asks whether to drop the Pick. It does not silently cancel.
_Avoid_: log (when the point is to change what comes next, not merely to record)

**Results**:
The outcome of a completed Session. Lifting Results are the Exercises, sets, reps, load, and rest, logged by the athlete. Yoga Results are a type label (which carries Intensity) and duration: the duration is inferred from body signals and the athlete gives the type when confirming. Runs are not Results; they are inferred into History, and the athlete may correct one or add one no device recorded.
_Avoid_: log (when the outcome is the domain concept), import

**Inferred Session**:
A run or yoga Session detected from body signals (heart rate, a device-recorded workout) rather than logged. Check-in asks the athlete to confirm it. If they have not answered by the next Check-in, it counts as confirmed; a rejected one leaves History.
_Avoid_: auto-log, detected workout

**Classification**:
The single Quality assigned to a completed Session from its Results (or from inference, for a run). Not taken from the Pick. A run is conditioning. Yoga is mobility. Lifting is strength or hypertrophy by a rep rule for now.
_Avoid_: tag, intended quality

**Training**:
A Session that develops a Quality. Lifting, running, and yoga are Training. After it is done, it has exactly one Classification.
_Avoid_: other exercise (for yoga and running)

**Activity**:
Stimulus that is not aimed at a Quality. Still History. Yoga and running are not Activity.
_Avoid_: other exercise, cardio (as a separate product concept)

**Inactivity**:
A period with no meaningful Training or Activity. Still History.
_Avoid_: rotting, rest (when used as a vague bucket for both planned recovery and doing nothing)

**History**:
Completed Sessions (including inferred runs), Results, Activity, Inactivity, Readiness, Trends, Activation-based fatigue, and body signals (sleep, Composition, training-readiness/HRV when present), used to generate later Sessions.
_Avoid_: past workouts, logs (as the domain concept)
