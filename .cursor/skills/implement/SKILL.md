---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Read `docs/agents/issue-tracker.md` and `docs/agents/domain.md` first. Fetch the ticket from Linear (`TEAM-n`) or the `.scratch/` mirror.

If the argument is a **parent spec / epic** with children: list the frontier (unblocked, not done). Ask whether to implement the next ticket, run the chain serially, or parallelise independent frontier tickets (disjoint work; one worktree/subagent each). Do not start children whose blockers are open.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /code-review to review the work.

Commit your work to the current branch. Mention Linear identifiers in the commit body.
