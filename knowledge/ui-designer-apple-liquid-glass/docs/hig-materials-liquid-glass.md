# Apple HIG: Materials and Liquid Glass

Source: Apple Human Interface Guidelines, *Materials*: https://developer.apple.com/design/human-interface-guidelines/materials (retrieved 2026-11-26)

## What Liquid Glass is (quoted)

- "Liquid Glass is a dynamic material that unifies the design language across Apple platforms, allowing you to present controls and navigation without obscuring underlying content."
- "Liquid Glass forms a distinct functional layer for controls and navigation elements — like tab bars and sidebars — that floats above the content layer".

## Where to use it (quoted)

- "**Don't use Liquid Glass in the content layer.** … including it in the content layer can result in unnecessary complexity and a confusing visual hierarchy. Instead, use standard materials for elements in the content layer, such as app backgrounds." The exception is transient controls such as sliders and toggles while they are active.
- **Regular variant:** "blurs and adjusts the luminosity of background content to maintain legibility". Use it "when components have a significant amount of text, such as alerts, sidebars, or popovers."
- **Clear variant:** "highly translucent". Use it only "for components that appear over visually rich backgrounds" such as photos and video.
- Dimming: "If the underlying content is bright, consider adding a dark dimming layer of 35% opacity."
- The variants adapt when people "reduce transparency or increase contrast".

## Standard materials (content layer)

- iOS has four: **ultra-thin, thin, regular (default) and thick**. Each is progressively more opaque and muted.
- Use **vibrant** label colours on materials. "avoid using quaternary on top of the thin and ultraThin materials, because the contrast is too low."

## Beach Day translation (web)

| HIG concept | Beach Day |
|---|---|
| Liquid Glass (controls, navigation) | Header, tab bar, beach-picker sheet chrome, floating buttons: `backdrop-filter: blur() saturate()` plus a tinted fill |
| Standard materials (content) | Verdict card, day cards, hourly rows: more opaque surfaces, effectively "thick" |
| Regular vs clear | Regular everywhere that has text. Clear only over the hero photo, with a 35% dark dim when the photo is bright |
| Reduce Transparency / Increase Contrast | `@media (prefers-reduced-transparency: reduce)` and `(prefers-contrast: more)`: solid fills |

Web tokens with fallbacks are verified in `../examples/01-glass-tokens/`.
