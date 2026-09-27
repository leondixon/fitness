---
linear: LEON-59
effort: medium
---

# 03: Claude saves a validated Plan

**What to build:** Through MCP, Claude saves a Plan: an ordered rotation of Sessions, each with catalog Exercises, sets and a rep range. The backend validates the whole Plan and saves nothing if anything is wrong, returning every error so Claude can fix and resave. A new Plan replaces the old one. Saving Setup after a Plan exists marks the Plan stale until a new one is saved. Slices 3a, 3b, 3c, 1c.

**Blocked by:** 02 Exercise catalog, MCP server and Activation (LEON-26).

**Touches:** Plan schema; save-plan and read-plan MCP tools; whole-Plan validation; staleness (Setup saved after Plan)

**Status:** ready for agent

- [ ] save-plan stores an ordered list of Sessions, each with Exercises, sets and a rep range (plan-saved), replacing the current Plan.
- [ ] It rejects the whole Plan, saving nothing, when any Exercise is not in the catalog, has no Activation, needs standing-Excluded kit, or has sets < 1 or a rep range outside 1 ≤ bottom ≤ top; the rejection lists every error (plan-rejected).
- [ ] read-plan returns the Plan and whether it is stale: stale once Setup is saved after it, fresh again once a new Plan is saved.
- [ ] There are no days in a Plan; Sessions are only ordered.

Data movement: `../event-model.md` (slices, seams S1–S3). Glossary `CONTEXT.md`; decisions `docs/adr/`, especially ADR-0015.
