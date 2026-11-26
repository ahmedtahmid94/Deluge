---
name: secrets-management
description: "Where Beach Day's secrets live and how they stay out of the browser, the repo and logs. Use when adding a secret, reading one in code or reviewing builds and logs."
user-invocable: false
metadata:
  roster-title: "Secrets management"
  owner: security-engineer
  shared-with: [netlify-engineer, agent-console-engineer]
---
# Secrets management

Secrets:
- `ANTHROPIC_API_KEY`
- `GITHUB_TOKEN`
- `CONSOLE_PASSWORD_HASH`
- `SESSION_SECRET`
- `INTERNAL_JOB_SECRET`

Rules:
- Set them in the Netlify UI or CLI as env vars. Never in `netlify.toml`, `.env` files in the repo, code, tests or docs.
- **Free plan caveat (D3):** scopes are Pro-only, so secrets are also visible to builds. Keep build-time code human-only (the deny-list), keep the bundle scan, and audit dependency install scripts. Scope to Functions only after an upgrade.
- Read them only inside functions (`Netlify.env.get(...)` or `process.env`). Never prefix one with `VITE_`, never pass one to the client, never put one in a response.
- Deploy Previews and branch deploys get a separate low-limit Anthropic key and **no GitHub token**, so a preview can't commit.
- Logs: never log secrets, request bodies or message contents by default. Log IDs and status codes instead.
- CI bundle scan: fail the build if `dist/` contains `sk-ant-`, `github_pat_`, `ghp_` or any secret variable name.
- Rotation:
  - GitHub token every 90 days (its expiry);
  - Anthropic key on any suspicion;
  - `SESSION_SECRET` when the password changes.

  Document each rotation in the lead's checklist.
- If a secret leaks: revoke it at the provider first, then replace it in Netlify, then redeploy, then review logs.
