---
linear: LEON-28
difficulty: high
---

# 01: Walking skeleton and Setup

**What to build:** The monorepo runs end to end: the Hono API on Vercel with Drizzle on Neon Postgres and the static device token, and the SvelteKit home-screen web app with its Chat view and Session view toggle. The first real behaviour is Setup: the standing Plan (general-fitness Goal; Qualities strength, hypertrophy, conditioning, mobility), Injuries and standing Exclusions persist and can be changed whenever (confirm-setup-change, slice 6a at S1) and read back. No calendar, no backlog.

**Blocked by:** None (can start immediately).

**Touches:** repo scaffold (pnpm monorepo, `apps/api`, `apps/web`); S1 test harness (in-process `app.request`, Postgres in Docker, clock adapter); device-token auth; Setup schema and routes; web shell, PWA manifest, dev script and browser-MCP config (S3 harness)

**Status:** ready for agent

- [ ] `apps/api` (Hono, Drizzle, Vitest) and `apps/web` (SvelteKit, component tests) build, test and run locally; no shared types package.
- [ ] Tests at S1 run the Hono app in-process against a real Postgres in Docker; the clock is an adapter.
- [ ] Every API request without the static device token is rejected.
- [ ] confirm-setup-change saves the Plan, Injuries and standing Exclusions; Setup reads back what was saved; a later change replaces it.
- [ ] Standing Exclusions are only what the gym lacks, not an inventory; there is no calendar and no backlog of future Sessions.
- [ ] The web app installs to the home screen and toggles between an empty Chat view and Session view; an agent can start it with one dev script and drive it through the configured browser MCP.

Data movement: `../event-model.md` (slices, seams S1–S3). Glossary `CONTEXT.md`; decisions `docs/adr/0001`–`0014`.
