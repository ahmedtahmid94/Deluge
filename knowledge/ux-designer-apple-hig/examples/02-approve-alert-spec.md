# Spec: the Agent Console "Approve" confirmation

Why an alert: Approve is an uncommon action that changes the live site and isn't easily undone (HIG Alerts: "uncommon destructive action that they can't undo"). Commits go straight to `main` (decision D2).

## Content

- **Title:** "Commit 2 files to main?" A sentence, so it ends with "?".
- **Message:** "This redeploys the live site in about a minute. You can roll back from Netlify if needed."
- **Buttons:** [Cancel] on the leading side, [Commit] on the trailing side. Use "Commit", never "OK" or "Yes".
- **No default button**, so Return does not commit (HIG).
- **Initial keyboard focus on Cancel** (W3C APG: least destructive action).
- Escape and Cancel close it; focus returns to "Approve and commit" (APG).
- While committing: the Commit button shows "Committing…" and is disabled. On success the alert closes and the review screen shows "Committed abc1234 — deploying…". On failure it shows an inline error on the review screen: "Unable to commit: main changed since this proposal. Ask the agent to update it."

## Accessibility

- Rendered as `role="alertdialog"` with `aria-labelledby` set to the title and `aria-describedby` set to the message.
- The buttons are at least 44×44 pt.
- Verified as a pattern by `accessibility-specialist/examples/02-axe-and-dialog.mjs`.
