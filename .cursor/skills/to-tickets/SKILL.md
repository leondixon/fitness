---
name: to-tickets
description: Decide whether the ticket from /to-spec fits one implement chat; if not, chunk it into tracer-bullet children with blocking edges.
disable-model-invocation: true
---

# To Tickets

`/to-spec` already published **one ticket**. This skill decides whether that ticket must be **chunked**.

If it fits a single fresh `/implement` chat, say so and stop. Do not create children.

If it will not fit, break it into tracer-bullet vertical slices, each declaring the tickets that **block** it. The original ticket becomes the parent; children are what `/implement` runs.

Read `docs/agents/issue-tracker.md` and `docs/agents/triage-labels.md`. This repo publishes to **Linear** and mirrors under `.scratch/`.

## Process

### 1. Gather the ticket

Fetch the `/to-spec` ticket: argument (path, `TEAM-n`, URL), else the ticket just published in this conversation, else search Linear then `.scratch/`. If none exists, tell the user to run `/to-spec` first.

### 2. Decide: keep or chunk

A ticket fits one implement chat when a fresh agent can finish it from the ticket body plus `CONTEXT.md` / ADRs, in one sitting, without needing a further split.

If it fits: say that the existing ticket is the work item, and stop.

If it does not: continue.

### 3. Explore the codebase (only when chunking)

If you have not already explored, do so. Ticket titles and descriptions should use the project's domain glossary vocabulary, and respect ADRs in the area you're touching.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 4. Draft vertical slices

<vertical-slice-rules>

- Each slice cuts a narrow but COMPLETE path through every layer (schema, API, UI, tests): vertical, NOT a horizontal slice of one layer
- A completed slice is demoable or verifiable on its own
- Each slice is sized to fit in a single fresh context window
- Any prefactoring should be done first

</vertical-slice-rules>

Give each ticket its **blocking edges**: the other tickets that must complete before it can start. A ticket with no blockers can start immediately.

**Wide refactors are the exception to vertical slicing.** A **wide refactor** is one mechanical change (rename a column, retype a shared symbol) whose **blast radius** fans across the whole codebase, so a single edit breaks thousands of call sites at once and no vertical slice can land green. Don't force it into a tracer bullet; sequence it as **expand–contract**. First expand: add the new form beside the old so nothing breaks. Then migrate the call sites over in batches sized by blast radius (per package, per directory), each batch its own ticket blocked by the expand, keeping CI green batch to batch because the old form still exists. Finally contract: delete the old form once no caller remains, in a ticket blocked by every migrate batch. When even the batches can't stay green alone, keep the sequence but let them share an integration branch that all block a final integrate-and-verify ticket; green is promised only there.

### 5. Quiz the user

Present the proposed breakdown as a numbered list. For each ticket, show:

- **Title**: short descriptive name
- **Blocked by**: which other tickets (if any) must complete first
- **What it delivers**: the end-to-end behaviour this ticket makes work

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the blocking edges correct: does each ticket only depend on tickets that genuinely gate it?
- Should any tickets be merged or split further?

Iterate until the user approves the breakdown.

### 6. Publish the children

Publish the approved children. **How** is in `docs/agents/issue-tracker.md`. This repo uses **both**: write local files **and** Linear children of the original ticket.

- **Local files** → write one file per child under `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01` in dependency order (blockers first). Each file's "Blocked by" lists the numbers/titles it depends on. Use the per-ticket file template below: one ticket per file, never a single combined file. Update `.scratch/<feature-slug>/ticket.md` so it is clearly the parent: implement the children, not this issue.
- **Linear** → publish one sub-issue per child in dependency order (blockers first), `parentId` = the original ticket. Use Linear blocked-by when available; otherwise `Blocked by: TEAM-n` in the body. Apply the `ready for agent` label to **children only**. Leave the parent open; do not implement it. Write the Linear id into each local file's `linear:` frontmatter. If Linear MCP is unauthenticated, skip Linear and continue with local files.

Work the **frontier**: any ticket whose blockers are all done. For a purely linear chain that means top to bottom.

Do NOT close the parent.

<local-ticket-template>

# <NN>: <Ticket title>

**What to build:** the end-to-end behaviour this ticket makes work, from the user's perspective, not a layer-by-layer implementation list.

**Blocked by:** the numbers/titles of the tickets that gate this one, or "None (can start immediately)".

**Status:** ready for agent

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2

</local-ticket-template>

<issue-template>

## Parent

A reference to the parent ticket.

## What to build

The end-to-end behaviour this ticket makes work, from the user's perspective, not layer-by-layer implementation.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Blocked by

- A reference to each blocking ticket, or "None (can start immediately)".

</issue-template>

In either form, avoid specific file paths or code snippets: they go stale fast. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.
