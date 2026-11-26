# Example: plan and launch a parallel batch

**Lead's goal:** "Build the Today screen for South Beach, end to end."

## Plan (task-planning skill)

| # | Task | Owner | Depends on | Output |
|---|---|---|---|---|
| 1 | Forecast and job contracts in `src/shared/contracts.ts` | software-architect | — | Types and validators |
| 2 | Today flow and state table, plus copy | ux-designer-apple-hig | — | `docs/design/flows/today.md` |
| 3 | Tokens and glass surfaces for Today | ui-designer-apple-liquid-glass | — | Token table and CSS |
| 4 | `scoring.ts` and fixtures | beach-conditions-analyst | 1 | Module and tests |
| 5 | Forecast request and parse (draft function) | open-meteo-integrator | 1 | `openmeteo.ts` plus a draft function |
| 6 | Today UI | pwa-engineer | 2, 3, 4, 5 | `src/app/today.ts` |
| 7 | Reviews | accessibility-specialist, security-engineer, qa-engineer | 6 | Verdicts |

**Batch A (parallel, one message with three Agent calls):** 1, 2, 3.
**Batch B (parallel):** 4, 5, once 1 is back.
**Then** 6, then the reviews in 7, also in parallel.

## Brief for task 2 (stands alone; the expert has no memory of this chat)

> **Goal:** design the Today screen flow for Beach Day (South Beach first).
> **Context:** read `docs/01` (scoring output: verdict, window, reasons, confidence), `docs/02` (offline and install), and decisions D1 (no rip-current estimate; always link to the NWS) and D3. Data shape: `ForecastResponse` (task 1 is in progress, so use the shape in `docs/03`).
> **Deliver:** `docs/design/flows/today.md` with steps, a state table (loading, success, stale, partial, offline, error) and exact copy, and accessibility notes.
> **Done when:** every state has copy, the safety strip is specified, and the copy passes the copy rules.
> **End with** the Handoff block from `CLAUDE.md`.
