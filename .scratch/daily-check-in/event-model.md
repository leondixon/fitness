# Data movement — Setup, Activation and logged Sessions into a progressing Plan

Agreed 2026-09-27 in the `/ship` grill for LEON-25 (first cut), branch `feature/leon-25` (not yet created). Replaces the 2026-09-24 daily Check-in model, which moves to a new epic.

## What moves

The athlete saves Setup (Goal, Injury notes, standing Exclusions) in the web app. Claude Code, on the athlete's own subscription, connects to an MCP server on the backend: it records Activation research for catalog Exercises (seeded from an open dataset), reads Setup, the catalog and History, and saves a Plan, a rotation of Sessions with Exercises, sets and rep ranges, which the backend validates whole. The Session view shows the next Session in the rotation with each Exercise prescribed by double progression (or Calibration on first appearance). The athlete logs the Session there; History, Classification, Lookback and each Exercise's progress update.

## Commands

| Command | Issued by | Asks for | Outcomes |
|---|---|---|---|
| save-setup | athlete, Setup form; Claude via MCP | store Goal, Injury notes, standing Exclusions | setup-saved (a Plan saved earlier becomes stale) |
| record-activation | Claude via MCP | store weights on Muscles for a catalog Exercise or yoga type | activation-recorded · activation-rejected (unknown Exercise, weight outside 0..1) |
| save-plan | Claude via MCP | store a new Plan replacing the current one | plan-saved · plan-rejected (every error listed; nothing saved) |
| log-session | athlete, Session view | store the sets done for the next Session | session-logged · session-rejected (no Plan, or an Exercise not in that Session) |

## Events

| Event | Recorded for |
|---|---|
| setup-saved | Setup; marks an existing Plan stale |
| activation-recorded / -rejected | the catalog's Activation map; a Plan may only use Exercises with Activation |
| plan-saved / -rejected | the current Plan; clears staleness |
| session-logged / -rejected | History (Results per Exercise, Classification, Lookback) and each Exercise's progress |

## State

- **Setup**: Goal (free text), Injury notes (free text Claude reads), standing Exclusions (kit).
- **Exercise catalog**: seeded Exercises with kit and Working group; Activation weights on Muscles from record-activation.
- **Plan**: ordered Sessions; each Exercise with sets and rep range; saved-at, compared against Setup's saved-at for staleness.
- **History**: logged Sessions, Results per Exercise (sets, reps, load, rest), Classification.
- **Exercise progress**: per Exercise in the Plan, current load, target reps, streak of top-of-range Sessions, misses below range.

Table and column shapes beyond these fields are the implementer's, inside the seams below.

## Read models

| Read model | Kept current by | Read by |
|---|---|---|
| Setup | setup-saved | Setup form; Claude via MCP |
| Exercise catalog | seed, activation-recorded | Claude via MCP; save-plan validation |
| Plan (with stale flag) | plan-saved, setup-saved | Claude via MCP; Session view banner |
| Next Session | plan-saved, session-logged | Session view; Claude via MCP |
| History (Classification, Lookback) | session-logged | Session view; Claude via MCP |
| Exercise progress | session-logged | Next Session; Claude via MCP |

## Decisions

- First cut only (ADR-0015). Health sync, Chat, web push, Inferred Sessions, missed-log nag, fatigue and Holds, consult and Composition Flags move to a new epic for a re-grill.
- Plan is redefined as the rotation (glossary). Sessions are done strictly in order; no days, no Session length in Setup.
- No LLM in the app. Claude Code on the athlete's subscription reads and writes through an MCP server served over Streamable HTTP from a SvelteKit `+server` route; bearer = the static device token. MCP can read Setup, catalog, History with Lookback, Exercise progress, Plan with its stale flag and Next Session; it can write Setup, Activation and the Plan. Results are logged only in the Session view.
- Activation research is Claude's, written through MCP; a Plan cannot use an Exercise without Activation (ADR-0007).
- save-plan validates the whole Plan: every Exercise in the catalog with Activation, none needing standing-Excluded kit, sets and rep range sane (sets ≥ 1, 1 ≤ bottom ≤ top). Any error rejects it all, listing every error for Claude to fix.
- Double progression: +1 rep target within the range; every set at the top in 3 Sessions in a row → next time +1 load step and target back to the bottom; 2 Sessions in a row below the bottom → −1 load step. A skipped Exercise leaves its streak untouched; fewer sets than prescribed is a miss.
- Load steps in kg by kit: barbell +2.5, dumbbell +2 per hand, machine or cable +5; bodyweight progresses by reps only.
- Calibration: first appearance prescribes sets × bottom-of-range reps with no load; the logged load seeds progress.
- Runs and yoga are assumed to happen outside the app. Classification (≤5-rep majority) and the 5-Session Lookback are kept for History and MCP.
- Stack: one SvelteKit app at the repo root (home-screen web app, `+server` routes and the MCP endpoint) with Drizzle on Neon Postgres on Vercel, tested with Vite+; no separate backend, no monorepo, no API client; a static device token, also the MCP bearer (ADR-0016).
- Boundaries: the Setup form, Claude Code and the open dataset are starts; rejected events are ends.

