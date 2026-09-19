---
name: to-spec
description: "Turn the current conversation into one implementable ticket and publish it: no interview, just synthesis of what you've already discussed."
disable-model-invocation: true
---

This skill takes the current conversation and produces **one ticket**. Do NOT interview the user. Do NOT ask about seams, modules, or interfaces. Synthesize what the grill already decided.

Read `docs/agents/issue-tracker.md` and `docs/agents/triage-labels.md`. This repo publishes to **Linear** and mirrors under `.scratch/`.

The ticket is the work item `/implement` runs. `/to-tickets` is a later, optional step: only if this ticket will not fit one implement chat.

## Process

1. Explore the repo if you haven't already. Use the project's domain glossary vocabulary, and respect ADRs in the area you're touching.

2. Write one ticket using the template below, then publish it (see `docs/agents/issue-tracker.md`: write `.scratch/<slug>/ticket.md` first, then the Linear issue). Apply the `ready for agent` label — no need for additional triage.

Record only decisions already made in the grill. If the grill did not settle stack, schema, public contracts, or interfaces, omit them. Do not invent them here.

<ticket-template>

# <Ticket title>

**What to build:** the end-to-end behaviour this ticket makes work, from the user's perspective, not a layer-by-layer implementation list.

**Status:** ready for agent

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Out of scope

What the grill explicitly left out. Omit this section if nothing was ruled out.

## Notes

Settled decisions from the grill that a later implement chat will need. No file paths. No new design.

</ticket-template>

Avoid specific file paths or code snippets: they go stale fast. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.
