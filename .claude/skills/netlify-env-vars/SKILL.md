---
name: netlify-env-vars
description: "Netlify environment variables for Beach Day: names, scopes, deploy contexts and secret handling. Use when adding or changing configuration values."
user-invocable: false
metadata:
  roster-title: "Environment variables and contexts"
  owner: netlify-engineer
  shared-with: [security-engineer]
---
# Environment variables and contexts

| Variable | Scope | Contexts |
|---|---|---|
| `ANTHROPIC_API_KEY` | Functions | production; a separate low-limit key for previews |
| `GITHUB_TOKEN` | Functions | **production only** |
| `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH=main` | Functions | all |
| `CONSOLE_PASSWORD_HASH`, `SESSION_SECRET`, `INTERNAL_JOB_SECRET` | Functions | all, with different values per context |
| `AGENT_DAILY_BUDGET` | Functions | all (lower in previews) |

Rules:
- Netlify scopes are Builds, Functions, Runtime and Post processing. **Secrets get Functions only**, so build scripts and dependencies can't read them and the bundler can't inline them.
- Mark secrets "Contains secret values" where the plan offers it (check on Free, decision D3).
- Deploy contexts: Production, Deploy Previews, Branch deploys, Local development (`netlify dev`).
- Set values with the Netlify UI or CLI, never in `netlify.toml` or the repo.
- Document every variable in `docs/03` when adding one. Security-engineer reviews any new secret.
