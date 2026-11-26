# Apple HIG: Color and Typography

Sources (retrieved 2026-11-26):
- Color: https://developer.apple.com/design/human-interface-guidelines/color
- Typography: https://developer.apple.com/design/human-interface-guidelines/typography
- Accessibility: https://developer.apple.com/design/human-interface-guidelines/accessibility

## Color (quoted)

- "Avoid using the same color to mean different things. Use color consistently throughout your interface, especially when you use it to help communicate information like status".
- "Make sure all your app's colors work well in light, dark, and increased contrast contexts. … If you define a custom color, make sure to supply light and dark variants, and an increased contrast option for each variant". "Even if your app ships in a single appearance mode, provide both light and dark colors to support Liquid Glass adaptivity".
- "Test your app's color scheme under a variety of lighting conditions. In bright surroundings, colors look darker and more muted." This matters for a beach app used in full sun.
- "Avoid relying solely on color to differentiate between objects, indicate interactivity, or communicate essential information."

## Contrast (Accessibility page, quoted table; WCAG AA values used by Apple's Accessibility Inspector)

| Text size | Weight | Minimum ratio |
|---|---|---|
| Up to 17 pt | All | 4.5:1 |
| 18 pt | All | 3:1 |
| All | Bold | 3:1 |

"check the minimum contrast in both light and dark appearances." People with colour blindness struggle with "red-green and blue-orange" pairings, so use shapes and icons as well as colour.

## Typography (iOS defaults at the Large text size)

| Style | Weight | Size / Leading (pt) |
|---|---|---|
| Large Title | Regular | 34 / 41 |
| Title 1 | Regular | 28 / 34 |
| Title 2 | Regular | 22 / 28 |
| Title 3 | Regular | 20 / 25 |
| Headline | Semibold | 17 / 22 |
| **Body** | Regular | **17 / 22** |
| Callout | Regular | 16 / 21 |
| Subhead | Regular | 15 / 20 |
| Footnote | Regular | 13 / 18 |
| Caption 1 | Regular | 12 / 16 |
| Caption 2 | Regular | 11 / 13 |

- iOS default text size is **17 pt; the minimum is 11 pt**.
- "Avoid light font weights (such as Ultralight, Thin, and Light), especially for small text".
- Support Dynamic Type: layouts adapt to all sizes, stack side-by-side views at large sizes, keep truncation to a minimum, and scale meaningful icons with the text.

**Web mapping:** 1 pt ≈ 1 CSS px on iOS Safari. Set `html { font-size: 100% }` and size text in `rem` (Body = 1.0625rem ≈ 17px). Use the `-apple-system, system-ui` stack (SF Pro on Apple devices, Roboto on Android).

Typography and contrast checks are in `../examples/02-token-contrast.ts`.
