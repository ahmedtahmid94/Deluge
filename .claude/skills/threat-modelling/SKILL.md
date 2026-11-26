---
name: threat-modelling
description: "Threat model for Beach Day and its Agent Console: assets, attackers, threats and required controls. Use when designing a feature or reviewing any change that touches auth, secrets, functions or agent capabilities."
user-invocable: false
metadata:
  roster-title: "Threat modelling"
  owner: security-engineer
  shared-with: [software-architect, agent-console-engineer]
---
# Threat modelling

Assets:
- `ANTHROPIC_API_KEY` (money);
- `GITHUB_TOKEN` (write to the repo, and so to the live site);
- the console password and sessions;
- the integrity of the live site;
- the Open-Meteo quota.

Threats and controls (docs/04, section 5):

| Threat | Controls |
|---|---|
| A stranger uses the console | Password gate, rate limits, budget |
| A leaked secret | Netlify env vars (Functions-scoped needs Pro; on Free build code stays human-only); bundle scan; generic errors |
| **An agent widens its own access through code** (edits a function to print env, removes auth, adds a dependency, edits CI) | Path allow-list, enforced at proposal and approval; human review of the diff; token without Workflows |
| Prompt injection from repo text or chat | Controls in code; human approval; repo text treated as data |
| Replay or double commit | Conditional write; `force: false` |
| CSRF | `SameSite=Strict`; Origin check; CSRF token |
| Open-proxy abuse of `/api/forecast` | Allow-listed beach IDs only |
| XSS through agent or API text | `textContent` only; CSP |

For each change ask:
- What new input does it accept?
- What can it reach (secrets, GitHub, Blobs)?
- What happens if the input is hostile?
- Which control stops it, and which test proves that?

Write findings as `severity` (blocker, high, medium, low), `where` (file:line), `issue`, `fix`.
