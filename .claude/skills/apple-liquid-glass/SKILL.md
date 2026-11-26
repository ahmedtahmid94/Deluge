---
name: apple-liquid-glass
description: "Apple's Liquid Glass design language adapted for the Beach Day web app: translucent layered materials, depth, light and motion, with accessible fallbacks. Use when designing or implementing visual surfaces."
user-invocable: false
metadata:
  roster-title: "Apple Liquid Glass visual language"
  owner: ui-designer-apple-liquid-glass
  shared-with: [pwa-engineer]
---
# Apple Liquid Glass for the web

Liquid Glass is Apple's translucent, layered material style (introduced across Apple platforms in 2025).

Principles for Beach Day:
- **Content first.** The forecast (verdict, window, reasons) sits on the clearest layer. Glass is for chrome: the header, tab bar, beach picker sheet and floating controls. Don't put body text on heavy blur over busy imagery.
- **Layers and depth.** Three levels:
  1. background (sky and sea gradient, or a subtle photo);
  2. glass controls;
  3. content cards on a more opaque material.

  Depth comes from translucency, soft shadows and a thin light edge (a 1 px inner highlight), not from heavy drop shadows.
- **Light.** Surfaces pick up colour from behind them (`backdrop-filter: blur(20px) saturate(160%)` plus a tinted semi-opaque fill). Tint shifts slightly with the verdict: warm sun for Great, grey-blue for storms.
- **Shape.** Generous continuous-corner radii (cards about 20–24 px, controls as capsules), concentric with the corners of their container.
- **Motion.** Fluid, spring-like transitions that morph controls into sheets. Short (200–350 ms), and **off with `prefers-reduced-motion`**.

Web realities:
- `backdrop-filter` needs a `-webkit-` prefix on Safari and is costly; limit blurred layers.
- **Always** provide solid fallbacks for `prefers-reduced-transparency`, `prefers-contrast: more` and browsers without `backdrop-filter` support.
- Text over glass must meet WCAG contrast (4.5:1) against the **worst-case** background. Raise fill opacity until it does (see the `translucent-contrast` skill).
- Use Apple-like system fonts (`-apple-system, system-ui`). Do not copy Apple's icons, SF Symbols artwork or trademarks; use our own or open-licensed icons.
