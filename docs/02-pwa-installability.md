# 02 — PWA installability (iPhone and Android) and when to go native

## What makes a PWA installable

From MDN *Making PWAs installable*, a site is installable when it meets all of these:

1. It is served over **HTTPS** (or from `localhost` / `127.0.0.1` in development). Netlify serves HTTPS by default.
2. It links a **web app manifest** from **every page**:
   ```html
   <link rel="manifest" href="/manifest.webmanifest" />
   ```
3. The manifest contains:
   - `name` **or** `short_name`
   - `icons` that include a **192 px** and a **512 px** icon
   - `start_url`
   - `display` and/or `display_override` (use `standalone`)
   - `prefer_related_applications` absent or `false`

MDN notes that a **service worker is not strictly required for installability**. We still ship one for offline support and fast repeat loads.

### Recommended `manifest.webmanifest`

Serve it as `application/manifest+json`. Netlify infers this from the `.webmanifest` extension; add a header rule if it does not.

```json
{
  "id": "/",
  "name": "Beach Day — South Florida",
  "short_name": "Beach Day",
  "description": "Is today a good beach day? Forecasts for South Florida beaches.",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#0077b6",
  "background_color": "#fdf6e3",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    { "src": "/screens/today.png", "sizes": "1080x1920", "type": "image/png", "form_factor": "narrow" }
  ],
  "shortcuts": [
    { "name": "Today at my beach", "url": "/?view=today" }
  ]
}
```

Also add these to `<head>`:

