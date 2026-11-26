# Apple HIG: tab bars, sheets and alerts

Sources (retrieved 2026-11-26):
- Tab bars: https://developer.apple.com/design/human-interface-guidelines/tab-bars
- Sheets: https://developer.apple.com/design/human-interface-guidelines/sheets
- Alerts: https://developer.apple.com/design/human-interface-guidelines/alerts

## Tab bars (quoted)

- "Use a tab bar to support navigation, not to provide actions."
- "Make sure the tab bar is visible when people navigate to different sections of your app."
- "it's generally easier to navigate among fewer tabs."
- "Include tab labels … Use single words whenever possible."
- "Use a badge to indicate that critical information is available. … Reserve badges for critical information".
- "A tab bar floats above content at the bottom of the screen. Its items rest on a Liquid Glass background".

**Beach Day:** three tabs: **Today**, **Beaches**, **Settings**. The Console is reached from Settings only when signed in, never as a tab.

## Sheets (quoted)

- "Display only one sheet at a time from the main interface." Close the first sheet before showing another.
- "If you provide a Done button, always pair it with a Cancel button".
- Detents: "Sheets automatically support the large detent. Adding the medium detent allows the sheet to rest at both heights". On iPhone, "consider supporting the medium detent to allow progressive disclosure".
- "Include a grabber in a resizable sheet … a grabber also works with VoiceOver".
- "Support swiping to dismiss a sheet. … If people have unsaved changes … use an action sheet to let them confirm their action."

**Beach Day:** the beach picker is a sheet with medium and large detents and a grabber; it can be swiped down to dismiss.

## Alerts (quoted)

- "Use alerts sparingly." "Avoid using an alert merely to provide information."
- "Avoid displaying alerts for common, undoable actions … when people take an uncommon destructive action that they can't undo, it's important to display an alert". **Approve commits to the live site, so it gets an alert.**
- "Avoid showing an alert when your app starts." Offline at launch is shown inline, not as an alert.
- Title: "clearly and succinctly describes the situation … avoid writing a title that doesn't convey useful information — like 'Error'". Keep it to two lines at most.
- Buttons: "Aim for a one- or two-word title that describes the result of selecting the button. Prefer verbs". "Always use 'Cancel' to title a button that cancels the alert's action." "Avoid using OK as the default button title unless the alert is purely informational."
- Placement: the likely choice goes on the trailing side; Cancel on the leading side.
- "you don't want to make a Cancel button the default button. If you want to encourage people to read an alert and not just automatically press Return to dismiss it, avoid making any button the default button."
- Destructive style applies to "a destructive action people didn't deliberately choose". The lead deliberately tapped Approve, so the confirm button doesn't need the destructive style.

**Reconciled with W3C APG:**
- keyboard focus starts on **Cancel** (APG: the least destructive action);
- **no button is the Return-key default** (HIG);
- the Commit button sits on the trailing side.
