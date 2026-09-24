---
linear: LEON-33
difficulty: medium
---

# 03: Health samples sync

**What to build:** The athlete's scheduled iOS Shortcuts (wake-up, 10:00, 14:00, 21:00) post the last ~36 hours of Apple Health samples (sleep, HRV, Composition, heart rate, workouts) and the backend stores each sample once. The accepted payload is documented so the athlete can build the Shortcut. Slice 1 (without the Check-in trigger, which 06 adds).

**Blocked by:** 01 Walking skeleton and Setup (LEON-28).

**Touches:** sync-health-data route and payload contract; Health samples schema; body-signal reads for History; Shortcut setup doc

**Status:** ready for agent

- [ ] sync-health-data stores sleep, HRV, Composition, heart rate and workout samples as health-data-synced.
- [ ] A sample is identified by (type, start, end, source): a re-sent sample is stored once; a corrected value replaces the stored one.
- [ ] It is device-agnostic: Amazfit, Garmin and Hume samples arrive the same way through Apple Health.
- [ ] The payload the Shortcut must send is documented in the repo, with steps to build the Shortcut automation.
- [ ] A malformed payload is rejected with an error naming what is wrong; nothing is partially stored.

Data movement: `../event-model.md` (slices, seams S1–S3). Glossary `CONTEXT.md`; decisions `docs/adr/0001`–`0014`.
