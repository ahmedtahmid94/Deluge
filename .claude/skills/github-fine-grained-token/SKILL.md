---
name: github-fine-grained-token
description: "Setup, scope and rotation of the fine-grained personal access token the Agent Console uses to commit. Use when creating, rotating or reviewing the GitHub token."
user-invocable: false
metadata:
  roster-title: "GitHub fine-grained tokens"
  owner: security-engineer
  shared-with: [agent-console-engineer]
---
# GitHub fine-grained personal access token

Decision D4: GitHub access uses a **fine-grained personal access token**.

Create it under GitHub → Settings → Developer settings → Fine-grained tokens:
- **Resource owner:** the account that owns the repo.
- **Repository access:** *Only select repositories* → this repo only.
- **Repository permissions:**
  - **Contents: Read and write**
  - **Metadata: Read-only** (mandatory)
  - **nothing else**. No Workflows, so GitHub itself rejects commits to `.github/workflows/`. No Pull requests (decision D2: commits go straight to `main`). No Administration, Secrets, Actions or Environments.
- **Expiration:** 90 days. Set a reminder to rotate before it expires.
- An organisation may require approval; until then the token stays pending and read-only.

Store it only as `GITHUB_TOKEN` in Netlify, Functions scope, production context only.

**Branch rules (D2):** `main` must not require pull requests, or every approval fails. Blocking force pushes and deletion of `main` is recommended.

Verify after creating or rotating:
- a read of a file works;
- a test commit through the approve flow on a harmless file works;
- a commit touching `.github/workflows/` is refused.
