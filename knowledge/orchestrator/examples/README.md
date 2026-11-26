# Orchestrator examples

| File | What it shows | How to check |
|---|---|---|
| `01-parallel-batch.md` | Planning a goal into dependency-ordered parallel batches, with a stand-alone brief | Read |
| `02-routing-a-handoff.md` | Routing a Handoff through the orchestrator: parallel reviews, open questions, resume | Read |
| `03-handoff-parser.ts` | Parsing and validating the CLAUDE.md Handoff block and extracting `next:` routes | `node --experimental-strip-types 03-handoff-parser.ts` |

Verified 2026-11-26 (Node 22.23): `ok: handoff parsed; route -> accessibility-specialist, security-engineer`.
