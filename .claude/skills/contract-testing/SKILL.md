---
name: contract-testing
description: "Keep Beach Day's assumptions about Open-Meteo responses honest with recorded fixtures and a scheduled live check. Use when Open-Meteo requests change or fixtures are refreshed."
user-invocable: false
metadata:
  roster-title: "Contract testing"
  owner: qa-engineer
  shared-with: [open-meteo-integrator]
---
# Contract testing (Open-Meteo)

- Record real responses for 2–3 beaches into `tests/fixtures/openmeteo/{forecast,marine}-<beach>-<date>.json`, from the exact request URLs that `src/shared/openmeteo.ts` builds.
- A contract test parses each fixture with the response validator and asserts:
  - every requested variable is present;
  - array lengths match `time`;
  - the units are as requested (°F, mph, inch, ft);
  - the timezone is America/New_York.
- A live check (manual, or a GitHub Action scheduled by a human; `.github/**` is human-only):
  - calls both endpoints for one beach;
  - validates them the same way;
  - opens an issue or reports failure on a mismatch.

  Keep it to a few calls a day, well inside the free limits.
- Refresh fixtures when the variable list changes, and note the change in the commit message.
- Marine fixtures should include a case with `null` values for later days.
