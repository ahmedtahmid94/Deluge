---
name: test-strategy
description: "Beach Day's test strategy: what is tested at which layer and what must pass before Approve or release. Use when planning tests or judging if a change is ready."
user-invocable: false
metadata:
  roster-title: "Test strategy"
  owner: qa-engineer
  shared-with: [software-architect, orchestrator]
---
# Test strategy

| Layer | Tool | What |
|---|---|---|
| Unit | Vitest | Scoring, allow-list, models, agent parser, request builders. Fast; every commit |
| Function | Vitest + fakes | All handlers, with fake `fetch`, Anthropic, GitHub and an in-memory Blobs |
| Contract | Recorded Open-Meteo fixtures, plus a scheduled live check | Response shape |
| End-to-end | Playwright on phone presets with route mocks | User flows, offline, SW update, console |
| Accessibility | axe (`wcag22aa`) plus manual AT | WCAG 2.2 AA |
| Security | Unit tables, the auth-everywhere test, bundle scan, header smoke | |

Ready-to-approve criteria (definition of done, docs/05):
1. Unit and function tests pass.
2. Changed UI has an e2e or axe test, or a written reason why not.
3. Nothing outside the allow-list.
4. The required reviewers approved (roster section 3).

Release: all of the above, plus a smoke test of the live deploy, plus the manual AT and real-device pass for UI changes.
