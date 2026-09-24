# Data movement — Health samples, logged Sessions and Chat into a daily Pick

Agreed 2026-09-24 in the `/ship` grill for LEON-25, branch `feature/leon-25` (not yet created).

## What moves

Apple Health samples (sleep, HRV, Composition, heart rate, device-recorded workouts) arrive at the backend from the athlete's own scheduled iOS Shortcuts and are stored once each. From them the backend infers runs and yoga as Inferred Sessions and notices gym visits with no lifting logged. The athlete logs lifting Results and confirms, rejects, corrects or adds Sessions in the Session view of a home-screen web app. In the Chat view an LLM records Readiness, Declarations, day-of Exclusions and confirmed Setup changes. Once a day, the first sync carrying last night's sleep runs Check-in, which reads Setup, History, today's inputs, body signals and the Exercise catalog and writes today's Pick (or raises a consult), delivered as a Chat message plus web push.

## Commands

| Command | Issued by | Asks for | Outcomes |
|---|---|---|---|
| sync-health-data | iOS Shortcut (wake-up, 10:00, 14:00, 21:00; last ~36 h) | store Health samples | health-data-synced (new/changed samples stored; re-sent ones ignored). If it carries last night's sleep and Check-in has not run today, it triggers run-check-in. Unauthorised token → rejected. |
| infer-session | every sync | turn a run or yoga workout record into an Inferred Session | session-inferred; nothing when the workout is already known |
| detect-missed-gym-log | every sync, and app open | find a gym workout with no lifting Results | gym-log-missing (nag: Chat message + web push that evening via the 21:00 sync, then daily); nothing when logged or Skipped |
| confirm-inferred-session | athlete (Chat message / Session view); run-check-in for unanswered ones | accept an Inferred Session (yoga: with its type) | inferred-session-confirmed |
| reject-inferred-session | athlete | discard an Inferred Session | inferred-session-rejected (leaves History) |
| correct-run | athlete, Session view | fix time/speed of an inferred run | run-corrected |
| add-run | athlete, Session view | record a run no device recorded | run-added |
| log-lifting-results | athlete, Session view (Hevy-like) | store Exercise, sets, reps, load, rest | lifting-results-logged (stops any missed-log nag) |
| skip-gym-log | athlete, from the nag | stop nagging | gym-log-skipped (gym Session stays with heart-rate exertion, no Results, no Classification) |
| confirm-setup-change | athlete, after the Chat LLM proposes a change | save Plan / Qualities / Injuries / standing Exclusions | setup-changed |
| record-check-in-inputs | Chat LLM tool | save Readiness, a Declaration or a day-of Exclusion | check-in-inputs-recorded |
| end-chat | athlete taps Done; or app opened after 30 idle minutes | close the Chat | chat-ended (transcript kept, not re-sent) |
| run-check-in | first sleep-bearing sync of the day; athlete asks; Chat LLM tool; consult re-pick | produce today's Pick | pick-made (replaces any earlier Pick today) · consult-raised · inferred-session-confirmed for Inferred Sessions still unanswered |
| resolve-consult | athlete, via buttons (keep, drop, re-pick) or a reply in words the Chat LLM turns into the same call | settle a consult | consult-resolved; re-pick re-runs run-check-in |

## Events

| Event | Recorded for |
|---|---|
| health-data-synced | body signals for History and Check-in; triggers inference, missed-log detection, and possibly Check-in |
| session-inferred | a run or yoga awaiting confirmation |
| gym-log-missing | a gym visit awaiting lifting Results |
| inferred-session-confirmed / -rejected | the Inferred Session enters / leaves History |
| run-corrected / run-added | History of runs |
| lifting-results-logged | Results per Exercise; Classification; Lookback; Trend |
| gym-log-skipped | stops the nag; exertion stays in History |
| setup-changed | the standing Plan |
| check-in-inputs-recorded | today's inputs |
| chat-ended | stored transcript; next Chat starts fresh |
| pick-made | today's Pick; "Check-in already ran today" |
| consult-raised / consult-resolved | the consult conversation and its outcome |

## State

