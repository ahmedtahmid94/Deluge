---
name: ios-android-install
description: "How installing the Beach Day PWA works on iPhone and Android, and the install UI for each. Use when building install prompts or debugging installed-mode issues."
user-invocable: false
metadata:
  roster-title: "iOS and Android install behaviour"
  owner: pwa-engineer
  shared-with: [ux-designer-apple-hig, qa-engineer]
---
# iOS and Android install behaviour

**Android (MDN):**
- Chrome with Google Mobile Services and Samsung Internet install a real **WebAPK**.
- Other browsers add a browser-badged shortcut.
- `beforeinstallprompt` fires when the app is installable. Call `preventDefault()`, keep the event, show our own "Install Beach Day" button, and call `prompt()` on tap.

**iPhone/iPad (MDN):**
- **No `beforeinstallprompt`.** Install is manual: Share → Add to Home Screen.
- From iOS 16.4 that works in Safari, Chrome, Edge, Firefox and Orion; before 16.4, Safari only.
- Show a small, dismissible hint with the Share icon, only when not already installed. Detect installed mode with `matchMedia('(display-mode: standalone)').matches || navigator.standalone`. Remember the dismissal in `localStorage`.
- Web Push works only for home-screen apps from 16.4. It is v2 scope.
- Treat storage as evictable: cache only what can be re-downloaded.

**Both:**
- Standalone mode has no browser chrome. Provide in-app back navigation and a refresh affordance (pull-to-refresh or a button).
- Respect safe areas.
- Test on real devices: install, launch offline, update after a redeploy.
