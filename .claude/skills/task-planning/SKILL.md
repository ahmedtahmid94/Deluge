---
name: task-planning
description: "Break a Beach Day goal into small, ordered, assignable tasks with clear done-criteria. Use when planning a feature, a fix or a release."
user-invocable: false
metadata:
  roster-title: "Task breakdown and planning"
  owner: orchestrator
  shared-with: [software-architect, meta-agent]
---
# Task breakdown and planning

- Restate the goal in one sentence and name the lead decision(s) it touches (D1–D4 in `docs/README.md`).
- Split work into tasks a single expert can finish and hand back in one pass: one area, one owner, a concrete output (files, a spec, a review).
- For each task write: **owner**, **inputs** (docs, files, earlier outputs), **output**, **done when** (tests, review, criteria), **depends on**.
- Order by dependency. Put contracts first (types, API shapes, design tokens), then implementations, then tests and reviews.
- Mark tasks with no dependency on each other as a **parallel batch**.
- Prefer thin vertical slices (one beach, today only, end to end) over building every layer at once.
- Keep a visible plan (TodoWrite) and update it as handoffs come back.
- Anything that changes `netlify/**`, `netlify.toml`, package manifests, `scripts/**` or `.github/**` is a **human-applied** task: the expert drafts it, the lead applies it.
