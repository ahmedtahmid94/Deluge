# Modal dialog pattern (the Approve confirmation)

Source: W3C WAI-ARIA Authoring Practices, *Dialog (Modal) Pattern*: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ (retrieved 2026-11-26)

## Keyboard (quoted)

- "When a dialog opens, focus moves to an element inside the dialog."
- **Tab** "Moves focus to the next tabbable element inside the dialog". From the last element it wraps to the first. **Shift+Tab** wraps in reverse.
- **Escape**: "Closes the dialog."

## Initial focus (quoted)

- "Generally, focus is initially set on the first focusable element."
- "**If a dialog contains the final step in a process that is not easily reversible, such as deleting data or completing a financial transaction, it may be advisable to set focus on the least destructive action**". The Alert Dialog pattern is often used for this.

For Beach Day's "Commit 2 files to main and redeploy?" dialog, initial focus goes to **Cancel**, not "Approve and commit".

## Closing (quoted)

"When a dialog closes, focus returns to the element that invoked the dialog unless … The invoking element no longer exists."

## Roles and properties (quoted)

- The container has role `dialog`, or `alertdialog` for the confirmation, and `aria-modal="true"`.
- Label it with `aria-labelledby` pointing at a visible title, or with `aria-label`.
- `aria-describedby` points at the message, so screen readers announce it on open. Use it when the description is simple.

A native `<dialog>` opened with `showModal()` provides the modality, the Escape handling and the inert background. We add the initial-focus and focus-return behaviour and test them (`../examples/02-axe-and-dialog.mjs`).
