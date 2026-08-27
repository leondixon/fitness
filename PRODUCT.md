# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Leon, a software engineer, using this as his personal gym companion. He opens it between sets on his phone to see the next workout and log lifts without thinking about programming.

## Product Purpose

Generate a practical repeating training routine from a goal (and optional body notes), then make the next session obvious and fast to log. Success is: he always knows what to do next, logging is quick enough for the gym floor, the cycle keeps repeating, and logged lifts steer later prescriptions instead of remaining decorative.

## Positioning

A single personal routine that is generated and adjusted by an LLM from a goal and body notes, then advanced only by finishing a session. Neighboring trackers can log sets; they cannot truthfully claim this finish-driven repeating plan as the unit of work.

## Operating Context

Used on a phone in the gym, often one-handed between sets. Sign-in is Google. There is no calendar or scheduled week: completing a workout is what moves the rotation forward. Body notes (injuries, imbalances, physical context) are stored and fed into later routine changes and load prescriptions.

## Capabilities and Constraints

Confirmed:

- Google sign-in and one personal account.
- Plans are generated and adjusted by LLM from a goal and body notes.
- No calendar or rest-day schedule; finish advances the next workout.
- Must stay usable on a phone in the gym.
- Finish saves the logged sets immediately, then an AI PT updates that same workout's next kg/reps from the full lift history. If that update has not landed by the time he starts the workout again, Start waits for the PT before opening the logger. Exercise selection stays until the user asks to change the routine. The logger shows those prescriptions as targets and empty-field placeholders, not as prefilled last-session values.

Current implementation, not locked as product law:

- A generated routine currently contains three ordered templates that wrap forever. Whether that count stays fixed is undecided.

## Brand Commitments

Product name in the UI is "Fitness". Voice is practical and direct: next workout, log, finish, change the routine. No other brand assets or identity constraints were confirmed.

## Evidence on Hand

Live personal data in the linked Supabase project (routines, sessions, exercise results, body notes). No marketing proof, testimonials, or third-party case studies exist; future work must not fabricate them.

## Product Principles

1. The next session is the product; everything else is supporting.
2. Gym-floor speed beats desktop completeness.
3. Finishing a workout is the only clock.
4. Generation proposes the routine; logged work decides the next loads.
5. Keep it personal: one user, one active routine, no social layer.
