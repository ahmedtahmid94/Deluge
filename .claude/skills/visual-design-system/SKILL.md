---
name: visual-design-system
description: "Beach Day's design tokens and visual system: colour (light and dark), type ramp, spacing, radii, materials and verdict styling. Use when defining or applying visual styles."
user-invocable: false
metadata:
  roster-title: "Visual design system"
  owner: ui-designer-apple-liquid-glass
  shared-with: [pwa-engineer, accessibility-specialist]
---
# Visual design system

Tokens live as CSS custom properties in `src/app/styles/tokens.css`. Sable owns the values; pwa-engineer implements them.

- **Colour** (light and dark sets):
  - background gradient (dawn sand → sea blue);
  - surfaces (glass-thin, glass-regular, card-opaque);
  - text (primary, secondary, on-glass);
  - accent (sea blue);
  - verdict colours (Great, Good, Fair, Poor, No-go);
  - focus ring.
- **Verdict styling:** colour **plus** a text label, an icon and the score number. Text colour on each verdict colour passes 4.5:1, and icons and borders pass 3:1, in both themes. Check with colour-blindness simulation that Great, Fair and No-go stay distinct.
- **Type ramp:** large title, title, headline, body, callout, caption, in `rem` from a 16 px base. System font stack.
- **Spacing:** a 4 px base scale (4, 8, 12, 16, 24, 32, 48). **Radii:** 12, 20, 28, and capsule.
- **Materials:** blur and tint values per surface, with reduced-transparency equivalents (solid).
- **Iconography:** one consistent outline set (open-licensed), 24 px grid, with text labels next to critical icons.
- Document each token with its purpose. Changes go through accessibility-specialist for contrast.
