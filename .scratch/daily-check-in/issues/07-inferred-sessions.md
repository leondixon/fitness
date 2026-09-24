---
linear: LEON-40
difficulty: medium
---

# 07: Inferred Sessions

**What to build:** A running or yoga workout record from Health becomes an Inferred Session, and a Chat message plus web push asks you to confirm it (choosing the yoga type) or reject it. If you haven't answered by the next Check-in it counts as confirmed. In the Session view you can correct an inferred run's time or speed, or add a run no device recorded. Slices 2, 3a, 3b, 4a, 4b, and the auto-confirm of 7.

**Blocked by:** 03 Health samples sync (LEON-33); 04 Log lifting Results (LEON-27); 05 Chat (LEON-39); 06 Check-in emits a Pick (LEON-29).

**Touches:** infer-session on sync; confirm/reject/correct/add routes; Inferred Session state in History; auto-confirm hook in run-check-in; Session view run and confirm UI

**Status:** ready for agent

- [ ] Every sync turns new running and yoga workout records into Inferred Sessions; a workout already known is not inferred twice. Raw heart rate is not mined.
- [ ] The athlete is asked in Chat (with web push) to confirm or reject; yoga's type is picked on confirm and becomes its Results label with the inferred duration.
- [ ] A rejected Inferred Session leaves History; a confirmed one enters Lookback as its Classification (run: conditioning, yoga: mobility).
- [ ] An Inferred Session unanswered at the next Check-in counts as confirmed.
- [ ] The athlete can correct an inferred run's time or speed and add a run no device recorded; both land in History.
- [ ] The Session view offers confirm/reject, correct and add (component-tested at S3).

Data movement: `../event-model.md` (slices, seams S1–S3). Glossary `CONTEXT.md`; decisions `docs/adr/0001`–`0014`.
