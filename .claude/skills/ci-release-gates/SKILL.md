---
name: ci-release-gates
description: "The checks every Beach Day change must pass before approval or release, and the release sign-off. Use when defining CI checks or signing off a release."
user-invocable: false
metadata:
  roster-title: "CI and release gates"
  owner: qa-engineer
  shared-with: [netlify-engineer, security-engineer]
---
# CI and release gates

Every commit:
1. Type check (`tsc --noEmit`).
2. Vitest unit and function tests.
3. Build (`npm run build`), including agent-file validation.
4. **Bundle secret scan** of `dist/` (`sk-ant-`, `github_pat_`, `ghp_`, secret variable names). Fail on any hit.
5. Playwright e2e and axe on mocked routes.
6. Dependency audit on human pull requests that change dependencies.

Netlify runs steps 1–4 in the build command, so a failing check blocks the deploy and keeps the previous version live. CI workflow files (`.github/**`) are written by experts and applied by a human.

Deploy Preview and production smoke:
- the home page;
- `/api/forecast?beach=south-beach` returns 200 with the expected shape;
- the CSP and other headers;
- `/console/*` sends `no-store` and `noindex`;
- `sw.js` sends `no-cache`.

Release sign-off (qa-engineer), written into the handoff:
- the test results;
- the performance numbers;
- the AT and real-device pass for UI changes;
- known issues;
- the rollback point (the last good deploy).