## Slices

1a. **save-setup** — where the form holds a Goal, Injury notes and Exclusions, then setup-saved.
1b. **Setup view** — given setup-saved, then Setup.
1c. **Stale Plan** — given plan-saved then setup-saved, then Plan reads as stale (banner and MCP flag).
2a. **record-activation** — given the seeded catalog, where Claude sends weights for a catalog Exercise or yoga type, then activation-recorded.
2b. **record-activation rejected** — unknown Exercise or weight outside 0..1, then activation-rejected.
2c. **Catalog view** — given activation-recorded, then Exercise catalog shows it.
3a. **save-plan** — given Setup and Activation, a valid Plan, then plan-saved.
3b. **save-plan rejected** — unknown Exercise, no Activation, excluded kit, or bad sets/range, then plan-rejected listing every error, nothing saved.
3c. **Plan view** — given plan-saved, then Plan.
4a. **Next Session, first time** — given plan-saved and nothing logged, then the first Session with every Exercise in Calibration.
4b. **Next Session, progressed** — given the first Session logged with an Exercise at the top of its range for the 3rd time in a row, then the next Session is the second, and that Exercise's next appearance carries +1 load step at the bottom of the range.
5a. **log-session** — given plan-saved, sets logged with some Exercises skipped, then session-logged.
5b. **log-session rejected** — no Plan, or an Exercise not in the next Session, then session-rejected.
5c. **History view** — given session-logged, then History with Classification and Lookback.
5d. **Progress view** — given session-logged with fewer sets on one Exercise and another skipped, then the first counts a miss and the second's streak is unchanged.

## Seams

| Seam | Where | Status | Slices |
|---|---|---|---|
| **S1 Server interface, including MCP.** Tests call the form actions, `+server` routes and `load` functions in-process against a real Postgres in Docker; MCP tools are exercised with the MCP SDK client against the in-process endpoint. The clock is an adapter. | `src/` server code | new | all |
| **S2 Progression**, a pure module: an Exercise's sets, rep range, load step and its logged history in the Plan → the next prescription (load and target reps, or Calibration). No database, no clock. | `src/` server code | new | 4a, 4b, 5d |
| **S3 Web views.** Svelte component tests over `load` data: Setup form, Session view (next Session, logging, stale banner), History. Plus a dev script and browser-MCP config so an agent can drive the running app. | `src/` routes | new | 1a, 1c, 4a, 5a, 5c |

## Appendix: the fence