- **Health samples stored** (type, start, end, source, value), from health-data-synced. Identity is (type, start, end, source); a corrected value replaces the stored one.
- **History**: Sessions (logged lifting, Inferred Sessions once confirmed, corrected/added runs, skipped gym visits), Results per Exercise, body signals. Written by the Session events above.
- **Setup**: Plan, Qualities, Injuries, standing Exclusions, from setup-changed.
- **Today's inputs**: Readiness, Declarations, day-of Exclusions, from check-in-inputs-recorded.
- **Chat transcript**, from chat-ended.
- **Pick**, from pick-made; its existence for today is "Check-in already ran today".

The grill did not settle table or column shapes beyond the sample identity; those are the implementer's, inside the seams below.

## Read models

| Read model | Kept current by | Read by |
|---|---|---|
| Check-in already ran today | pick-made | sync-health-data (decides whether to trigger Check-in) |
| Inferred Session awaiting confirmation | session-inferred, confirmed/rejected | Chat message + web push; Session view |
| Gym Session awaiting lifting Results | gym-log-missing, lifting-results-logged, gym-log-skipped | the nag; Session view |
| History | the Session events, stored samples | run-check-in; Session view |
| Setup | setup-changed | Chat LLM; run-check-in |
| Today's inputs | check-in-inputs-recorded | Chat LLM; run-check-in |
| Exercise catalog (Exercises, yoga types, Activation on Muscles) | out-of-band seed from an open dataset plus an Activation research pass | run-check-in |
| Pick (Session or Inactivity, with any Hold or Flag) | pick-made | Session view; Chat message + web push |

## Decisions

- No native app (ADR-0013). Apple Health reaches the backend only through the athlete's own Shortcuts; the backend documents the sync payload it accepts. Zepp and Garmin direct APIs were rejected (no individual API; unofficial routes break and breach terms). Swift was rejected over free signing expiring every 7 days.
- Stack: Hono on Vercel Functions, Drizzle on Neon Postgres, Vitest; SvelteKit web app with web push; monorepo `apps/api` + `apps/web`, no shared types package. Single athlete, static device token.
- Check-in judgment is deterministic code (ADR-0014); Jev deferred. The Chat LLM is GPT-6 Sol (standard tier) via Vercel AI Gateway, for Chat only, with tools: propose Setup change, record today's inputs, run-check-in, resolve-consult. A Setup change is saved only after the athlete confirms.
- Check-in runs automatically once a day, on the first sync that carries last night's sleep; later syncs never re-trigger it. Inference and missed-gym detection run on every sync.
- No cron: timed work is checked on sync and on app open (21:00 sync is the evening nag; Chat timeout checked lazily; auto-confirm at the next Check-in).
- Inferred Sessions come from Health workout records only; raw heart rate is not mined.
- The gym is assumed to have everything except Exclusions; no inventory.
- Boundaries: Apple Health, the Shortcuts, the athlete's UI and the catalog seed are `start`s; the Chat transcript is an `end` (kept, never read back into a Chat).
- Out of scope: look-ahead of the next 3 Sessions; Momence booking; Jev; plus LEON-25's existing out-of-scope list.

## Slices

1. **sync-health-data** — given a Shortcut POSTs ~36 h of samples, then health-data-synced + samples stored; a re-sent sample is stored once, a corrected value replaces it; triggers Check-in only if it carries last night's sleep and Check-in has not run today.
2. **infer-session** — given a synced running or yoga workout record, then session-inferred + Inferred Session awaiting confirmation.
2b. **detect-missed-gym-log** — given a synced gym workout and no lifting Results for it, then gym-log-missing + Gym Session awaiting lifting Results; nag that evening, then daily, until logged or Skipped.
3a. **confirm-inferred-session** — then inferred-session-confirmed + History (yoga type picked on confirm).
3b. **reject-inferred-session** — then inferred-session-rejected; it leaves History.
4a. **correct-run** — then run-corrected + History.
4b. **add-run** — then run-added + History.
5. **log-lifting-results** — then lifting-results-logged + History.
5b. **skip-gym-log** — then gym-log-skipped; nagging stops; the gym Session stays with exertion, no Results, no Classification.
6a. **confirm-setup-change** — given the athlete confirms a change the Chat LLM proposed, then setup-changed + Setup.
6b. **record-check-in-inputs** — given Readiness, a Declaration or a day-of Exclusion in Chat, then check-in-inputs-recorded + Today's inputs.
6c. **end-chat** — given Done, or app opened after 30 idle minutes, then chat-ended + transcript kept; next Chat starts fresh.
7. **run-check-in** — given the first sleep-bearing sync, the athlete asking, or the Chat LLM tool, then pick-made + Pick (Chat message + web push), replacing any earlier Pick today; unanswered Inferred Sessions count as confirmed.
7b. **run-check-in (consult)** — given a clashing Declaration, a Session already in today's History, or a run inferred after a Pick, then consult-raised + consult Chat message.
8. **resolve-consult** — given a consult and keep/drop/re-pick (buttons, or words via the Chat LLM), then consult-resolved; re-pick re-runs Check-in.

