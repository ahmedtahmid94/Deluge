---
name: real-device-testing
description: "Testing Beach Day on a real iPhone and a real Android phone: install, standalone mode, offline and updates. Use before releases that touch the PWA shell, install or UI."
user-invocable: false
metadata:
  roster-title: "Real-device testing"
  owner: qa-engineer
  shared-with: [pwa-engineer, accessibility-specialist]
---
# Real-device testing

Devices: a recent iPhone (current iOS, Safari) and a recent Android phone (Chrome with Google services).

Checklist:
- **Install:**
  - iOS: Share → Add to Home Screen; check the icon, name and splash;
  - Android: the in-app Install button → the WebAPK in the app drawer.
- **Standalone mode:** no browser chrome; back navigation works; safe areas are respected (notch, home indicator); orientation is portrait.
- **Offline:** open once, enable airplane mode, relaunch → the cached forecast with its age; the console says it needs a connection.
- **Update:** approve a harmless change in the console → wait for the deploy → reopen → the update toast → reload → the new version.
- **Performance:** first load on cellular feels quick (record LCP from remote debugging if possible).
- **Accessibility spot-check:** VoiceOver and TalkBack read the verdict; the largest text size doesn't break the layout.
- **Theme:** light and dark; reduced motion; reduced transparency (iOS) shows solid surfaces.

Record the device, OS and browser versions and the results in the release handoff.
