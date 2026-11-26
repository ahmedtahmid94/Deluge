# Software architect examples

| File | What it shows | How to check |
|---|---|---|
| `01-contracts.ts` | Shared contracts with runtime validation at the boundary; an exhaustive discriminated union | `node --experimental-strip-types 01-contracts.ts` |
| `02-boundary-check.ts` | A CI check for architecture rules: public→console imports, browser calls to third parties, `VITE_` secrets, I/O in pure modules | `node --experimental-strip-types 02-boundary-check.ts` |
| `03-design-note-agent-jobs.md` | A one-page design note (problem, options, choice, contracts, tests, reviewers) | Read |

Verified 2026-11-26 (Node 22.23, TypeScript 5.x): both scripts print `ok`, and both pass `tsc --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes`.
