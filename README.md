# Fitness

Greenfield app. You own architecture and contracts. Agents write the code.

Core dev flow lives in [`.cursor/skills/`](.cursor/skills/). Tracker is Linear plus a `.scratch/` mirror.

## Main flow

1. `/grill-with-docs` — interview until shared understanding; updates `CONTEXT.md` and ADRs as terms and hard decisions land.
2. Small enough for one session → `/implement` here.
3. Multi-session → `/to-spec` then `/to-tickets`, then a **fresh** chat per `/implement <ticket>`.
4. `/implement` drives `/tdd` at agreed seams and finishes with `/code-review` before commit.

Keep grill → spec → tickets in **one** context window. Clear between implement tickets.

## Linear

Authenticate the Linear MCP when asked. Specs and tickets publish there **and** to `.scratch/<slug>/`. If Linear is down, the local files are enough to continue.
