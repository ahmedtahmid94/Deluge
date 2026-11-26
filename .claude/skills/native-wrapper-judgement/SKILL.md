---
name: native-wrapper-judgement
description: "Decide when a need goes beyond what the Beach Day PWA can do and would require a native wrapper such as Capacitor. Use when a feature request involves widgets, background work, store listing or native APIs."
user-invocable: false
metadata:
  roster-title: "Native-wrapper judgement (Capacitor)"
  owner: pwa-engineer
  shared-with: [software-architect]
---
# Native-wrapper judgement

Decision: Beach Day v1 is a PWA, with no Capacitor (docs/02).

Flag a native need to the orchestrator when a request needs:
- an App Store or Play Store listing for discoverability;
- reliable scheduled local notifications or background refresh on iOS;
- home-screen widgets, Live Activities or watch apps;
- background location or geofencing;
- in-app purchases or subscriptions through the stores.

Commercial use would also need a paid Open-Meteo plan.

Before flagging, check for a web alternative:
- Web Push from iOS 16.4 for home-screen apps;
- the Badging API;
- a Trusted Web Activity for a Play Store listing on Android only.

If native is needed, write a one-page brief (need, options, cost, effect on Netlify deploys) for software-architect and the lead. Keep platform checks in `src/shared/platform.ts` so a later wrapper stays cheap.
