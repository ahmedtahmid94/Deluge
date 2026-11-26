# PWA engineer examples

| Folder / file | What it shows | How to check |
|---|---|---|
| `01-manifest/` | A Beach Day manifest and a checker for MDN's installability criteria and web.dev's recommendations | `cd 01-manifest && node --experimental-strip-types check-manifest.ts manifest.webmanifest` |
| `02-service-worker/` | A versioned precache, stale-while-revalidate for `/api/forecast`, network-only private routes, the update toast, and old-cache cleanup, **tested in Chromium** | `cd 02-service-worker && node test.mjs` (needs Playwright; preinstalled here) |
| `03-install-ui/` | The `beforeinstallprompt` install button (Android) and the iOS Add to Home Screen hint, tested on emulated Pixel 7 and iPhone 15 | `cd 03-install-ui && node test.mjs` |

Verified 2026-11-26 (Playwright 1.63, Chromium):
- the offline reload rendered the cached forecast;
- the agent API was not cached;
- after the update, the caches were `beachday-data-v1, beachday-shell-bbb222`;
- the install UI passed on both devices.
