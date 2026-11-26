---
name: aria-patterns-live-regions
description: "ARIA patterns for Beach Day and Agent Console widgets: combobox, dialog, tabs, chat log, and live announcements for status and streaming. Use when building interactive widgets or dynamic updates."
user-invocable: false
metadata:
  roster-title: "ARIA patterns and live regions"
  owner: accessibility-specialist
  shared-with: [agent-console-engineer, pwa-engineer]
---
# ARIA patterns and live regions

Prefer native elements. Use ARIA only where native elements fall short, following the WAI-ARIA Authoring Practices (APG).

- **Beach picker:** a native `<select>`, or an APG **combobox** (`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, a listbox of options). Announce the result count politely ("3 beaches found").
- **Day strip:** a list of `<button>`s (or the APG tabs pattern if it switches a panel), each with a full accessible name: "Saturday, Good, score 72, best 9 am to 1 pm".
- **Sheets and dialogs:** native `<dialog>` with `showModal()`, or the APG modal: focus moves in, is trapped, Esc closes, focus returns to the trigger. Give it a labelled title.
- **Toasts:** `role="status"` (polite). They don't steal focus and stay up long enough to read, or until dismissed.
- **Chat thread:** `role="log"` with `aria-live="polite"`. **Don't announce each streamed token.** Announce "Agent is responding…" once, then the final message, or a summary of it, when done.
- **Job status and errors:** a polite live region for progress; `role="alert"` only for errors that block the user.
- **Charts:** `role="img"` with an `aria-label` summary, plus a data table alternative.
- **Diffs:** visually hidden "added" and "removed" text on lines; files as headings for quick navigation.
