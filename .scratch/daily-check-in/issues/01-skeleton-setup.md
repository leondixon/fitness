---
linear: LEON-28
effort: hard
---

# 01: Walking skeleton and Setup form

**What to build:** The app runs end to end: one SvelteKit app on Vercel with Drizzle on Neon Postgres behind the static device token, installable to the home screen. You fill in the Setup form (Goal as free text, Injury notes as free text, standing Exclusions as kit) and it persists and reads back. Slices 1a, 1b.

**Blocked by:** None (can start immediately).

**Touches:** repo scaffold (one SvelteKit app at the root, Vite+); S1 harness (form actions and `+server` handlers called in-process, Postgres in Docker, clock adapter); device-token auth in `hooks.server.ts`; Setup schema and save-setup action; web shell with Setup form and an empty Session view; PWA manifest; dev script and browser-MCP config (S3 harness)

**Status:** ready for agent

- [ ] One SvelteKit app at the repo root (Drizzle, Vite+) builds, tests and runs locally; no monorepo, no separate backend, no API client.
- [ ] Tests at S1 call the server handlers (form actions, `+server` routes) in-process against a real Postgres in Docker; the clock is an adapter.
- [ ] Every request without the static device token is rejected.
- [ ] save-setup stores the Goal, Injury notes and standing Exclusions (setup-saved); Setup reads back what was saved; a later save replaces it.
- [ ] Standing Exclusions are kit the gym lacks, not an inventory. Setup has no days per week and no Session length.
- [ ] The Setup form is component-tested at S3; the web app installs to the home screen, and an agent can start it with one dev script and drive it through the configured browser MCP.

Data movement: `../event-model.md` (slices, seams S1–S3). Glossary `CONTEXT.md`; decisions `docs/adr/`, especially ADR-0015.
