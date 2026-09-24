---
linear: LEON-26
effort: medium
---

# 02: Exercise catalog and Activation map

**What to build:** The Exercise catalog is seeded from an open dataset (e.g. free-exercise-db or wger) and an upfront research pass gives every catalog Exercise and yoga type Activation weights on Muscles, stored as reviewable data. You can look up Activation for an Exercise or yoga type without producing a Pick.

**Blocked by:** 01 Walking skeleton and Setup (LEON-28).

**Touches:** catalog data files and seed load (out of band, not a board command); catalog tables; Activation lookup module in `apps/api`

**Status:** ready for agent

- [ ] Catalog Exercises have Activation weights on Muscles (an approximation is enough) and the kit each needs.
- [ ] Yoga types yin, rocket, hot, hot vinyasa and dynamic vinyasa have Intensity via Activation; an unknown type gets a default weight from the same map.
- [ ] Activation for an Exercise or yoga type can be looked up without producing a Pick.
- [ ] Push/pull/legs is a label on an Exercise, not the fatigue engine in this map.
- [ ] The seed data is committed in a reviewable form, and loading it twice changes nothing.

Data movement: `../event-model.md` (slices, seams S1–S3). Glossary `CONTEXT.md`; decisions `docs/adr/0001`–`0014`.