## Seams

| Seam | Where it lives | Status | Slices |
|---|---|---|---|
| **S1 Backend HTTP interface.** Tests call the Hono app in-process (`app.request`) against a real Postgres in Docker. The clock, the Chat LLM (AI SDK mock model scripting tool calls in tests; GPT-6 Sol via AI Gateway in prod) and the web-push sender are adapters passed in. | `apps/api` | new | 1, 2, 2b, 3a, 3b, 4a, 4b, 5, 5b, 6a, 6b, 6c, 7 (trigger / replace / push wiring), 7b (consult wiring), 8 |
| **S2 Check-in judgment**, a pure module: snapshot (Setup, History, today's inputs, body signals, Exercise catalog with Activation, today's date) → Pick (Session or Inactivity, with any Hold or Flag) or Consult. No database, no clock. Every judgment rule is tested here with plain data: Lookback, readiness, same-group strength, Activation fatigue, Trend and transfer, load, Holds, Composition Flag. | `apps/api` (e.g. `src/check-in`) | new | 7, 7b |
| **S3 Web views.** Svelte component tests with the API client faked: Session view (Pick, Hevy-style set logging, confirm/reject Inferred Session with yoga type, correct/add run, Skip gym log, consult buttons) and Chat view (send, stream, Done). Plus a dev script and browser-MCP config so an agent can drive the running app. | `apps/web` | new | 3a, 3b, 4a, 4b, 5, 5b, 6a, 6b, 6c, 7 (Pick shown), 8 |

## Appendix: the fence

