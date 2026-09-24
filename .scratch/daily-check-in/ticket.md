---
linear: LEON-25
---

# Daily Check-in Picks a calibrated Session

**Parent.** Do not implement this issue. Implement the children under `.scratch/daily-check-in/issues/` (frontier: 01).

**What to build:** Once a day, when last night's sleep reaches the backend, or whenever the athlete asks, Check-in produces today's Pick: a full Session (Exercises, sets, reps, load) or Inactivity. The Pick keeps general-fitness Qualities from starving, accounts for yoga and runs already in History, and does not stack work on Muscles that Activation says are cooked. Apple Health samples arrive from the athlete's own scheduled iOS Shortcuts. A home-screen web app has a Session view (see the Pick, log lifting Hevy-style, confirm Inferred Sessions, correct or add runs) and a Chat view (an LLM that updates Setup and today's inputs, and handles consults). Check-in may Flag overeating from Composition, and may Hold a competing run or yoga so that a starved Quality can land.

**Status:** parent (implement children)

## Children

- [LEON-28](https://linear.app/leondixon/issue/LEON-28) 01 Walking skeleton and Setup (high)
- [LEON-26](https://linear.app/leondixon/issue/LEON-26) 02 Exercise catalog and Activation map (medium; blocked by 01)
- [LEON-33](https://linear.app/leondixon/issue/LEON-33) 03 Health samples sync (medium; blocked by 01)
- [LEON-27](https://linear.app/leondixon/issue/LEON-27) 04 Log lifting Results into History (medium; blocked by 01)
- [LEON-39](https://linear.app/leondixon/issue/LEON-39) 05 Chat view with tools, messages and web push (high; blocked by 01)
- [LEON-29](https://linear.app/leondixon/issue/LEON-29) 06 Check-in emits a Pick (high; blocked by 02–05)
- [LEON-40](https://linear.app/leondixon/issue/LEON-40) 07 Inferred Sessions (medium; blocked by 03, 04, 05, 06)
- [LEON-41](https://linear.app/leondixon/issue/LEON-41) 08 Missed gym log nag and Skip (medium; blocked by 03, 04, 05)
- [LEON-30](https://linear.app/leondixon/issue/LEON-30) 09 Fatigue, same-group strength, Holds (medium; blocked by 06)
- [LEON-31](https://linear.app/leondixon/issue/LEON-31) 10 Consult on conflict (medium; blocked by 06, 07)
- [LEON-32](https://linear.app/leondixon/issue/LEON-32) 11 Composition Flags (low; blocked by 06)

## Acceptance criteria

Covered by the children.

## Out of scope

- Multi-user accounts or anyone other than this athlete
- A calendar, backlog or mesocycle the athlete starts and ends; a look-ahead of the next 3 Sessions
- A native iOS app (ADR-0013); direct Zepp or Garmin APIs
- Jev or any model deciding the Pick (ADR-0014)
- Momence yoga booking (a separate ticket later)
- Fat loss as a Quality; meal plans; calorie targets; Flagging undereating
- Extra conditioning as punishment for the scale
- A user-authored static Exercise list; an equipment inventory
- Per-muscle Activation more precise than an approximation
- A lifting classifier more complex than the ≤5-rep majority
- Inferring Sessions from raw heart rate

## Notes

- Data movement: `.scratch/daily-check-in/event-model.md` (also a Linear document on this issue). It has the commands, events, slices and seams S1–S3.
- Glossary: `CONTEXT.md`. Decisions: `docs/adr/0001`–`0014`.
- Stack (settled): Hono on Vercel Functions, Drizzle, Neon Postgres, Vitest; SvelteKit web app with web push; a pnpm monorepo `apps/api` + `apps/web` with no shared types package; a static device token. The Chat LLM is GPT-6 Sol (standard tier) via Vercel AI Gateway.
- The athlete asked for spec only in the grilling session; implementation runs in a later `/ship LEON-25`.
