---
name: restrained-motion
description: "Animation and motion for Beach Day that adds meaning without harming accessibility or performance. Use when adding transitions or animated effects."
user-invocable: false
metadata:
  roster-title: "Motion with restraint"
  owner: ui-designer-apple-liquid-glass
  shared-with: [accessibility-specialist]
---
# Motion with restraint

- Use motion for **meaning only**: a sheet rising from the control that opened it, a day card expanding into its detail, the verdict changing when the beach changes.
- Durations 150–350 ms with spring-like or ease-out curves. No looping ambient animation, such as waves, on content surfaces.
- `prefers-reduced-motion: reduce`: replace movement with cross-fades or instant changes. Never disable state changes themselves.
- `prefers-reduced-transparency`: no animated blur; use solid surfaces.
- Never flash more than 3 times a second (WCAG 2.3.1). Avoid parallax and large-scale zoom (vestibular triggers).
- Animate only `transform` and `opacity`. Never animate `backdrop-filter`, layout properties or box-shadow at large sizes.
- Loading uses calm skeleton shimmers, which stop under reduced motion.
