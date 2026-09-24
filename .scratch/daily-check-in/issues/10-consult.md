---
linear: LEON-31
effort: medium
---

# 10: Consult on conflict

**What to build:** If today already has a Session, a Declaration clashes with the Pick, or a run is inferred after a Pick, Check-in asks in Chat instead of silently adding, refusing or cancelling. You answer with buttons (keep, drop, re-pick) or in words, which the Chat LLM turns into the same answer. Slices 7b, 8.

**Blocked by:** 06 Check-in emits a Pick (LEON-29); 07 Inferred Sessions (LEON-40).

**Touches:** S2 Consult outcome; consult-raised / resolve-consult routes; Chat LLM resolve-consult tool; consult message buttons in Chat view

**Status:** ready for agent

- [ ] If today's History already has a Session, Check-in consults before Picking another.
- [ ] A Declaration that conflicts with the Pick is asked about, not silently cancelled.
- [ ] An inferred run after a Pick prompts the same consult.
- [ ] Keep, drop or re-pick by buttons, or by words through the Chat LLM, resolves the consult; re-pick re-runs Check-in.
- [ ] Consult buttons render in the Chat view (component-tested at S3).

Data movement: `../event-model.md` (slices, seams S1–S3). Glossary `CONTEXT.md`; decisions `docs/adr/0001`–`0014`.
