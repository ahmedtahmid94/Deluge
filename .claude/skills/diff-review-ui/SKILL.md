---
name: diff-review-ui
description: "The Agent Console's proposal review screen: per-file diffs, accessibility, warnings and the Approve/Reject confirmation. Use when building or changing proposal review."
user-invocable: false
metadata:
  roster-title: "Diff and review UI"
  owner: agent-console-engineer
  shared-with: [ux-designer-apple-hig, accessibility-specialist]
---
# Diff and review UI

- Fetch the current file through `read_file` and compute the diff in the browser with a small line-diff (Myers) implementation. Show unified view on phones; offer split view on wide screens.
- Header: the agent name, the summary, the base commit, and a file list with create/update/delete badges and line counts.
- **Show every line.** Long files are collapsed by hunk but can be expanded; never truncated silently.
- Highlight risk:
  - a banner on changes to `.claude/agents/**` ("This changes an agent's instructions");
  - a banner on added URLs or `fetch(`;
  - a banner on anything that looks like handling secrets.
- Accessibility:
  - added and removed lines carry `+`/`−` plus visually hidden "added"/"removed";
  - each file is a heading;
  - keyboard jumps between files and hunks;
  - colours meet 3:1 and aren't the only signal.
- Approve: a confirmation dialog ("Commit 2 files to main and redeploy the live site?"). The button is disabled while committing, then shows the result (commit SHA link, "Deploying…").
- Reject: optional reason; status becomes `rejected`.
- Stale proposal: explain, and offer "Ask the agent to update it".