```eventmodel
title Daily Check-in picks a calibrated Session
subtitle LEON-25

# decisions
# - No native iOS app. The client is a home-screen web app (PWA) with two views that toggle: Chat view and Session view.
#   It notifies through web push.
# - Chat: refine the Plan, give an update on an Injury, talk recovery.
# - Session view: shows the next Session (today's Pick); lifting is logged there and runs corrected or added.
# - "Plan" means the standing Goal, Qualities and Injuries (Setup), not a view.
# - Backend owns the data and runs Check-in: TypeScript, Hono on Vercel Functions, Drizzle ORM on Neon Postgres, Vitest.
# - Apple Health reaches the backend through several scheduled iOS Shortcut automations (e.g. on wake-up, 10:00, 14:00,
#   21:00). Each POSTs the last ~36 hours of Health samples (sleep, HRV, workouts, Composition) to the backend.
# - The athlete builds the Shortcut themselves on the phone; the backend documents the sync payload it accepts.
# - Apple Health via Shortcuts is the single source. Zepp/Garmin direct APIs rejected: no individual API, and the
#   unofficial routes break and breach terms.
# - A Health sample's identity is (type, start, end, source). A re-sent sample matches and is stored once; a device's
#   corrected value replaces the stored one.
# - Check-in runs automatically once a day: the first sync that carries last night's sleep triggers it. Later syncs that
#   day never re-trigger it (sync-health-data consults "Check-in already ran today"); they catch late sleep and
#   afternoon workouts. After that Check-in runs only when the athlete asks, when the Chat LLM calls it as a tool, or
#   when a consult resolves as re-pick.
# - No cron. Timed work is checked on sync and on app open: the missed-gym nag (the 21:00 sync serves as the evening
#   nag, then daily), the 30-minute Chat timeout (checked lazily when Chat is next opened), and auto-confirm of
#   Inferred Sessions (at the next Check-in).
# - Logged lifting Results go straight to the backend from the web app.
# - Web app: SvelteKit. Its tests are component tests, and the app is set up so an agent can drive it through a
#   browser MCP.
# - Monorepo: apps/api (Hono) and apps/web (SvelteKit); no shared types package.
# - Auth: single athlete, static device token (on the device, and a Vercel env var on the backend).
# - All body signals (sleep, HRV, Composition, heart rate, device-recorded workouts) are read from Apple Health;
#   which device wrote them (Amazfit, Garmin, Hume) does not matter.
# - The Pick is not made by an LLM. Check-in judgment (readiness, Exercise choice, progression step) is deterministic code.
# - Jev: later experiment, out of scope.
# - Equipment: the gym is assumed to have everything except standing and day-of Exclusions; no inventory is kept.
# - The Chat LLM serves the Chat view only: OpenAI GPT-6 Sol (standard tier, not Flex) via Vercel AI Gateway. Its tools
#   read and update Setup (Plan, Qualities, Injuries, Exclusions) and today's inputs (Readiness, Declarations, day-of
#   Exclusions). It may also call run-check-in on its own (e.g. "I feel wrecked, give me something easier"): it records
#   the Readiness/Declaration and re-runs Check-in; the new Pick replaces the old one (ADR-0001).
# - A Setup change proposed in Chat is confirmed by the athlete before it is saved (chat-only, kept for now).
# - A Chat ends when the athlete taps Done or after 30 idle minutes (the same end-chat). The transcript is stored but
#   not sent to the next Chat; only what the Chat changed (Setup, Readiness, Declarations) carries over.
# - When sleep is synced, the Pick is delivered as a Chat message plus a web push.
# - Consults (ticket 06: a Declaration clashes with the Pick, a Session is already in today's History, a run inferred
#   after a Pick) happen as Chat messages. The athlete resolves one with buttons on the consult message (keep the Pick,
#   drop it, re-pick) or with a reply in words, which the Chat LLM handles by calling the same resolve-consult.
# - Check-in reads History (ADR-0001: Plan, History, Readiness, Declarations and body signals).
# - Runs and yoga are Inferred Sessions detected from Health workout records only (running, yoga written by
#   Garmin/Amazfit); raw heart rate is not mined; a Chat message plus web push asks
#   the athlete to confirm. Yoga's type is picked on confirm. Unanswered by the next Check-in counts as confirmed;
#   a rejected one leaves History.
# - The athlete may edit an inferred run (time/speed) and add a run no device recorded.
# - Lifting Results are logged in the Session view, Hevy-like. The Garmin gives gym exertion (heart rate) only, not the lifts.
# - Missed gym log: Health shows a gym workout (Garmin heart-rate exertion) but no lifting was logged, so the backend
#   nags (Chat message + web push) that evening, then once a day until it is logged or Skipped. Skip stops the nagging;
#   the gym Session stays in History with its heart-rate exertion but no Results and no Classification.
# - Exercise catalog: seeded out of band from an open dataset (e.g. free-exercise-db / wger), not a command on the board;
#   an upfront research pass assigns Activation weights on Muscles; stored as reviewable data. Yoga types get
#   Activation the same way.
# - Out of scope: a look-ahead of the next 3 Sessions (dropped for now).
# - Out of scope: Momence yoga booking (separate ticket later).
# - Client re-confirmed: Shortcuts + web app (ADR-0013). A native Swift app was reconsidered and rejected: free signing
#   expires every 7 days, and $99/yr otherwise.
# - Inference (runs, yoga) and missed-gym detection run on every sync; only Check-in waits for last night's sleep.
# - The athlete asked to only spec in this session; implementation runs later.

# seams
# - Seam 1 (new), backend HTTP interface: tests call the Hono app in-process (app.request) against a real Postgres in
#   Docker; the clock, the Chat LLM (AI SDK mock model scripting tool calls in tests; GPT-6 Sol via Vercel AI Gateway
#   in prod) and the web-push sender are adapters passed in. Lives in apps/api.
#   Slices: 1, 2, 2b, 3a, 3b, 4a, 4b, 5, 5b, 6a, 6b, 6c, 7 (trigger once a day / replace Pick / push wiring),
#   7b (consult wiring), 8.
# - Seam 2 (new), Check-in judgment, a pure module: snapshot (Setup, History, today's inputs, body signals, Exercise
#   catalog with Activation, today's date) -> Pick (Session or Inactivity, with any Hold or Flag) or Consult. No
#   database, no clock. Lives in apps/api (e.g. src/check-in). All judgment rules for slices 7 and 7b are tested here:
#   Lookback, readiness, same-group strength, Activation fatigue, Trend and transfer, load, Holds, Composition Flag.
#   Slices: 7, 7b.
# - Seam 3 (new), web views: Svelte component tests for the Session view (Pick, Hevy-style set logging,
#   confirm/reject Inferred Session with yoga type, correct/add run, Skip gym log, consult buttons) and the Chat view
#   (send, stream, Done) with the API client faked; plus a dev script and browser-MCP config so an agent can drive
#   the running app. Lives in apps/web.
#   Slices: 3a, 3b, 4a, 4b, 5, 5b, 6a, 6b, 6c (Chat view send/stream/Done), 7 (Pick shown), 8 (their views).
# - Slice -> seams: 1: S1 | 2: S1 | 2b: S1 | 3a: S1, S3 | 3b: S1, S3 | 4a: S1, S3 | 4b: S1, S3 | 5: S1, S3 |
#   5b: S1, S3 | 6a: S1, S3 | 6b: S1, S3 | 6c: S1, S3 | 7: S1, S2, S3 (Pick shown) | 7b: S1, S2 | 8: S1, S3

step 1 Scheduled iOS Shortcuts sync Apple Health samples to the backend
step 2 Backend infers a run or yoga Session
step 3 Athlete confirms or rejects the Inferred Session
step 4 Athlete corrects or adds a run
step 5 Athlete logs lifting Results
step 6 Athlete updates Setup or today's inputs in Chat
step 7 Check-in picks a Session
step 8 Athlete sees the Pick

extern 1 Apple Health (sleep, HRV, Composition, heart rate, workouts)
ui 1 iOS Shortcut (athlete's automation; scheduled: wake-up, 10:00, 14:00, 21:00; last ~36 h)
command 1 sync-health-data
event 1 health-data-synced
state 1 Health samples stored (type, start, end, source, value)
read 1 Check-in already ran today (today's Pick exists)

ui 2 App opened
command 2 infer-session | 2 detect-missed-gym-log
event 2 session-inferred | 2 gym-log-missing
read 2 Inferred Session awaiting confirmation | 2 Gym Session awaiting lifting Results

ui 3 Chat message + web push: confirm Inferred Session (yoga type on confirm)
command 3 confirm-inferred-session | 3 reject-inferred-session
event 3 inferred-session-confirmed | 3 inferred-session-rejected

ui 4 Session view: correct or add a run
command 4 correct-run | 4 add-run
event 4 run-corrected | 4 run-added

ui 5 Session view: log lifting Results (Hevy-like) | 5 Chat message + web push: log the gym Session, or Skip (that evening, then daily)
command 5 log-lifting-results | 5 skip-gym-log
event 5 lifting-results-logged | 5 gym-log-skipped
read 5 History (Sessions, Results per Exercise, body signals) | 5 Gym Session awaiting lifting Results

ui 6 Chat | 6 Chat: confirm proposed Setup change | 6 App opened
extern 6 Chat LLM: GPT-6 Sol via Vercel AI Gateway (tools: Setup, today's inputs, resolve-consult, run-check-in)
command 6 confirm-setup-change | 6 record-check-in-inputs | 6 end-chat
event 6 setup-changed | 6 check-in-inputs-recorded | 6 chat-ended
read 6 Setup (Plan, Qualities, Injuries, Exclusions) | 6 Today's inputs (Readiness, Declarations, day-of Exclusions) | 6 Chat transcript (kept, not re-sent)

command 7 run-check-in
event 7 pick-made | 7 consult-raised | 7 inferred-session-confirmed
read 7 Exercise catalog (Exercises, yoga types, Activation on Muscles)
extern 7 Open exercise dataset (free-exercise-db / wger) + Activation research

read 8 Pick (Session or Inactivity) | 8 Check-in already ran today (today's Pick exists)
ui 8 Session view: see the Pick (next Session) | 8 Chat message + web push: the Pick | 8 Chat message: consult (buttons: keep, drop, re-pick; or reply in words)
command 8 resolve-consult | 8 run-check-in
event 8 consult-resolved

flow extern.1 -> ui.1 -> command.1 -> event.1 -> command.2 -> event.2 -> read.2 -> ui.3
flow ui.3 -> command.3.1 -> event.3.1
flow ui.3 -> command.3.2 -> event.3.2
flow ui.4 -> command.4.1 -> event.4.1
flow ui.4 -> command.4.2 -> event.4.2
flow ui.5 -> command.5 -> event.5 -> read.5
flow event.1 -> command.2.2 -> event.2.2 -> read.2.2 -> ui.5.2
flow ui.5.2 -> ui.5.1
flow ui.5.2 -> command.5.2 -> event.5.2 -> read.5
flow event.5.1 -> read.5.2
flow event.5.2 -> read.5.2
flow state.1 -> read.5
flow event.3.1 -> read.5
flow event.3.2 -> read.5
flow event.4.1 -> read.5
flow event.4.2 -> read.5
flow ui.6.1 -> extern.6 -> ui.6.2 -> command.6.1 -> event.6.1 -> read.6.1
flow extern.6 -> command.6.2 -> event.6.2 -> read.6.2
flow read.6.1 -> extern.6
flow read.6.2 -> extern.6
flow ui.6.1 -> command.6.3 -> event.6.3 -> read.6.3
flow event.1 -> command.7
flow ui.6.1 -> command.7
flow read.5 -> command.7
flow read.6.1 -> command.7
flow read.6.2 -> command.7
flow command.7 -> event.7.3
flow command.7 -> event.7 -> read.8 -> ui.8
flow read.8 -> ui.8.2
flow extern.7 -> read.7 -> command.7
flow event.2 -> command.7
flow command.7 -> event.7.2 -> ui.8.3 -> command.8 -> event.8 -> command.8.2
flow extern.6 -> command.8
flow event.1 -> state.1
flow read.1 -> command.1
flow event.7 -> read.8.2
flow extern.6 -> command.7
flow ui.2 -> command.2.2
flow ui.6.3 -> command.6.3

start extern.1, ui.2, ui.6.3, ui.4, ui.5, ui.6.1, extern.7
end read.6.3

slice 1 given a scheduled iOS Shortcut POSTs the last ~36 hours of Health samples | when sync-health-data | then health-data-synced + Health samples stored; a re-sent sample (same type, start, end, source) is stored once, a corrected value replaces it; triggers Check-in only if it carries last night's sleep and Check-in has not already run today
slice 2 given a synced Health workout record for a run or yoga (written by Garmin/Amazfit) | when infer-session | then session-inferred + Inferred Session awaiting confirmation
slice 2b given synced gym workout heart-rate data and no lifting Results logged for it | when detect-missed-gym-log | then gym-log-missing + Gym Session awaiting lifting Results (checked on each sync and on app open; nag: Chat message + web push that evening via the 21:00 sync, then once a day until logged or Skipped)
slice 3a given an Inferred Session awaiting confirmation (yoga: the athlete picks its type) | when confirm-inferred-session | then inferred-session-confirmed + History
slice 3b given an Inferred Session awaiting confirmation | when reject-inferred-session | then inferred-session-rejected + it leaves History
slice 4a given an inferred run with wrong time or speed | when correct-run | then run-corrected + History
slice 4b given a run no device recorded | when add-run | then run-added + History
slice 5 given a completed lifting Session | when log-lifting-results | then lifting-results-logged + History
slice 5b given a Gym Session awaiting lifting Results | when skip-gym-log | then gym-log-skipped + nagging stops; the gym Session stays in History with heart-rate exertion, no Results, no Classification
slice 6a given the athlete confirms a Setup change the Chat LLM proposed | when confirm-setup-change | then setup-changed + Setup
slice 6b given the athlete gives Readiness, a Declaration or a day-of Exclusion in Chat | when record-check-in-inputs | then check-in-inputs-recorded + Today's inputs
slice 6c given an open Chat, and the athlete taps Done, or the app is opened after it sat idle 30 minutes | when end-chat | then chat-ended + Chat transcript (kept, not re-sent); the next Chat starts fresh
slice 7 given the first sync of the day carrying last night's sleep (Check-in not yet run today), the athlete asks in Chat, or the Chat LLM calls it as a tool | when run-check-in | then pick-made + Pick (Chat message + web push), replacing any earlier Pick today; unanswered Inferred Sessions count as confirmed
slice 7b given a Declaration clashes with the Pick, a Session is already in today's History, or a run is inferred after a Pick | when run-check-in | then consult-raised + Chat message: consult
slice 8 given a consult in Chat, and the athlete taps keep, drop or re-pick, or replies in words (the Chat LLM calls resolve-consult) | when resolve-consult | then consult-resolved
```
