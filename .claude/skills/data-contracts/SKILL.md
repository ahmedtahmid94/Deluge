---
name: data-contracts
description: "The shared data shapes between the Beach Day functions and the front end: forecast, jobs, proposals and agent metadata. Use when adding or changing any API response or stored record."
user-invocable: false
metadata:
  roster-title: "Data contracts and typing"
  owner: software-architect
  shared-with: [open-meteo-integrator, agent-console-engineer, beach-conditions-analyst]
---
# Data contracts

Contracts live in `src/shared/` and are imported by both functions and UI.

- `GET /api/forecast?beach=<id>` returns `{ beach, generatedAt, attribution, days[{ date, score, verdict, window, reasons[], uv:{max, category}, confidence }], hours[{ time, score, gates[], raw:{...} }], marine: {...} | null }`. Verdicts are `"great" | "good" | "fair" | "poor" | "no-go"`.
- `beaches.json` entries have `{ id, name, lat, lon, marineLat?, marineLon?, facing, nwsRipCurrentUrl }`. `nwsRipCurrentUrl` is required (decision D1).
- Job (Blobs `jobs`): `{ id, agent, status: "queued"|"running"|"paused"|"done"|"error"|"refused"|"interrupted", seq, events[], messages[], heartbeatAt, proposalId? }`.
- Proposal (Blobs `proposals`): `{ id, jobId, agent, summary, baseCommit, files[{ path, action, content?, baseBlobSha }], status: "pending"|"committing"|"committed"|"rejected"|"stale", commitSha? }`.
- Public agent metadata (`agents.json`): `{ name, description, model, personality, color }`. System prompts never go to the browser.

Rules:
- Version breaking changes. Prefer adding fields to changing them.
- Validate at both ends: functions validate input; the UI validates responses before rendering.
- `null` means "unknown or unavailable" (for example marine data). Never use 0 as a stand-in.
