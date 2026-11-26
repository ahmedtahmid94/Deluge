---
name: mobile-web-performance
description: "Keep Beach Day fast on mid-range phones and slow networks. Use when adding features, assets or dependencies."
user-invocable: false
metadata:
  roster-title: "Mobile web performance"
  owner: pwa-engineer
  shared-with: [software-architect, qa-engineer]
---
# Mobile web performance

Budgets (initial Beach Day view, mid-range phone, slow 4G):
- JS under 100 KB gzipped.
- CSS under 30 KB.
- Largest Contentful Paint under 2.5 s.
- Interaction to Next Paint under 200 ms.
- Cumulative Layout Shift under 0.1.

Practices:
- Code-split `/console`.
- No large libraries for small jobs (dates, charts). Prefer `Intl` and SVG.
- `backdrop-filter` is costly. Limit blur layers on screen, avoid animating blur, and fall back to solid surfaces on low-end devices or with reduced transparency.
- Images as compressed WebP/AVIF with explicit `width`/`height`. Icons as inline SVG sprites.
- Precache the shell so repeat visits render instantly.
- Measure with Lighthouse performance audits and Chrome DevTools throttling. Record the numbers in the release handoff.
