# Fitness

A personal training coach for one athlete. Each day Check-in picks today's Session (or Inactivity) from the standing Plan, History and body signals, keeping the general-fitness Qualities from starving.

You own architecture and contracts. Agents write the code. Vocabulary lives in [`CONTEXT.md`](CONTEXT.md); decisions in [`docs/adr/`](docs/adr/).

## Stack

Settled in the LEON-25 grill; not built yet.

- **Backend** (`apps/api`): Hono on Vercel Functions, Drizzle on Neon Postgres, Vitest. Single athlete, static device token.
- **Web app** (`apps/web`): SvelteKit, installed to the iPhone home screen, with a Chat view and a Session view and web push.
- **Health data**: your own scheduled iOS Shortcuts post Apple Health samples to the backend (ADR-0013). There is no native app.
- **Chat LLM**: GPT-6 Sol via Vercel AI Gateway. The Pick itself is deterministic code (ADR-0014).

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

Run `/ship` in Claude Code: one chat from idea to reviewed feature. It grills you (keeping `CONTEXT.md` and the ADRs current, and building the event model when data moves), writes the ticket, splits it into children, ranks their difficulty and shows you the slices. Nothing starts until you say go; then TDD agents implement each child, `/code-review` runs over the feature branch, and it stops at a review page with no PR.

Resume a run in a fresh chat with `/ship <ticket>`, e.g. `/ship LEON-25`. Run state is read from `.scratch/<slug>/` and git.

## Linear

Team LEON, project Fitness app. Authenticate the Linear MCP when asked. Tickets publish there **and** to `.scratch/<slug>/`. If Linear is down, the local files are enough to continue. See [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md).
