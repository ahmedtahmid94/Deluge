# Service workers: lifecycle, caching and updates

Sources:
- MDN, *Using Service Workers*: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
- MDN, *PWA Caching*: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching
- web.dev, *Learn PWA: Update*: https://web.dev/learn/pwa/update

All retrieved 2026-11-26.

## Registration (MDN)

```js
const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
```

- The URL is relative to the origin. The default scope is the worker file's directory, so serve `sw.js` from the site root.
- Registration fails outside a **secure context** (HTTPS, or localhost), or when the scope is broader than the worker's path allows.

## Lifecycle

- `install` is "the first event that is fired on service worker installation or update … generally used to populate your browser's offline caching capabilities". Wrap precaching in `event.waitUntil(...)`. If the promise rejects, installation fails (MDN *Caching*).
- Then the worker activates. MDN *Caching*: clean up "any old versions of its cache in the service worker's activate event".
- `fetch` fires "every time any resource controlled by a service worker is fetched". `event.respondWith(...)` supplies the response.
- **Updates (web.dev):** "The browser detects updates using a byte-by-byte comparison". A new worker installs, then waits: "The wait prevents the new service worker from taking over old clients that might not be compatible with the new version."
- `self.skipWaiting()` plus `clients.claim()` can force activation, but web.dev calls this "not recommended". Instead: "let the user know there is an update waiting but give them the chance to update the page when it is best for them."

## Caching strategies (MDN *Caching*)

| Strategy | Use for |
|---|---|
| **Cache first** | Resources "that will not change for that version of the app", such as the precached shell |
| **Network first** | Fresh data where "a cached resource is better than nothing" |
| **Stale-while-revalidate** ("cache first with cache refresh") | "When responsiveness is important, and freshness is somewhat important but not essential." We use it for forecasts |
| **Network only** | Where no response is better than an outdated one, and for anything private. Caching is never appropriate for POST |

## Beach Day mapping

- Shell: precache, versioned with the build ID.
- `/api/forecast`: stale-while-revalidate.
- `/console*`, `/api/agent*`, `/api/auth*`, `/api/proposals*` and any non-GET: network only.
- Update toast with `SKIP_WAITING` on tap, then reload on `controllerchange`.

Verified in `../examples/02-service-worker/`.
