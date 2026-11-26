---
name: abuse-spend-control
description: "Rate limits, budgets and caps that protect Beach Day's quotas and spend: Netlify rate limiting, daily budgets, concurrency and provider limits. Use when adding an endpoint or reviewing costs."
user-invocable: false
metadata:
  roster-title: "Abuse and spend control"
  owner: security-engineer
  shared-with: [netlify-engineer, agent-console-engineer]
---
# Abuse and spend control

| Layer | Starting values |
|---|---|
| Netlify `rateLimit` on `agent-start` | 10 / 60 s per IP+domain |
| Netlify `rateLimit` on login | 5 / 60 s |
| Netlify `rateLimit` on approve | 5 / 60 s |
| Netlify `rateLimit` on `/api/forecast` | 60 / 60 s, generous because the CDN absorbs most traffic |
| Daily agent budget | `AGENT_DAILY_BUDGET` jobs, and tokens from `usage`; jobs refused past it |
| Per job | ≤12 tool iterations, a `max_tokens` cap, ≤12 min |
| Concurrency | ≤2 running jobs per session |
| Anthropic Console | Workspace spend limit, the hard backstop |
| Netlify Free plan (D3) | Watch usage; caching and budgets keep us inside the free allowance |

Netlify rate limits go in each function's `export const config = { path, rateLimit: { windowLimit, windowSize, aggregateBy: ["ip","domain"] } }`. The window is at most 180 s. **They can't be set in `netlify.toml`.** On Free, aggregation is per domain and IP.

Blobs counters are approximate (last write wins). Fine for budgets; never use them for security decisions.

Every new endpoint needs a rate limit, or a written reason why not.
