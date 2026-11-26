---
name: static-serverless-architecture
description: "The Beach Day architecture: a static Vite front end on Netlify, Netlify Functions for Open-Meteo, Claude and GitHub calls, Netlify Blobs for state, and no other servers. Use when designing or reviewing any structural change."
user-invocable: false
metadata:
  roster-title: "Static + serverless architecture"
  owner: software-architect
  shared-with: [netlify-engineer, agent-console-engineer, open-meteo-integrator]
---
# Static + serverless architecture

Fixed decision: **a PWA on Netlify**, made of:
- a static front end;
- Netlify Functions;
- Netlify Blobs for state.

**No other servers, databases or hosting providers.** The Netlify plan is **Free** (decision D3).

Layout (docs/03):
- `src/app/`: Beach Day UI.
- `src/console/`: Agent Console UI, a lazy-loaded route.
- `src/shared/`: pure modules (`scoring.ts`, `openmeteo.ts`, `models.ts`).
- `src/data/beaches.json`
- `public/`: manifest, icons, `_headers`.
- `netlify/functions/`: forecast, auth-*, agents, agent-start, agent-run (background), agent-status, proposal-approve.
- `.claude/agents/`: the agent team.

Boundaries:
- The browser calls **only same-origin `/api/*`**. Open-Meteo, Anthropic and GitHub are called from functions. This keeps CSP `connect-src 'self'`.
- Public code never imports console code.
- Function routes are set with `export const config = { path: "/api/..." }`.
- Sync and streaming functions run at most 60 s; background functions at most 15 min, with no response body. Agent jobs use background functions plus Blobs plus polling.
- Anything needing a long-lived process, websockets, a relational DB or a cron server is out of scope. Propose a Netlify-native alternative or escalate to the lead.
