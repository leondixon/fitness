---
name: implement
description: "Implement a ticket published by /to-spec, or a child ticket after /to-tickets has chunked it."
disable-model-invocation: true
---

Implement the ticket the user named.

Read `docs/agents/issue-tracker.md` and `docs/agents/domain.md` first. Fetch the ticket from Linear (`TEAM-n`) or the `.scratch/` mirror.

- **Unchunked `/to-spec` ticket** (no children): implement that ticket.
- **Child after `/to-tickets`**: implement that child.
- **Parent with children**: do not implement the parent. List the frontier (unblocked, not done). Ask whether to implement the next ticket, run the chain serially, or parallelise independent frontier tickets (disjoint work; one worktree/subagent each). Do not start children whose blockers are open.

Use /tdd where possible, at pre-agreed seams. Confirm seams in this session; they are not on the ticket.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /code-review to review the work.

Commit your work to the current branch. Mention Linear identifiers in the commit body.
