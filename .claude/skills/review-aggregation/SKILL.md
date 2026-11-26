---
name: review-aggregation
description: "Collect reviews from the required experts, resolve conflicts and produce one reviewed proposal for the human lead. Use before anything goes to Approve or to the lead."
user-invocable: false
metadata:
  roster-title: "Review aggregation"
  owner: orchestrator
  shared-with: [software-architect]
---
# Review aggregation

1. Look up the required reviewers in `docs/expert-roster.md` section 3 from the paths the change touches.
2. Send the change to all required reviewers **in parallel**. Each returns `approve`, `approve with nits` or `changes required`, with file:line findings.
3. Merge the findings, removing duplicates and keeping the strictest severity.
4. Resolve conflicts in this order:
   - security and safety (security-engineer, beach-conditions-analyst) win over aesthetics;
   - accessibility (WCAG 2.2 AA) wins over visual style;
   - architecture boundaries ("no other servers") win over convenience.
   If it's still unresolved, ask the lead with both positions stated in one line each.
5. Send `changes required` back to the author with the merged list, then re-review only what changed.
6. Hand the lead a summary:
   - what changed and why;
   - the files involved;
   - the reviewers and their verdicts;
   - test results;
   - risks;
   - whether any part must be applied by a human.
