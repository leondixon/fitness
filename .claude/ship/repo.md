# Repo

A personal training log. TypeScript, one SvelteKit app at the repo root: the home-screen web app, the HTTP routes (`+server` endpoints) and the MCP endpoint Claude Code connects to. Drizzle on Neon Postgres, deployed on Vercel. Vite+ (`vp`) is the toolchain. Nothing is scaffolded yet; the commands below are what the scaffold will provide.

- **Test:** `vp test`
- **Lint:** `vp lint`
- **Typecheck:** `vp check`

## Seams

Tests sit at the public boundaries: the SvelteKit HTTP routes, the MCP tools (exercised with the MCP SDK client in-process), and the Svelte component views over `load` data. The progression rule is a pure module tested directly. The clock is an adapter.

## Domain layout

Matches core: root `CONTEXT.md`, ADRs in `docs/adr/`, no map or `EVENTS.md` yet. The Data movement document for a feature lives in `.scratch/<slug>/event-model.md`.
