---
linear: LEON-27
effort: medium
---

# 04: Log lifting Results into History

**What to build:** In the Session view you log a lifting Session Hevy-style (Exercise, sets, reps, load, rest) and History shows its Classification plus a Lookback of the last five Training Sessions. Slice 5.

**Blocked by:** 01 Walking skeleton and Setup (LEON-28).

**Touches:** log-lifting-results route; Sessions and Results schema; History, Classification and Lookback module in `apps/api`; Session view logging UI

**Status:** ready for agent

- [ ] Lifting Results store Exercise, sets, reps, load and rest, per Exercise.
- [ ] Classification: lifting is strength if most working sets are ≤5 reps, otherwise hypertrophy; a run is conditioning; yoga is mobility.
- [ ] Lookback is the last five completed Training Sessions, newer weighted higher; Inactivity does not take a slot.
- [ ] A Session enters Lookback as its Classification, not as the Quality it was Picked as; when Results miss a Pick, History records what happened, with no warning and no double count.
- [ ] The Session view logs sets Hevy-style (component-tested at S3).

Data movement: `../event-model.md` (slices, seams S1–S3). Glossary `CONTEXT.md`; decisions `docs/adr/0001`–`0014`.
