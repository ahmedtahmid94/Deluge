# Web app manifest

Sources:
- MDN, *Web application manifest*: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest
- web.dev, *Learn PWA: Web app manifest*: https://web.dev/learn/pwa/web-app-manifest

Both retrieved 2026-11-26.

## Linking and file type (MDN)

- `<link rel="manifest" href="/app.webmanifest" />`
- `.webmanifest` is served as `application/manifest+json`; `.json` as `application/json` also works.

## Core fields (web.dev, quoted)

| Field | web.dev says |
|---|---|
| `name` | "Full name of your PWA. It will appear along with the icon in the operating system's home screen, launcher, dock, or menu." |
| `short_name` | "Keep it under 12 characters to minimize the possibility of truncation." |
| `icons` | "Array of icon objects with src, type, sizes, and optional purpose fields" |
| `start_url` | "An absolute path is recommended" |
| `id` | "A string that uniquely identifies this PWA against others that may be hosted on the same origin." |
| `theme_color` | Can colour the title bar or status bar. "This color can be overridden by the HTML theme-color `<meta>` element." |
| `background_color` | The placeholder colour before CSS loads. "Safari on iOS and iPadOS and most desktop browsers currently ignore this field." |
| `scope` | Limits what displays inside the app window. "This will not, however, change the scope of your service worker." |

## Icons (web.dev, quoted)

- "If you need to pick only one icon size, it should be 512 by 512 pixels. However, providing more sizes is recommended including 192 by 192, 384 by 384, and 1024 by 1024."
- **Maskable:** "a square image file that has its main icon contained within a 'safe zone', a circle centered in the icon with a radius of 40 percent of the width of the icon." "Maskable icons should be 512 by 512 at least." You may use `"purpose": "any maskable"`, but we ship separate files so the `any` icon isn't cropped.

## Splash screens

- Android builds the splash screen from `theme_color`, `background_color` and an icon.
- "Safari on iOS and iPadOS … doesn't use the web app manifest to generate splash screens." It uses proprietary `<link>` images instead. We accept the default on iOS for v1.

## Updates (web.dev, *Update*: https://web.dev/learn/pwa/update)

- Chrome on Android with WebAPK checks the manifest for updates. Updates apply within 24 h on Wi-Fi after re-minting, and only if the user opens the app.
- "If the server doesn't respond with the manifest file (there is a 404 error), Chrome won't check for updates for a minimum of 30 days."
- On other platforms (iOS, shortcuts), the only way to get new manifest metadata is to reinstall. **Choose the name and icons carefully before launch.**
