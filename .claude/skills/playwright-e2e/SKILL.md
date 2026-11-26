---
name: playwright-e2e
description: "Playwright end-to-end tests for the Beach Day PWA and Agent Console on phone viewports. Use when writing or running browser tests."
user-invocable: false
metadata:
  roster-title: "End-to-end tests (Playwright)"
  owner: qa-engineer
  shared-with: [pwa-engineer, accessibility-specialist]
---
# Playwright end-to-end tests

- Use `@playwright/test` with projects for the `iPhone 15` and `Pixel 7` device presets, plus desktop Chromium for keyboard tests.
- In CI, pass `--trace off`. Turn traces on only to debug a failing test.
- Mock `/api/*` with `page.route()` and fixture JSON for deterministic results. Run one smoke suite unmocked against the Deploy Preview.

Beach Day flows:
- pick a beach → verdict and day strip render → the choice persists;
- day detail shows the window, reasons and the NWS rip-current link;
- offline with `context.setOffline(true)` shows the cached forecast with its age;
- service-worker update: serve build A then build B → the toast → reload → the old cache is deleted;
- install UI: a synthetic `beforeinstallprompt` on Chromium; the iOS hint with an iPhone user agent.

Console flows (fake backend):
- wrong and right password;
- agent cards from `agents.json`;
- send → queued → running → done;
- proposal → diff → Approve dialog → commit result;
- Reject makes no commit call.

Run axe in each flow (the `automated-a11y-testing` skill). Use role-based locators (`getByRole`, `getByLabel`); if a locator is hard to write, the UI is probably hard to use.
