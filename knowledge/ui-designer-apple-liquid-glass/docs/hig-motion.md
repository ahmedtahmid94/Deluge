# Apple HIG: Motion (and Reduce Motion)

Sources (retrieved 2026-11-26):
- Motion: https://developer.apple.com/design/human-interface-guidelines/motion
- Accessibility: https://developer.apple.com/design/human-interface-guidelines/accessibility

## Motion (quoted)

- "Add motion purposefully, supporting the experience without overshadowing it. Don't add motion for the sake of adding motion."
- "Make motion optional. … avoid using it as the only way to communicate important information."
- "Aim for brevity and precision in feedback animations."
- "In apps, generally avoid adding motion to UI interactions that occur frequently."
- "Let people cancel motion. As much as possible, don't make people wait for an animation to complete".

## Reduce Motion (quoted, Accessibility page)

When Reduce Motion is on, reduce "automatic and repetitive animations, including zooming, scaling, and peripheral motion":
- "Tightening animation springs to reduce bounce effects"
- "Avoiding animating depth changes in z-axis layers"
- "Replacing transitions in x-, y-, and z-axes with fades to avoid motion"
- "**Avoiding animating into and out of blurs**"

The last point matters for glass: never animate `backdrop-filter`, and under `prefers-reduced-motion: reduce` swap sheet slides for cross-fades.
