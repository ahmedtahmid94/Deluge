# Installability on Android and iOS

Sources:
- MDN, *Making PWAs installable*: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
- web.dev, *Learn PWA: Installation*: https://web.dev/learn/pwa/installation

Both retrieved 2026-11-26.

## Minimum criteria (MDN)

- Served over **HTTPS**, or from `localhost` / `127.0.0.1` in development.
- A manifest linked from **every page**: `<link rel="manifest" href="manifest.json" />`.
- The manifest has `name` or `short_name`; `icons` including a **192px and a 512px** icon; `start_url`; `display` and/or `display_override`; and `prefer_related_applications` `false` or absent.
- MDN: a service worker is "not a requirement for a PWA to be installable". We ship one for offline support.

web.dev: "Because the test that a PWA meets installability requirements can take several seconds, installability itself may not be available as soon as a URL's response is received."

## Android (web.dev and MDN)

- "Depending on the device and browser, your PWA will either be installed as a WebAPK, a shortcut, or a QuickApp."
- **WebAPK:** used "by Google Chrome on devices with Google Mobile Services (GMS) installed, and by Samsung Internet browser, but only on Samsung-manufactured devices." Installed WebAPKs:
  - have an icon in the launcher and home screen;
  - appear in Settings → Apps;
  - can use badging and app shortcuts;
  - can update their icon and metadata.
- **Shortcuts:** "Firefox, Microsoft Edge, Opera, Brave, and Samsung Internet (on non-Samsung devices) … will create shortcuts." Shortcuts have a browser-badged icon, can't use install-only capabilities, and "Can't update their icons and app metadata."
- Install prompts "differ by device and browser": a mini-infobar or a detailed dialog. Chromium browsers fire `beforeinstallprompt` (see `install-prompt.md`).

## iOS and iPadOS (web.dev and MDN)

- "A browser prompt to install your PWA doesn't exist on iOS and iPadOS … These apps have to be added manually to the home screen using a browser share menu."
- MDN: from iOS 16.4, PWAs "can be installed from the Share menu in Safari, Chrome, Edge, Firefox, and Orion". Before 16.4, Safari only.
- Steps: Share → **Add to Home Screen** → confirm the (user-editable) name → **Add**.
- Add `<link rel="apple-touch-icon" href="/icons/ios.png">`. Without it, "the icon on the home screen will be a screenshot of your PWA".
- "Only the standalone display mode is supported. … if you use minimal UI mode, it will fall back to a browser shortcut; if you use fullscreen, it will fall back to standalone."
- Installed iOS PWAs appear on the home screen and in Spotlight, Siri Suggestions and App Library search, but "Lack support for capabilities such as badging and app shortcuts."

## Desktop

Chrome and Edge install on Windows, macOS, Linux and ChromeOS, with an install badge in the address bar. Only `standalone` and `minimal-ui` are supported there. MDN: Safari 17+ on macOS has *File → Add to Dock*; Firefox desktop does not install PWAs.

## Stores (web.dev)

Google Play accepts a PWA through a Trusted Web Activity; the Apple App Store through WKWebView and App-Bound Domains; the Microsoft Store through APPX packages. Not in v1 scope (docs/02).
