# Fitness

Greenfield app. You own architecture and contracts. Agents write the code.

Core dev flow lives in [`.cursor/skills/`](.cursor/skills/). Tracker is Linear plus a `.scratch/` mirror.

## Main flow

1. `/grill-me` — interview until shared understanding. Use `/grill-with-docs` instead when you also want `CONTEXT.md` and ADRs updated as terms and hard decisions land.
2. Same sitting → `/implement` here (skip `/to-spec`).
3. Later sitting → `/to-spec` in this window (one ticket). `/to-tickets` only if that ticket will not fit one implement chat. Then a **fresh** chat per `/implement <ticket>`.
4. `/implement` drives `/tdd` at agreed seams and finishes with `/code-review` before commit.

Keep grill → `/to-spec` → optional `/to-tickets` in **one** context window. Clear between implement tickets.

## Linear

Authenticate the Linear MCP when asked. Tickets publish there **and** to `.scratch/<slug>/`. If Linear is down, the local files are enough to continue.
