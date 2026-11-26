---
name: pure-domain-modules
description: "Keep Beach Day's core logic (scoring, path allow-list, model mapping, agent-file parsing) in pure, I/O-free modules. Use when writing domain logic."
user-invocable: false
metadata:
  roster-title: "Pure, testable domain modules"
  owner: software-architect
  shared-with: [beach-conditions-analyst, qa-engineer, security-engineer]
---
# Pure, testable domain modules

- Domain logic is a pure function of its inputs: no `fetch`, no Blobs, no `Date.now()`, no env reads inside it. Pass the clock and config in as arguments.
- Core modules:
  - `scoring.ts`: `scoreHour`, `scoreDay`, `bestWindow`.
  - `allowlist.ts`: `validateProposalFiles`.
  - `models.ts`: alias → model ID.
  - `agents-parse.ts`: frontmatter → metadata.
- The same module runs in a function and in the browser. Don't import Node-only or DOM-only APIs into it.
- Inputs and outputs are plain JSON-serialisable data, so fixture tests stay simple.
- Every branch has a unit test. Security-critical modules (the allow-list) get table-driven tests of hostile input (docs/05).
- Keep I/O in thin adapters at the edges (function handlers, UI components) that call the pure core.
