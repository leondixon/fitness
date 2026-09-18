# Fitness

Repo conventions override personal agent instructions.

You are the implementer. The human owns architecture, contracts, and decisions that are hard to reverse. Do not invent stack, schema, or public API.

## Agent skills

### Issue tracker

Linear, with a `.scratch/` markdown mirror. See `docs/agents/issue-tracker.md`.

### Triage labels

`needs triage`, `needs info`, `ready for agent`, `ready for human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root, created lazily. See `docs/agents/domain.md`.

## Main flow

`/grill-with-docs` → (`/to-spec` → `/to-tickets`) → `/implement` (drives `/tdd`, then `/code-review`). Skip spec and tickets when the work fits one session.

Grill, spec, and tickets stay in one context window. Each `/implement` starts fresh from the ticket.
