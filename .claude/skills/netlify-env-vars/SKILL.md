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
- Netlify scopes are Builds, Functions, Runtime and Post processing. **Scoping is a Pro-plan feature** ("On the Pro plan and above, you can set specific scopes"). On our **Free plan (D3), every variable, secrets included, is also visible to builds.** Mitigations:
  - package manifests, lockfiles, `scripts/**` and `vite.config.*` stay human-only;
  - no `VITE_` prefix on secrets;
  - a bundle secret scan;
  - review every new dependency's install scripts.

  Scoping secrets to Functions only is the target once the lead decides to upgrade.
- Mark secrets "Contains secret values" if the Free plan offers it.
- Deploy contexts: Production, Deploy Previews, Branch deploys, Local development (`netlify dev`).
- Set values with the Netlify UI or CLI, never in `netlify.toml` or the repo.
- Document every variable in `docs/03` when adding one. Security-engineer reviews any new secret.
