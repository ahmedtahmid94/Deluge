---
name: web-app-manifest
description: "The Beach Day web app manifest, icons and head tags needed for installability. Use when touching the manifest, icons or app metadata."
user-invocable: false
metadata:
  roster-title: "Web app manifest and icons"
  owner: pwa-engineer
  shared-with: [ui-designer-apple-liquid-glass]
---
# Web app manifest and icons

Installability (MDN):
- HTTPS.
- A manifest linked from **every page**: `<link rel="manifest" href="/manifest.webmanifest">`.
- `name` or `short_name`.
- `icons` including **192 px and 512 px**.
- `start_url`.
- `display` (`standalone`).
- `prefer_related_applications` absent or false.

Beach Day manifest (`public/manifest.webmanifest`, served as `application/manifest+json`):
- `id: "/"`, `name: "Beach Day — South Florida"`, `short_name: "Beach Day"`, `start_url: "/?source=pwa"`, `scope: "/"`, `display: "standalone"`, `orientation: "portrait"`.
- `theme_color` and `background_color` from Sable's tokens.
- Icons: 192, 512, and a 512 `purpose: "maskable"` version whose artwork sits inside the safe zone.
- `screenshots` (narrow form factor) and `shortcuts` ("Today at my beach").

Head tags:
- `apple-touch-icon` 180×180.
- `<meta name="theme-color">`.
- `viewport` with `viewport-fit=cover`, plus `env(safe-area-inset-*)` padding.

Check in Chrome DevTools → Application → Manifest, and on a real iPhone and Android phone.
