---
name: apple-hig
description: "Apple Human Interface Guidelines applied to the Beach Day PWA: navigation, controls, layout, typography and platform conventions. Use when designing flows, screens or controls."
user-invocable: false
metadata:
  roster-title: "Apple Human Interface Guidelines"
  owner: ux-designer-apple-hig
  shared-with: [ui-designer-apple-liquid-glass, accessibility-specialist]
---
# Apple HIG for Beach Day

Apply the HIG's principles (clarity, deference to content, consistency) in a web app that feels at home on iPhone and still works on Android.

- **Navigation:**
  - a flat structure: Today (selected beach) → Day detail; Beaches (picker); Settings; Console (hidden unless signed in);
  - a bottom tab bar or a single primary view with a beach-switcher sheet;
  - back always visible in standalone mode (there are no browser controls).
- **Controls:**
  - tap targets at least **44×44 pt** (the HIG), above the WCAG 2.2 minimum of 24 px;
  - standard-looking buttons, segmented controls for units, sheets for pickers and confirmations;
  - destructive actions styled and labelled as such.
- **Layout:** respect safe areas; readable line lengths; most important information at the top (the verdict); progressive disclosure for hourly detail.
- **Typography:**
  - a clear hierarchy (large title for the verdict, headline, body, caption);
  - support text scaling with `rem`-based sizes;
  - never encode meaning in weight or colour alone.
- **Feedback:** immediate visual response to taps; inline status rather than modal alerts; alerts only for decisions (Approve commit).
- **Platform conventions:** pull-to-refresh on forecast lists; swipe-down to dismiss sheets; system share for "Share this beach day".
- On Android, keep the same structure. Don't fake iOS-only gestures where Android users expect the back button to work.
