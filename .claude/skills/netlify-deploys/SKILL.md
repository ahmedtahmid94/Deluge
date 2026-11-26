---
name: netlify-deploys
description: "How Beach Day deploys on Netlify: Git-triggered production deploys from main, Deploy Previews, failed builds and rollback. Use when releasing, approving commits or recovering from a bad deploy."
user-invocable: false
metadata:
  roster-title: "Deploys, previews and rollback"
  owner: netlify-engineer
  shared-with: [qa-engineer, orchestrator]
---
# Deploys, previews and rollback

- The repo is connected to Netlify with **production branch `main`**. Every push to `main` builds and deploys.
- An Agent Console Approve commits straight to `main` (decision D2), so it triggers a production deploy. There is no separate release step.
- Deploy Previews build for pull requests opened by humans. They use preview env values (no GitHub token, a low-limit Anthropic key).
- A failed build leaves the previous deploy live. The console shows "Build failed — previous version still live" with a link to the Netlify deploy log.
- **Rollback:**
  1. In Netlify, *Deploys* → choose the last good deploy → *Publish deploy* (instant).
  2. Then `git revert` the bad commit so `main` matches what's live.
  3. Re-enable auto publishing if it was locked.
- After each production deploy, run the smoke checks (qa-engineer):
  - the home page loads;
  - `/api/forecast?beach=south-beach` returns 200;
  - the headers are present;
  - the console login page loads.
- Free plan (decision D3): build minutes are limited. Avoid unnecessary commits, and batch small agent changes into one proposal where sensible.
