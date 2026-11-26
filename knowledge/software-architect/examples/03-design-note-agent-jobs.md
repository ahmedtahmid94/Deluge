# Design note (example): agent jobs on Netlify

This is a worked example of the one-page design note the architect writes before a structural change.

**Problem.** A console chat turn can take minutes (tool calls, multi-file proposals). Sync and streaming functions stop at 60 s.

**Constraints.**
- No other servers.
- Netlify Free plan (D3).
- Background functions: 15 min, a 202 response, no body, retried after 1 and 3 min.
- Blobs: strong consistency on request; no atomic increment.

**Options.**
1. Streaming sync function. Simple, but fails past 60 s and breaks when a phone sleeps.
2. **Background function + Blobs + polling.** Survives 15 min and phone sleep; needs idempotency.
3. Managed Agents (Anthropic-hosted loop). Removes the time limit but adds a beta dependency and moves the loop off our functions.

**Choice.** Option 2. Option 3 is the fallback if jobs regularly exceed about 12 minutes.

**Contracts.** `Job` union (`01-contracts.ts`): `queued → running → done | error | refused | interrupted | paused`. Events carry an increasing `seq`. Polls pass `?after=seq`.

**Limits and failure handling.**
- Heartbeat every write; a stale heartbeat (over 90 s) on retry becomes `interrupted`, never a second model call.
- Time budget of about 12 minutes, then `paused`.

**Tests needed.**
- Retry no-op; stale to interrupted; concurrent claim gives one runner (`agent-console-engineer/examples/03-job-idempotency.ts`).
- Internal-secret check on the worker.
- Polling resumes after a refresh.

**Reviewers.** agent-console-engineer, netlify-engineer, security-engineer.
