---
name: cdn-caching
description: "Caching Beach Day responses at Netlify's CDN and in browsers. Use when setting cache headers on functions or static assets."
user-invocable: false
metadata:
  roster-title: "CDN caching"
  owner: netlify-engineer
  shared-with: [open-meteo-integrator, pwa-engineer]
---
# CDN caching

- `/api/forecast?beach=<id>`:
  - `Cache-Control: public, max-age=300` for browsers;
  - `Netlify-CDN-Cache-Control: public, durable, s-maxage=1200, stale-while-revalidate=600` for the CDN. `durable` (functions only) shares one cached response across edge nodes, which saves function invocations on the Free plan;
  - `Netlify-Vary: query=beach` so the cache key depends only on the beach.

  Each beach then hits Open-Meteo at most about every 20 minutes. Netlify's docs say function responses "are not cached by default", so these headers are required (`knowledge/netlify-engineer/docs/headers-and-caching.md`).
- The cache key includes the query string, so only allow-listed beach IDs exist; unknown IDs return 400 with `no-store`.
- Hashed static assets: `Cache-Control: public, max-age=31536000, immutable`.
- `index.html`, `manifest.webmanifest` and `sw.js`: `no-cache` (revalidate) so a deploy is picked up.
- Console pages and all console APIs: `no-store`.
- A new deploy invalidates the CDN cache for static files automatically; function responses follow their headers.
- Watch for `Vary` and cookies: public cached responses must not depend on cookies or set them.
