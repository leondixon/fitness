---
linear: LEON-27
effort: hard
---

# 04: Log Sessions with double progression

**What to build:** The Session view shows the next Session of the Plan, the one after the last logged, with each Exercise prescribed by double progression, or Calibration (sets × reps, no load) on its first appearance. You log the sets there, and History shows each Session's Classification and the Lookback. The Session view shows a banner when the Plan is stale, and Claude can read the next Session, History and each Exercise's progress through MCP. Slices 4a, 4b, 5a–5d.

**Blocked by:** 03 Claude saves a validated Plan (LEON-59).

**Touches:** S2 progression module (pure: sets, rep range, load step, logged history → next prescription or Calibration); log-session route; Sessions, Results and Exercise-progress schema; Classification and Lookback; next-session, history and progress MCP reads; Session view (next Session, logging, stale banner) and History view

**Status:** ready for agent

- [ ] Next Session is strictly the one after the last logged, wrapping to the first; with nothing logged it is the first.
- [ ] Calibration: an Exercise's first appearance prescribes sets × bottom-of-range reps with no load; the load logged seeds its progress.
- [ ] Double progression (tested at S2): the target climbs +1 rep within the range; every set at the top in 3 Sessions in a row → next time +1 load step and target back to the bottom; 2 Sessions in a row below the bottom → −1 load step.
- [ ] Load steps in kg by kit: barbell +2.5, dumbbell +2 per hand, machine or cable +5; bodyweight Exercises progress by reps only.
- [ ] A skipped Exercise leaves its streak untouched; fewer sets than prescribed counts as a miss.
- [ ] log-session stores sets, reps, load and rest per Exercise for the next Session (session-logged); with no Plan, or an Exercise not in that Session, it is rejected (session-rejected).
- [ ] History shows each Session's Classification (strength if most working sets are ≤5 reps, else hypertrophy) and the Lookback of the last five, newer weighted higher.
- [ ] The Session view logs sets and shows the stale banner (component-tested at S3); Claude can read the next Session, History and progress through MCP.

Data movement: `../event-model.md` (slices, seams S1–S3). Glossary `CONTEXT.md`; decisions `docs/adr/`, especially ADR-0015.