- `<link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png">`. iOS uses it for the home-screen icon.
- `<meta name="theme-color" content="#0077b6">`
- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`, with CSS `env(safe-area-inset-*)` padding so content clears the notch and home indicator in standalone mode.

## Platform behaviour

### Android

- **Chrome on devices with Google Mobile Services, and Samsung Internet on Samsung devices**, install PWAs as real **WebAPKs**: an app-drawer icon, its own task, no browser badge. (MDN)
- Firefox, Edge, Opera and Chrome without GMS add a **browser-badged shortcut** that opens in the browser. (MDN)
- **`beforeinstallprompt`** fires when the browser decides the app is installable. Call `preventDefault()`, keep the event, show our own "Install Beach Day" button, and call `event.prompt()` when it is tapped. (MDN)

### iPhone / iPad

- **No `beforeinstallprompt` on iOS.** (MDN) Installation is always manual, from the **Share menu → Add to Home Screen**.
- From **iOS 16.4**, Add to Home Screen is available in Safari, Chrome, Edge, Firefox and Orion. On iOS 16.3 and earlier it worked only in Safari. (MDN)
- Because there is no prompt, the app must **detect iOS and not-yet-installed** and show a short, dismissible hint with the Share icon: "Tap Share, then Add to Home Screen".
  - Installed: `window.matchMedia('(display-mode: standalone)').matches` or `navigator.standalone === true`.
  - Remember the dismissal in `localStorage`.
- From iOS 16.4, **Web Push** works for **home-screen web apps** (not for Safari tabs). That is enough for a later "Tomorrow looks great" notification. It needs a push service and a VAPID key on the server, so it is v2 scope.
- Treat browser storage as **evictable** on iOS. Cache only what can be re-downloaded and keep user settings small: the favourite beach and units.

### Desktop (bonus)

Chromium browsers install PWAs on all desktop operating systems. Safari 17+ on macOS Sonoma has *File → Add to Dock*. Firefox desktop does not install PWAs. (MDN)

## Service worker plan

MDN *Caching* describes three strategies. We map them like this:

| Request | Strategy | Why |
|---|---|---|
| App shell (HTML, JS, CSS, icons, `beaches.json`) | **Precache at `install`** (cache-first) | Needed on every launch and fixed for a given build |
| `/api/forecast?...` (our function) | **Stale-while-revalidate** | Show the last forecast instantly with "Updated 25 min ago", then refresh. A slightly old forecast is better than nothing at the beach with poor signal |
| `/api/agent/*`, `/api/auth/*`, `/console` (Agent Console) | **Network-only, never cached** | Holds private, per-session data; it must not be stored on the device |
| Any `POST` | **Never cached** | MDN: caching is never right for POST |

Rules:

- **Version the cache name with the build ID** (for example `beachday-shell-<commit-sha>`, injected at build time). In `activate`, delete caches that don't match (MDN: clean old caches in `activate`). This matters a lot here because an **Agent Console approval triggers a redeploy**, so new builds will ship often.
- Pass the precache promise to `event.waitUntil()` in `install` so a failed precache fails the install. (MDN)
- **Update UX**: when a new worker is `waiting`, show a "New version available — Reload" toast. On tap, post `SKIP_WAITING`, then reload on `controllerchange`. Don't call `skipWaiting()` on its own: it would swap code under a running page.
- **Offline**: if both the network and the cache miss for a forecast, show "You're offline — no saved forecast for this beach yet", not a blank page.
- Register the worker only in production builds, so a stale worker doesn't hide changes during development.

Write the worker by hand (about 80 lines) for v1, or use Workbox if the team prefers. Either way, test the update path (see `05-testing-and-accessibility.md`).

## PWA or native wrapper (Capacitor)?

**Recommendation: ship Beach Day as a PWA. Do not use Capacitor for v1.** Everything v1 needs is available on the web: fetch, a cached shell, home-screen install and, from iOS 16.4, push. Netlify deploys go live immediately, with no app-store review. That matters because the Agent Console commits and redeploys code.

Choose a native wrapper such as **Capacitor** (which runs the same web code inside a native iOS/Android shell, with plugins that call native APIs or fall back to web APIs) when one of these becomes a requirement:

| Need | Why a PWA falls short |
|---|---|
| App Store / Play Store listing for discoverability | Users look for apps in stores. Installing from the web takes more steps, especially on iOS. |
| Reliable scheduled local notifications ("8 am every Saturday") or background refresh on iOS | No dependable background execution for web apps on iOS |
| Home-screen **widgets** (a "today's verdict" widget), Live Activities, Apple Watch | Native only |
| Background location or geofencing ("you're near Haulover — conditions are…") | Not available to web apps in the background |
| In-app purchases or subscriptions through the stores | Store billing is native. Paid use would also need a paid Open-Meteo plan. |

Notes for later:

- For **Android only**, a PWA can be listed on Google Play as a Trusted Web Activity without Capacitor (for example with Google's Bubblewrap tool), reusing the same deployed site.
- Apple reviews thin web wrappers critically, under its minimum-functionality guideline. A Capacitor iOS app should add real native value, such as widgets or notifications, before submission.
- If we go native later, Capacitor's PWA support means the same codebase still deploys to Netlify as the PWA. Keep platform checks behind one small `platform.ts` module so this stays cheap.

## Install checklist (for the frontend agent)

- [ ] Manifest linked on every page; 192/512 and maskable icons; `display: standalone`; `id` and `start_url` set
- [ ] `apple-touch-icon` 180×180; `theme-color`; safe-area padding
- [ ] Custom install button wired to `beforeinstallprompt` (Android/desktop)
- [ ] iOS Add to Home Screen hint, shown only when not standalone and dismissible
- [ ] Service worker: versioned precache, stale-while-revalidate for forecasts, network-only for the console, update toast
- [ ] Tested on a real iPhone (Safari) and a real Android phone (Chrome): install, launch offline, update after a redeploy

## Sources

- MDN, *Making PWAs installable*: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
- MDN, *Web application manifest*: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest
- MDN, *Caching* (PWA guide): https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching
- Capacitor, *Building Progressive Web Apps*: https://capacitorjs.com/docs/web/progressive-web-apps
- Ionic blog on PWAs, iOS 16.4 Web Push and Capacitor trade-offs: https://ionic.io/blog/take-your-web-app-further-with-capacitor
