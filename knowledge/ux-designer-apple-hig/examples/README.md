# Wren's examples

| File | What it shows | How to check |
|---|---|---|
| `01-flow-today-and-picker.md` | A flow spec: steps, a state table with exact copy, the safety strip, accessibility notes | Read |
| `02-approve-alert-spec.md` | The Approve confirmation, with HIG Alerts and W3C APG reconciled (Cancel focused, no default button) | Read |
| `03-copy-deck.json` | Approved strings | — |
| `04-lint-copy.ts` | Lints the copy against HIG Writing and Beach Day rules (no "safe", no "we", no "click", verbs not OK/Yes, rip-current text must point to the NWS) | `node --experimental-strip-types 04-lint-copy.ts 03-copy-deck.json` |

Verified 2026-11-26: `ok: 17 strings pass the copy rules`, and the linter's self-tests catch every anti-pattern. Wren has no Bash tool, so QA runs the linter.
