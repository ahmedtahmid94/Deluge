---
name: service-worker-caching
description: "The Beach Day service worker: versioned precache, per-route caching strategies, updates and cleanup. Use when writing or reviewing sw.js or any caching behaviour."
user-invocable: false
metadata:
  roster-title: "Service workers and caching"
  owner: pwa-engineer
  shared-with: [netlify-engineer, security-engineer, qa-engineer]
---
# Service worker and caching

Strategies (MDN *Caching*):

| Request | Strategy |
|---|---|
| App shell (HTML, JS, CSS, icons, `beaches.json`) | Precache in `install`, inside `event.waitUntil()`; cache-first |
| `/api/forecast` | Stale-while-revalidate. The UI shows the data's age |
| `/console*`, `/api/agent*`, `/api/auth*`, `/api/proposals*` | **Network-only, never cached** (private data) |
| Any non-GET | Never cached |

Lifecycle:
- Cache names include the build ID (`beachday-shell-<sha>`). In `activate`, delete every cache that doesn't match.
- Approvals in the Agent Console redeploy often, so updates must be reliable.
- Update UX: when a new worker is `waiting`, show a "New version available — Reload" toast. On tap, `postMessage({type:"SKIP_WAITING"})`, then reload on `controllerchange`. Never `skipWaiting()` on its own.
- Serve `sw.js` with `Cache-Control: no-cache` (a `netlify.toml` header).
- Register only in production builds.

Offline:
- If both the network and the cache miss, render "You're offline — no saved forecast for this beach yet".

Security:
- Never cache responses that carry `Set-Cookie`, nor any console or API route other than `/api/forecast`.
- Security-engineer reviews any change to the route rules.
