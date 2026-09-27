---
linear: LEON-25
effort:
board: https://claude.ai/artifact/QmdpLw87Pqg5nNiibd9cgG
slices: https://claude.ai/artifact/MrtPKspEtFk9dmTh6dibjM
review:
---

# Plan rotation with progressive overload

**Parent.** Do not implement this issue. Implement the children under `.scratch/daily-check-in/issues/` (frontier: 01).

**What to build:** You fill in Setup (Goal, Injury notes, standing Exclusions) in a home-screen web app. You then ask Claude Code, on your own subscription, to research Activation for catalog Exercises and to design a Plan: a repeatable rotation of Sessions (e.g. Upper A / Lower B) with Exercises, sets and rep ranges. Claude reads and writes through the backend's MCP server, and the backend validates the whole Plan before saving it. You train the Sessions strictly in order; the Session view prescribes each Exercise by double progression (Calibration on first appearance), and you log your sets there. History shows Classification and the Lookback.

**Status:** parent (implement children)

## Children

- [LEON-28](https://linear.app/leondixon/issue/LEON-28) 01 Walking skeleton and Setup form (hard)
- [LEON-26](https://linear.app/leondixon/issue/LEON-26) 02 Exercise catalog, MCP server and Activation (hard; blocked by 01)
- [LEON-59](https://linear.app/leondixon/issue/LEON-59) 03 Claude saves a validated Plan (medium; blocked by 02)
- [LEON-27](https://linear.app/leondixon/issue/LEON-27) 04 Log Sessions with double progression (hard; blocked by 03)

## Acceptance criteria

Covered by the children.

## Out of scope

- Everything in [LEON-58](https://linear.app/leondixon/issue/LEON-58) Adaptive daily Check-in (`.scratch/adaptive-check-in/`): Health sync, Chat and web push, a daily Pick, Inferred Sessions, the missed-gym-log nag, fatigue and Holds, consults, Composition Flags
- Any LLM inside the app; Claude via MCP is the only designer
- Logging Results through Claude
- Days, a calendar, or Session length in the Plan or Setup
- Runs and yoga (assumed to happen outside the app)
- Multi-user accounts; a native iOS app (ADR-0013)
- A user-authored static Exercise list; an equipment inventory

## Notes

- Data movement: `.scratch/daily-check-in/event-model.md` (also a Linear document on this issue). It has the commands, events, slices and seams S1–S3.
- Glossary: `CONTEXT.md` (Plan redefined; Progression and Calibration added). Decisions: `docs/adr/`, especially ADR-0015.
- Stack: Hono on Vercel Functions, Drizzle, Neon Postgres, Vitest; SvelteKit home-screen web app; a pnpm monorepo `apps/api` + `apps/web` with no shared types package; a static device token, also the MCP bearer.
