# Meta-agent examples

| File | What it shows | How to check |
|---|---|---|
| `01-team-sync-check.ts` | Checks the whole team for consistency: frontmatter, skills (≤32, no `disable-model-invocation`), Agent tool only on the orchestrator, roster wiring, knowledge folders, "Before you answer" | From the repo root: `node --experimental-strip-types knowledge/meta-agent/examples/01-team-sync-check.ts` |
| `02-sample/agents/copy-reviewer.md` | A well-formed agent file in this repo's house style | `claude plugin validate knowledge/meta-agent/examples/02-sample/agents` |
| `02-sample/skills/beach-glossary/SKILL.md` | A well-formed reference skill (`user-invocable: false`, `metadata`) | Read |

Verified 2026-11-26: `claude plugin validate` printed `√ Validation passed`; the sync check passed on this repo (see `knowledge/README.md`).
