# Fitness

Greenfield app. You own architecture and contracts. Agents write the code.

Core dev flow lives in [`.cursor/skills/`](.cursor/skills/). Tracker is Linear plus a `.scratch/` mirror.

## Local checkout

Use a `.bare` container with sibling worktrees. Open `main/` (or another worktree), not the container.

```
fitness/
  .bare/
  .git            gitdir: ./.bare
  main/
  <slug>/
```

First clone:

```bash
git clone --bare https://github.com/leondixon/fitness.git fitness/.bare
cd fitness
echo "gitdir: ./.bare" > .git
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
git fetch origin
git worktree add main
install -m 755 main/.githooks/post-checkout .bare/hooks/post-checkout
```

`post-checkout` copies `.env` into new worktrees.

New feature (folder = branch = slug):

```bash
git worktree add -b <slug> <slug>      # from the container
git worktree add -b <slug> ../<slug>   # from an existing worktree
```

## Main flow

1. `/grill-me` — interview until shared understanding. Use `/grill-with-docs` instead when you also want `CONTEXT.md` and ADRs updated as terms and hard decisions land.
2. Same sitting → `/implement` here (skip `/to-spec`).
3. Later sitting → `/to-spec` in this window (one ticket). `/to-tickets` only if that ticket will not fit one implement chat. Then a **fresh** chat per `/implement <ticket>`.
4. `/implement` drives `/tdd` at agreed seams and finishes with `/code-review` before commit.

Keep grill → `/to-spec` → optional `/to-tickets` in **one** context window. Clear between implement tickets.

## Linear

Authenticate the Linear MCP when asked. Tickets publish there **and** to `.scratch/<slug>/`. If Linear is down, the local files are enough to continue.
