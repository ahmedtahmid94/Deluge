# Accessibility specialist examples

| File | What it shows | How to check |
|---|---|---|
| `01-contrast-on-glass.ts` | The WCAG contrast formula, alpha compositing, worst-case backgrounds, and the minimum glass opacity | `node --experimental-strip-types 01-contrast-on-glass.ts` |
| `page.html` + `02-axe-and-dialog.mjs` | An axe scan with the `wcag22aa` tags, a 2.4.11 focus-not-obscured check (sticky header and fixed toast), and the APG dialog focus rules | `node 02-axe-and-dialog.mjs` (needs `@axe-core/playwright`) |

Verified 2026-11-26:
- the minimum white glass opacity for body text over the sea gradient is **0.39** (35 % fails at 4.20:1);
- axe passed 21 rules with 0 violations;
- the dialog focus rules hold.

**Bug the check caught:** `scroll-padding` alone did not stop the last buttons hiding under the fixed toast at the end of the page. The fix was bottom padding equal to the toast height, now in `page.html`.