```eventmodel
title Plan rotation with progressive overload
subtitle LEON-25 first cut

# decisions
# - First cut: generate a Plan with progressive overload. Health sync, Chat, web push, Inferred Sessions, missed-log nag,
#   fatigue/Holds, consult and Composition Flags move to a new epic for a re-grill.
# - Plan is redefined: the repeatable rotation of Sessions (e.g. Upper A / Lower B, or PPL). Not dated, not per day:
#   Sessions are done strictly in order. Goal, Qualities, Injuries and Exclusions are Setup.
# - No LLM in the app. The athlete asks Claude (Claude Code, own subscription) to design the Plan; Claude reads and writes
#   through an MCP server the backend exposes (bearer = static device token).
# - MCP tools: read Setup, Exercise catalog, History (with Classification and Lookback), per-Exercise progress, the Plan
#   (including whether it is stale); write Setup, Activation weights, and the Plan. Results are never logged via MCP.
# - Activation research is done by the athlete through Claude and written via MCP. A Plan cannot use an Exercise that has
#   no Activation yet (ADR-0007).
# - save-plan validates the whole Plan (every Exercise in the catalog with Activation, none needing standing-Excluded
#   kit, sane sets and rep range) and saves nothing on any error, returning every error so Claude can fix and resave.
# - Setup form: Goal (free text), Injuries (free-text notes Claude reads), standing Exclusions (kit from the catalog).
#   No days per week, no Session length. Changing Setup after a Plan exists marks the Plan stale: a banner in the Session
#   view and a flag on the MCP Plan read, until a new Plan is saved.
# - Double progression, deterministic: each Plan Exercise has sets and a rep range. Every set at the top of the range in
#   3 consecutive Sessions -> next time add one load step and return to the bottom of the range; otherwise target +1 rep.
#   Missing the bottom of the range twice in a row drops one load step. An Exercise skipped in a Session leaves its streak
#   untouched; fewer sets than prescribed is a miss.
# - Load steps in kg by kit: barbell +2.5, dumbbell +2 per hand, machine/cable +5; bodyweight progresses by reps only.
# - Calibration: the first time an Exercise appears, the Session prescribes sets x target reps with no load; the athlete
#   picks a weight and logs what they did, which seeds its progress.
# - Runs and yoga are assumed to happen outside the app; the Plan covers lifting.
# - Classification (<=5-rep majority) and the 5-Session Lookback are kept and shown in History, and readable via MCP.
# - Stack: one SvelteKit app on Vercel, Drizzle on Neon Postgres, Vite+; no separate backend; MCP over Streamable HTTP
#   from a +server route.

# seams
# - S1 (new) server interface, including the MCP endpoint: tests call form actions, +server routes and load functions
#   in-process against a real Postgres in Docker; MCP tools are exercised with an MCP SDK client over the in-process
#   transport. src/ server code.
#   Slices 1-6.
# - S2 (new) progression, a pure module: an Exercise's sets, rep range, load step and its logged history in the Plan ->
#   the next prescription (load and target reps, or calibration). No database, no clock. src/ server code. Slices 5, 6.
# - S3 (new) web views: Svelte component tests over load data, for the Setup form, the Session view (next
#   Session, logging, stale banner) and History; plus a dev script and browser-MCP config. src/ routes. Slices 1, 5, 6.

step 1 Athlete fills in Setup
step 2 Claude records Activation research
step 3 Claude designs the Plan
step 4 Athlete sees the next Session
step 5 Athlete logs the Session

ui 1 Setup form (Goal, Injuries, standing Exclusions)
command 1 save-setup
event 1 setup-saved
read 1 Setup

extern 2 Claude Code (athlete's subscription) via MCP
command 2 record-activation
event 2 activation-recorded | 2 activation-rejected
read 2 Exercise catalog
extern 2 Open exercise dataset

command 3 save-plan
event 3 plan-saved | 3 plan-rejected
read 3 Plan

read 4 Next Session
ui 4 Session view: next Session | 4 Session view: Plan out of date banner

ui 5 Session view: log sets
command 5 log-session
event 5 session-logged | 5 session-rejected
read 5 History | 5 Exercise progress

flow ui.1 -> command.1 -> event.1 -> read.1
flow extern.2.1 -> command.2 -> event.2.1 -> read.2
flow command.2 -> event.2.2
flow extern.2.2 -> read.2
flow read.1 -> extern.2.1
flow read.2 -> command.3
flow extern.2.1 -> command.3
flow command.3 -> event.3.1 -> read.3 -> read.4 -> ui.4.1
flow command.3 -> event.3.2
flow read.3 -> ui.4.2
flow ui.4.1 -> ui.5 -> command.5 -> event.5.1 -> read.5.1
flow event.5.1 -> read.5.2
flow command.5 -> event.5.2

start ui.1, extern.2.1, extern.2.2
end event.2.2, event.3.2, event.5.2, read.5.1, read.5.2

slice 1a
  where the Setup form holds a Goal, Injury notes and standing Exclusions
  when  save-setup
  then  setup-saved
slice 1b given setup-saved | then Setup
slice 1c
  given plan-saved, setup-saved
  where Setup was saved after the Plan
  then  Plan
slice 2a
  given Open exercise dataset
  where Claude sends weights on Muscles for a catalog Exercise or yoga type
  when  record-activation
  then  activation-recorded
slice 2b
  where the Exercise is not in the catalog, or a weight is outside 0..1
  when  record-activation
  then  activation-rejected
slice 2c given activation-recorded | then Exercise catalog
slice 3a
  given setup-saved, activation-recorded
  where every Exercise is in the catalog with Activation, needs no standing-Excluded kit, and has sane sets and rep range
  when  save-plan
  then  plan-saved
slice 3b
  given setup-saved
  where an Exercise is unknown, lacks Activation, needs excluded kit, or has bad sets or rep range
  when  save-plan
  then  plan-rejected
slice 3c given plan-saved | then Plan
slice 4a
  given plan-saved
  where no Session has been logged; each Exercise appears for the first time
  then  Next Session
slice 4b
  given plan-saved, session-logged
  where the last logged Session was the Plan's first; its Exercises hit the top of the range for the 3rd time in a row
  then  Next Session
slice 5a
  given plan-saved
  where sets logged for the next Session, some Exercises skipped
  when  log-session
  then  session-logged
slice 5b
  where no Plan exists, or a logged Exercise is not in the next Session
  when  log-session
  then  session-rejected
slice 5c given session-logged | then History
slice 5d
  given session-logged
  where fewer sets than prescribed on one Exercise, another skipped
  then  Exercise progress
```
