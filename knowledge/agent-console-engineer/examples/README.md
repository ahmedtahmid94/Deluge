# Agent Console engineer examples

| File | What it shows | How to check |
|---|---|---|
| `01-tool-loop.ts` | Strict tools, the tool loop with all results in one user message, `is_error`, `stop_reason` handling, the iteration cap | `node --experimental-strip-types 01-tool-loop.ts` |
| `02-commit-to-main.ts` | The atomic Git Data API commit straight to `main` with `force:false`, and the conflict check (happy path, moved-but-clean, stale) | `node --experimental-strip-types 02-commit-to-main.ts` |
| `03-job-idempotency.ts` | A background job state machine that survives Netlify retries; a race gives exactly one runner | `node --experimental-strip-types 03-job-idempotency.ts` |

Verified 2026-11-26: all three print `ok`. They typecheck under `tsc --strict` against `@anthropic-ai/sdk` 1.14.0. No real API calls are made; the clients are fakes.
