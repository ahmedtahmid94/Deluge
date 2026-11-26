# Example: route a handoff (experts never call each other)

The pwa-engineer returns:

```
## Handoff
status: needs-review
summary: Today screen built with verdict block, day strip and safety strip; offline state uses cached forecast.
files: src/app/today.ts, src/app/styles/today.css, tests/e2e/today.spec.ts
decisions: day strip is a list of buttons, not tabs, so arrow keys aren't needed.
tests: vitest 42 passed; playwright today.spec.ts 6 passed (iPhone 15, Pixel 7)
open-questions: should "less certain" days hide the window entirely or show "morning/afternoon"?
next: accessibility-specialist: review today.ts + today.css (contrast on header glass, focus order, day button names); security-engineer: confirm no new external fetches
human-apply: none
```

What the orchestrator does:

1. **Reviews, in parallel:** accessibility-specialist and security-engineer (the `next:` line), plus qa-engineer and ui-designer-apple-liquid-glass from the roster's section 3 table. Each brief includes the file list and the summary, because the reviewers don't see this conversation.
2. **Open question:** forecast display belongs to Wren (ux-designer-apple-hig), and confidence labels to the beach-conditions analyst. Send the question to both in one batch. If they disagree, put both positions to the lead in one line each.
3. **Merge the reviews** (`review-aggregation`). For example, accessibility says "changes-required: header text 4.2:1 over deep-sea background" and security says "approve". The result is changes-required, so return the merged findings to the pwa-engineer, then re-review only the changed lines by **resuming** the same reviewers.
4. **Report to the lead** once everything is approved, with the files, verdicts, tests and anything to apply by hand.
