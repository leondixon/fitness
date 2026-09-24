---
linear: LEON-39
difficulty: high
---

# 05: Chat view with tools, messages and web push

**What to build:** The Chat view talks to GPT-6 Sol (standard tier) through Vercel AI Gateway. The LLM can propose a Setup change that is saved only after you confirm, and can record Readiness, Declarations and day-of Exclusions for today. A Chat ends on Done or after 30 idle minutes (checked when Chat is next opened); its transcript is kept but not re-sent. The backend can post a Chat message to you with a web push, which later tickets use for Picks, confirmations, nags and consults. Slices 6a (via Chat), 6b, 6c.

**Blocked by:** 01 Walking skeleton and Setup (LEON-28).

**Touches:** Chat routes and streaming; Chat LLM adapter (AI SDK; mock model in tests); tool definitions for Setup and today's inputs; Today's inputs schema; Chat transcript schema; app messages and web-push sender adapter plus push subscription; Chat view

**Status:** ready for agent

- [ ] The Chat LLM is GPT-6 Sol (standard, not Flex) via Vercel AI Gateway; tests script its tool calls with the AI SDK mock model at S1.
- [ ] A Setup change proposed in Chat is saved (setup-changed) only after the athlete confirms it.
- [ ] Readiness, a Declaration or a day-of Exclusion given in Chat is recorded as today's inputs (check-in-inputs-recorded).
- [ ] Tapping Done, or opening Chat after 30 idle minutes, ends the Chat: the transcript is stored, and the next Chat starts without it; only what it changed carries over.
- [ ] The backend can post a message into Chat and send a web push for it; the web app registers for web push.
- [ ] The Chat view sends, streams replies and has Done (component-tested at S3).

Data movement: `../event-model.md` (slices, seams S1–S3). Glossary `CONTEXT.md`; decisions `docs/adr/0001`–`0014`.
