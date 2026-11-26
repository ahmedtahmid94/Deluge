---
name: translucent-contrast
description: "How to measure and guarantee readable contrast for text and controls on Liquid Glass translucent surfaces. Use when reviewing or tuning glass materials."
user-invocable: false
metadata:
  roster-title: "Contrast on translucent surfaces"
  owner: accessibility-specialist
  shared-with: [ui-designer-apple-liquid-glass]
---
# Contrast on translucent surfaces

The problem: on glass, the effective background behind text changes with whatever is underneath it, so one contrast number isn't enough.

Method:
1. List the backgrounds each glass surface can sit over: the gradient's lightest and darkest stops, photos, verdict tints, and dark mode.
2. Composite the surface's fill colour and opacity over the **lightest** and the **darkest** background, ignoring blur (blur averages colours; the worst case is a flat extreme).
3. Measure the text colour against both composites. Both must reach 4.5:1 (body) or 3:1 (large text, icons, borders).
4. If not, raise the fill opacity, darken or lighten the tint, add a subtle scrim under the text, or move the text to an opaque card.
5. Re-check with `prefers-contrast: more` (higher opacity) and `prefers-reduced-transparency` (solid).

Rules:
- Body text never sits on thin glass over a photo. Glass carries short labels and controls; long text goes on opaque cards.
- Record each surface's worst-case ratios in the design tokens doc.
- Automated tools (axe) can't see through blur reliably. Manual measurement on screenshots of worst-case states is required.
