# Apple HIG: writing and layout

Sources (retrieved 2026-11-26):
- Writing: https://developer.apple.com/design/human-interface-guidelines/writing
- Layout: https://developer.apple.com/design/human-interface-guidelines/layout
- Accessibility: https://developer.apple.com/design/human-interface-guidelines/accessibility

## Writing (quoted)

- "Determine your app's voice." "Match your tone to the context." The docs contrast a serious Fall Detection message with a light Activity message. For Beach Day, safety text is serious and verdicts are friendly.
- "Be clear. … If you can use fewer words, do so."
- "Write for everyone … avoiding jargon and gendered terminology."
- "Consider each screen's purpose … put the most important information first."
- "Be action oriented. … When labeling buttons and links, it's almost always best to use a verb. … just saying 'Send' often works better than 'Let's do it!' For links, avoid using 'Click here'".
- Capitalisation: "Choose a style for each UI element type and use it consistently". We use **sentence case** everywhere. Note that the Alerts page recommends title-style button titles; we choose sentence case consistently and record that choice here.
- "Avoid using we altogether … 'We're having trouble loading this content.' Something like 'Unable to load content' is much clearer."
- "Don't say 'click' for a touch device like iPhone or iPad where you mean 'tap.'"
- "Provide clear next steps on any blank screens."
- Errors: display them "as close to the problem as possible, avoid blame, and be clear about what someone can do to fix it." "Interjections like 'oops!' or 'uh-oh' are typically unnecessary and can sound insincere."

## Layout (quoted)

- "Order content by relative importance … place the most important items near the top". The verdict comes first.
- "Group related items". "Use progressive disclosure to make layouts cleaner".
- "Differentiate controls from content. Take advantage of the Liquid Glass material … to provide a distinct appearance for your controls."
- "Support Dynamic Type by adjusting your layout to accommodate text at larger sizes. For example, horizontally adjacent views may need to stack vertically".
- "Respecting the safe area is essential to make sure system UI and hardware features like the Dynamic Island don't obstruct content and controls."

## Control size (Accessibility page, quoted)

| Platform | Default control size | Minimum |
|---|---|---|
| iOS, iPadOS | **44×44 pt** | 28×28 pt |

Beach Day uses 44×44 for all primary controls. The WCAG 2.2 AA floor is 24×24 CSS px.

"For interactions people do frequently … use the simplest gesture possible". Every gesture, such as swiping the day strip, has a tap alternative.
