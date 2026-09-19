# Issue tracker: Linear + local mirror

**Team:** unset — run `list_teams` on Linear MCP and record the team key here after first publish.
**Project:** Fitness (create if missing)

Tickets for this repo live on **Linear**. A markdown mirror under `.scratch/` is always written so agents can keep working if Linear MCP is down.

Use the **Linear MCP** (`plugin-linear-linear`). If the namespace is `needsAuth`, call `mcp_auth`, then retry. If auth is refused, **do not block the flow**: publish to `.scratch/` only and tell the user Linear was skipped.

## Conventions

- One feature per slug: `/to-spec` publishes one Linear issue (the ticket). `/to-tickets` only if that ticket must be chunked: original becomes the parent, children are the implementable slices
- Local mirror: `.scratch/<feature-slug>/ticket.md`; children (if any) at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`
- Each local file has YAML frontmatter with `linear: TEAM-n` (or `none` if unpublished)
- Triage state is a Linear label **and** a `Status:` line on the local file
- Comments go on the Linear issue; append a short note under `## Comments` on the local file when Linear is skipped

Team and project: if unset, `list_teams` on Linear MCP and ask once; then record them in this file.

## Linear MCP operations

Discover tools with the Linear namespace before calling them. Typical mapping:

- **Create**: `save_issue` (title, description, team, project, labels). For a child, set `parentId` to the original ticket.
- **Read**: `get_issue` with comments/relations.
- **List**: `list_issues` (filter by project, label, state).
- **Comment**: `save_comment`.
- **Labels / state / parent / blocking**: `save_issue` with the corresponding fields. Use Linear's blocked-by / related-to relations when the tool exposes them; otherwise put `Blocked by: TEAM-n` at the top of the description.
- **Auth**: `mcp_auth` then retry.

Use real markdown newlines in descriptions (Linear rejects escaped `\n` sequences).

## Pull requests as a triage surface

**PRs as a request surface: no.**

## When a skill says "publish to the issue tracker"

1. Write the local markdown file first (so the agent always has a path).
2. Create or update the Linear issue. Put the Linear identifier into the local file's `linear:` frontmatter.
3. Apply the `ready for agent` label unless instructed otherwise.
4. If Linear fails, leave `linear: none` and continue.

## When a skill says "fetch the relevant ticket"

1. If the user passed `TEAM-n` (or a Linear URL), `get_issue`.
2. Else if they passed a `.scratch/` path, read that file. If `linear:` is set, also fetch Linear so comments are not missed.
3. Else search Linear then `.scratch/`.

