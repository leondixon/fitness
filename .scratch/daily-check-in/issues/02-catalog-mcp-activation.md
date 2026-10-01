---
linear: LEON-26
effort: hard
---

# 02: Exercise catalog, MCP server and Activation

**What to build:** The Exercise catalog is seeded from an open dataset (e.g. free-exercise-db or wger) with each Exercise's kit and Working group. The app exposes an MCP endpoint that Claude Code connects to with the device token: it can read Setup and the catalog, write Setup, and record Activation weights on Muscles for an Exercise or yoga type, which is how you do the Activation research through Claude. Slices 2a, 2b, 2c.

**Blocked by:** 01 Walking skeleton and Setup form (LEON-28).

**Touches:** catalog seed data and loader; catalog and Activation schema; MCP endpoint (Streamable HTTP in a SvelteKit `+server` route, bearer = device token) with read-setup, save-setup, read-catalog and record-activation tools; MCP test harness (MCP SDK client in-process); a short doc on adding the MCP server to Claude Code

**Status:** ready for agent

- [ ] The catalog is seeded from an open dataset with each Exercise's kit and Working group; loading it twice changes nothing.
- [ ] Claude Code connects to the MCP endpoint with the static device token; without it the endpoint refuses.
- [ ] Through MCP, Claude can read Setup and the catalog (with any Activation), and save Setup the same way the form does.
- [ ] record-activation stores weights on Muscles for a catalog Exercise or a yoga type (activation-recorded); an unknown Exercise or a weight outside 0..1 is rejected with the reason (activation-rejected).
- [ ] The repo documents how to add the MCP server to Claude Code.

Data movement: `../event-model.md` (slices, seams S1–S3). Glossary `CONTEXT.md`; decisions `docs/adr/`, especially ADR-0015.
