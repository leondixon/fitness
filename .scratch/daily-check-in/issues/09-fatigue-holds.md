---
linear: LEON-30
difficulty: medium
---

# 09: Fatigue, same-group strength, Holds

**What to build:** Check-in won't stack work on cooked Muscles. Push strength yesterday forbids push strength today, but pull strength is allowed. If a Quality stays behind, Check-in Holds a competing run or yoga so it can land.

**Blocked by:** 06 Check-in emits a Pick (LEON-29).

**Touches:** S2 judgment module rules (fatigue, same-group strength, load cut, Hold); Pick shape gains Hold

**Status:** ready for agent

- [ ] Fatigue follows overlapping Muscle Activation, not the Quality and not the Working-group label alone.
- [ ] Strength may stack on consecutive days across different Working groups; the same Working group at strength may not.
- [ ] Recent Activation fatigue can reduce feasible load on the Pick.
- [ ] If a Quality stays behind, Check-in may Hold competing runs or yoga; a Hold is not a second Session and not Inactivity of the whole day.
- [ ] All rules are tested at S2 with plain snapshots; the Hold shows with the Pick.

Data movement: `../event-model.md` (slices, seams S1–S3). Glossary `CONTEXT.md`; decisions `docs/adr/0001`–`0014`.
