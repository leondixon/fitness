---
linear: LEON-58
---

# Adaptive daily Check-in

**Parent. Needs a re-grill before any work starts.**

These children were cut on 2026-09-24 for a daily, adaptive Check-in (ADR-0001, 0004, 0013, 0014). On 2026-09-27, LEON-25 was narrowed to a Plan rotation with double progression (ADR-0015), which supersedes that model for now. The children still describe the old model: Health sync by iOS Shortcuts, Chat with web push, a daily Pick, Inferred Sessions, the missed-gym-log nag, fatigue and Holds, consults and Composition Flags. Their numbering and blockers refer to the old LEON-25 cut.

Re-grill them against the Plan model with `/ship LEON-58` before implementing any of them.

**Status:** needs triage

## Children

- [LEON-33](https://linear.app/leondixon/issue/LEON-33) Health samples sync
- [LEON-39](https://linear.app/leondixon/issue/LEON-39) Chat view with tools, messages and web push
- [LEON-29](https://linear.app/leondixon/issue/LEON-29) Check-in emits a Pick
- [LEON-40](https://linear.app/leondixon/issue/LEON-40) Inferred Sessions
- [LEON-41](https://linear.app/leondixon/issue/LEON-41) Missed gym log nag and Skip
- [LEON-30](https://linear.app/leondixon/issue/LEON-30) Fatigue, same-group strength, Holds
- [LEON-31](https://linear.app/leondixon/issue/LEON-31) Consult on conflict
- [LEON-32](https://linear.app/leondixon/issue/LEON-32) Composition Flags

The 2026-09-24 Data movement model for these is in git history (`.scratch/daily-check-in/event-model.md` at commit 92a2059).
