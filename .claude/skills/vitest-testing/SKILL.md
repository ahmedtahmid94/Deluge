---
name: vitest-testing
description: "Writing Vitest unit and function tests for Beach Day: fixtures, fakes, tables and boundaries. Use when writing or reviewing tests for logic or Netlify Functions."
user-invocable: false
metadata:
  roster-title: "Unit and function tests (Vitest)"
  owner: qa-engineer
  shared-with: [beach-conditions-analyst, security-engineer, agent-console-engineer, open-meteo-integrator]
---
# Vitest unit and function tests

- Tests live in `tests/` mirroring `src/` (`tests/shared/scoring.test.ts`). Fixtures go in `tests/fixtures/`.
- **Scoring:**
  - fixture days (perfect morning with a 3 pm storm, all-day storms, feels-like 105 °F, gusts 32 mph, waves 6 ft, marine `null`, a DST day, fewer than 4 beach hours);
  - boundary values (12/13 mph, 90/103 °F, UV 2/3/5/6/7/8/10/11);
  - optional property tests (score always 0–100; worsening an input never raises it).
- **Allow-list:** a table of hostile paths that must be rejected and safe paths that must be accepted (docs/05). Also modes, counts and sizes.
- **Function handlers:** call `handler(new Request(url, init), context)` directly. Inject fakes for `fetch` (Open-Meteo, GitHub), the Anthropic client (scripted stream events) and Blobs (an in-memory map with ETags and `onlyIfMatch`).
- **Required function tests:**
  - every console route without a session returns 401;
  - CSRF and Origin checks;
  - job idempotency on retry;
  - stale-heartbeat handling;
  - refusal and `max_tokens` handling;
  - a double approve gives one commit;
  - conflict gives `stale`;
  - the approve call sequence ends with `force: false`;
  - an unknown beach returns 400;
  - missing marine data returns `marine: null`.
- Freeze time with fake timers. Never call the real network in unit or function tests.
- Name tests as behaviour: `"caps verdict at Poor when feels-like is 104°F"`.
