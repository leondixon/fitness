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

`/grill-me` → `/to-spec` → optional `/to-tickets` → `/implement` (drives `/tdd`, then `/code-review`). Use `/grill-with-docs` instead of `/grill-me` when you also want `CONTEXT.md` and ADRs written as you go.

`/to-spec` publishes **one** implementable ticket from the grill. `/to-tickets` only if that ticket will not fit one implement chat: it chunks into children and the original becomes the parent. Skip `/to-spec` when implementing in the same grill sitting.

Grill, `/to-spec`, and optional `/to-tickets` stay in one context window. Each `/implement` starts fresh from a ticket (the unchunked `/to-spec` issue, or a child).
