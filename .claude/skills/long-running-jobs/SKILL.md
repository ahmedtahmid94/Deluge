---
name: long-running-jobs
description: "How the Agent Console runs agent jobs longer than Netlify's 60-second limit: background function, Blobs state, polling, idempotency and time budgets. Use when building or debugging agent jobs."
user-invocable: false
metadata:
  roster-title: "Long-running job design"
  owner: agent-console-engineer
  shared-with: [netlify-engineer, software-architect]
---
# Long-running agent jobs on Netlify

Limits: sync and streaming functions run at most **60 s** (streaming responses up to 20 MB). Background functions run up to **15 min**, return an immediate **202**, have **no response body** and are **retried after 1 and 3 minutes on error**. Background functions are available on the Free plan (decision D3).

Flow (docs/04, section 3):
1. `POST /api/agent/jobs` (sync): auth, rate limit and budget checks; create `job:<uuid>` with `status: "queued"` in Blobs (strong consistency); call the background function's URL with the `X-Internal-Secret` header; return `{ jobId }`.
2. `agent-run` (background): check the secret (constant-time) **and** that the job is `queued`, then set `running`; stream Claude; append events; write `heartbeatAt`; finish as `done`, `error`, `refused` or `paused`.
3. `GET /api/agent/jobs/:id?after=seq` (sync, fast): return the status and new events.

Rules:
- **Idempotent:** a retry that finds the job `running` or `done` exits. If `running` with a heartbeat older than 90 s, mark it `interrupted`. Never call Claude twice for the same step.
- **Time budget:** stop starting model calls after about 12 minutes and save as `paused`. "Continue" starts a new job from the saved messages.
- Batch Blobs writes. There are no atomic increments, so use conditional writes (`onlyIfMatch`) for state changes that must happen once.
- The job ID is kept in `sessionStorage` so polling resumes after a refresh.
- Clean up jobs older than 7 days lazily on read (no scheduled function).
