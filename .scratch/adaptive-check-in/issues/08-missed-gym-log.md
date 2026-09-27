---
linear: LEON-41
effort: medium
---

# 08: Missed gym log nag and Skip

**What to build:** When Health shows a gym workout with no lifting logged, you're nagged by Chat message plus web push that evening, then once a day, until you log it or Skip. A Skip keeps the visit in History with its heart-rate exertion but no Results and no Classification. Slices 2b, 5b.

**Blocked by:** 03 Health samples sync (LEON-33); 04 Log lifting Results (LEON-27); 05 Chat (LEON-39).

**Touches:** detect-missed-gym-log on sync and app open; skip-gym-log route; awaiting-log state; nag via app messages; Session view Skip

**Status:** ready for agent

- [ ] Every sync, and every app open, finds gym workouts with no lifting Results.
- [ ] The nag goes out with the 21:00 sync that evening, then once a day; there is no cron.
- [ ] Logging the lifts stops the nag.
- [ ] Skip stops the nag; the gym Session stays in History with its heart-rate exertion, no Results and no Classification, and does not take a Lookback slot as a Quality.
- [ ] The nag and Skip show in the Session view (component-tested at S3).

Data movement: `../event-model.md` (slices, seams S1–S3). Glossary `CONTEXT.md`; decisions `docs/adr/0001`–`0014`.
