---
linear: LEON-29
difficulty: high
---

# 06: Check-in emits a Pick

**What to build:** Check-in produces one Pick, a full Session or Inactivity, from the deterministic judgment module. It runs automatically on the first sync of the day that carries last night's sleep, when you ask, or when the Chat LLM calls it; a new Pick replaces today's earlier one. The Pick shows in the Session view and arrives as a Chat message plus web push. Fatigue veto, Holds, consults and Composition Flags are later tickets. Slice 7.

**Blocked by:** 02 Exercise catalog (LEON-26); 03 Health samples sync (LEON-33); 04 Log lifting Results (LEON-27); 05 Chat (LEON-39).

**Touches:** S2 Check-in judgment module (snapshot → Pick | Consult); run-check-in route and triggers (sync, ask, Chat tool); Pick schema and "Check-in already ran today"; Session view Pick display

**Status:** ready for agent

- [ ] Check-in produces a Pick even when the sleep score is missing.
- [ ] The first sync carrying last night's sleep runs Check-in once; later syncs that day never re-trigger it; asking, or the Chat LLM tool, runs it again and the new Pick replaces the old one.
- [ ] A Pick is a full Session (Exercises, sets, reps, load) or Inactivity; a lifting Pick has a Working-group label (push, pull or legs) that is not the fatigue engine.
- [ ] Catalog-suitable Exercises may be chosen with no History on them; Results stay stored per Exercise.
- [ ] Load comes from long-horizon Trend (monthly / all History; a few recent Sessions must not define it), and Trend transfers when two Exercises share the same main Muscle Activation.
- [ ] The Pick respects the Plan, Injuries, standing and day-of Exclusions; the gym is assumed to have everything else.
- [ ] Judgment is deterministic code at S2, with no who-wins table: sleep, HRV, Readiness and Composition are inputs.
- [ ] The Pick is shown in the Session view and delivered as a Chat message plus web push.

Data movement: `../event-model.md` (slices, seams S1–S3). Glossary `CONTEXT.md`; decisions `docs/adr/0001`–`0014`.
