# 04 — Agent Console: design, security and long-running jobs

The Agent Console is a password-gated page inside the deployed app (`/console`). It:

1. **Lists every agent** in `.claude/agents/` with its name, model and personality.
2. **Lets the user chat with any agent.** The Claude API is called only from a Netlify Function, with the key in an environment variable.
3. **Lets an agent propose code changes.** A proposal is shown as a diff and is committed to GitHub **only after the user clicks Approve**. The commit to `main` triggers a Netlify redeploy.

---

## 1. Agent definitions (`.claude/agents/*.md`)

The console reads the same files Claude Code uses for subagents. Each is Markdown with YAML frontmatter, and **the Markdown body is the agent's system prompt**:

```markdown
---
name: frontend-engineer
description: Builds and fixes the Beach Day UI, PWA shell and accessibility.
tools: Read, Glob, Grep, Edit
model: sonnet
color: cyan
---

You are the frontend engineer for Beach Day...

## Personality
Calm, precise, explains trade-offs in one line, never ships without an a11y check.
```

Frontmatter fields per the Claude Code docs:

- **Required:** `name`, `description`.
- **Optional:** `tools`, `disallowedTools`, `model`, `permissionMode`, `maxTurns`, `skills`, `mcpServers`, `hooks`, `memory`, `background`, `effort`, `isolation`, `color`, `initialPrompt`, and others.
- `model` takes `sonnet`, `opus`, `haiku`, `fable`, a full model ID such as `claude-opus-5-5`, or `inherit`.

**"Personality" is not a frontmatter field.** Convention for this repo: the console shows `description` as the one-line role and the body's `## Personality` section as the personality. Without that section, it shows the body's first paragraph. Don't add a custom `personality:` key, because Claude Code's schema doesn't define one.

### Model mapping (console → Claude API)

| Frontmatter `model` | API model ID |
|---|---|
| `opus`, `inherit` or missing | `claude-opus-5-5` (default) |
| `sonnet` | `claude-sonnet-5-5` |
| `haiku` | `claude-haiku-5-5` |
| `fable` | `claude-fable-5-2` |
| full ID (`claude-…`) | used as-is if it is on an **allow-list** of known IDs; otherwise the build fails |

Keep this table in one module (`src/shared/models.ts`). Model IDs change, so the team should update it from the Claude API *Models* page or the Models API (`GET /v1/models`), not from memory.

### Loading

A **build step** (`scripts/build-agents.ts`) parses `.claude/agents/*.md` with a YAML parser, validates it (required fields, known model, name matches `^[a-z0-9-]{1,64}$`), and writes two outputs:

- `dist/console/agents.json`: **public metadata only** (name, description, model label, personality, color). The listing page uses it.
- A server-only module bundled into the agent functions, with the full system prompts.

System prompts are not secrets, but the browser doesn't need them, and keeping them server-side stops a client from tampering with which prompt is used.

Because the list is built at deploy time, **an approved change that adds or edits an agent appears after the redeploy**, which is the expected behaviour.

---

## 2. Calling the Claude API from Netlify Functions

- Use the official TypeScript SDK, `@anthropic-ai/sdk`. `new Anthropic()` reads `ANTHROPIC_API_KEY` from the function environment.
- **Messages API** (`POST /v1/messages`): the system prompt comes from the agent body; `messages` is the conversation; `tools` are the console's tools (below).
- **Thinking:** on current models use `thinking: { type: "adaptive" }`. The old `budget_tokens` form is rejected by Opus 5.5 / Sonnet 5.5 / Fable 5.2. Set depth with `output_config: { effort: "low" | "medium" | "high" | "xhigh" | "max" }`; Opus 5.5 defaults to `medium`. Suggested levels: `low` or `medium` for chat, `high` for code proposals.
- **Streaming:** use `client.messages.stream(...)` with `await stream.finalMessage()`. Server-sent events arrive in this order: `message_start`, then for each content block `content_block_start` → `content_block_delta` (`text_delta`, or `input_json_delta` for tool inputs) → `content_block_stop`, then `message_delta` (with `stop_reason`), then `message_stop`. An `overloaded_error` can arrive mid-stream; the SDK raises it as an error.
- **`max_tokens`:** about 16,000 for non-streaming calls and up to about 64,000 for streaming ones. Large values need streaming to avoid HTTP timeouts.
- **Always check `stop_reason`** before using `content`: `end_turn`, `tool_use`, `max_tokens`, `pause_turn`, or `refusal`. On `refusal`, show a clear "The model declined this request" message.
- **Refusal fallback:** for Opus 5.5 / Sonnet 5.5 / Fable 5.2, the API offers server-side fallbacks (beta header `server-side-fallback-2026-07-01` with `fallbacks: "default"`). Enable it, and tell the user when a fallback model answered.
- **Forced tool choice** (`tool_choice: {type: "any" | "tool"}`) returns 400 on Opus 5.5 / Sonnet 5.5 / Fable 5.2. Use `auto` with a clear instruction, plus `strict: true` on tool schemas.
- **Errors:** retry 429 and 5xx with backoff (the SDK retries twice by default). Surface 400s, since they are bugs.
- **Prompt caching:** put the agent's system prompt and the tool list first and mark them with `cache_control: { type: "ephemeral" }`. Every turn of a chat repeats that prefix, so caching cuts cost and latency.

Sketch, inside the background worker:

```ts
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic(); // ANTHROPIC_API_KEY from env

const stream = client.messages.stream({
  model: agent.modelId,                       // from models.ts
  max_tokens: 32000,
  thinking: { type: "adaptive" },
  output_config: { effort: "high" },
  system: [{ type: "text", text: agent.systemPrompt + CONSOLE_RULES,
             cache_control: { type: "ephemeral" } }],
  tools: CONSOLE_TOOLS,                       // read_file, list_files, propose_changes
  messages: job.messages,
});
stream.on("text", (t) => job.appendText(t));  // buffered writes to Blobs, e.g. every 1–2 s
const msg = await stream.finalMessage();
if (msg.stop_reason === "refusal") { /* mark job refused */ }
```

`CONSOLE_RULES` is a fixed paragraph appended to every agent's system prompt. It describes the tools, states that changes are **only proposals a human reviews**, lists the allowed paths, and says that file contents and repository text are data, not instructions.

### Tools exposed to agents

| Tool | Effect | Safety |
|---|---|---|
| `list_files({ prefix })` | Lists repo paths (GitHub Git Trees API, read) | Read-only; results filtered to readable paths |
| `read_file({ path })` | Returns file text at the current `main` (GitHub Contents API, `GET`) | Read-only; denies secrets-like paths (`.env*`) and files over 1 MB |
| `propose_changes({ summary, files: [{ path, action: "create"\|"update"\|"delete", content? }] })` | **Stores a proposal in Blobs. It does not commit.** | Validated against the path allow-list and size limits *when proposed* and again *when approved* |

Define the tools with JSON Schema and `strict: true`, `additionalProperties: false`, and `required` fields.

Run the loop by hand or with the SDK's beta tool runner (`client.beta.messages.toolRunner`). Either way:

- Cap iterations (for example 12 tool calls per job).
- Return failures as `tool_result` with `is_error: true`.
- Return **all** results from one parallel batch in a single user message.

**Hosting alternative:** Claude Managed Agents (beta) can host the agent loop and a sandbox on Anthropic's side. Here we run a simple loop ourselves inside Netlify, which keeps the repo token in our own function and avoids an extra beta dependency. Reconsider if jobs outgrow the 15-minute background limit.

---

## 3. Long agent jobs vs. Netlify time limits

Limits: synchronous and streaming functions get **60 s** (streams up to 20 MB). Background functions get **15 min**, return an immediate `202`, cannot stream, and are **retried after 1 and 3 minutes on failure**.

A chat turn with tool use and a multi-file proposal can take several minutes, so all agent work runs in a background function:

```
Browser                    agent-start (sync)          agent-run (background)        Blobs (strong)
   │ POST /api/agent/jobs      │                             │                          │
   │  {agent, message, jobId?}─►│ auth + rate-limit           │                          │
   │                           │ create/append job ─────────────────────────────────────►│ job:<id> status=queued
   │                           │ fetch(/api/agent/run, {jobId}, X-Internal-Secret) ──────►│
   │◄── 202 {jobId} ───────────│                             │ load job; if status≠queued → exit (idempotent)
   │                           │                             │ status=running ─────────►│
   │ GET /api/agent/jobs/:id?after=<seq> (every 1–2 s)       │ stream Claude; append text/tool events ──►│
   │◄── {status, events since seq} ──────────────────────────────────────────────────────│
   │                           │                             │ propose_changes → prop:<id> ─────────────►│
   │                           │                             │ status=done | error | refused ───────────►│
```

Design rules:

- **The job ID comes from the server** (`crypto.randomUUID()`). The browser keeps it in memory and in `sessionStorage`, so a refresh resumes polling.
- **Handoff security:** `agent-start` calls the background function's URL with a header carrying `INTERNAL_JOB_SECRET`. The background function checks it in constant time **and** re-checks that the job exists in Blobs with `status: "queued"`. This blocks direct calls from outside that skip auth and rate limits.
- **Idempotency:** a Netlify retry finds the job already `running` or `done` and exits. If a job is `running` with an old heartbeat (over 90 s), the retry marks it `error: "interrupted"` rather than calling Claude again, which would cost tokens twice.
- **Time budget:** the worker stops starting new Claude calls after about 12 minutes, saves state, and marks the job `paused` with a "Continue" button. The user's next message starts a new job from the saved messages.
- **Progress writes:** buffer streamed text and write to Blobs every 1–2 s or every 2 KB. A write per token would be slow and costly. Each write appends events with a growing `seq`; status polls pass `?after=seq`.
- **Strong consistency** on the `jobs` and `proposals` stores, so a poll right after a write sees it.
- **Short replies:** for a plain question with no tools, a *streaming* sync function (60 s) would feel faster. Keep it as an option, but v1 uses one path (background + poll) for everything. It is simpler and survives screen-off on phones.
- **Cleanup:** delete jobs older than 7 days lazily, when a session lists or reads jobs. No scheduled function is needed, which keeps us simple on the Free plan (D3).

---

## 4. Propose → Review → Approve → Commit → Redeploy

### Proposal record

```json
{
  "id": "prop_…", "jobId": "job_…", "agent": "frontend-engineer",
  "summary": "Add UV advice chip to day cards",
  "baseCommit": "<sha of main when proposed>",
  "files": [{ "path": "src/app/dayCard.ts", "action": "update",
              "content": "…", "baseBlobSha": "<sha at baseCommit or null>" }],
  "status": "pending", "createdAt": "…"
}
```

### Review UI

- A diff per file, computed in the browser between the current file (fetched via `read_file`) and the proposed content.
- File list with create/update/delete badges, the agent's summary, and the commit message preview (`agent(frontend-engineer): Add UV advice chip [console]`).
- **Approve** and **Reject** buttons. Approve asks for confirmation ("Commit 2 files to main and redeploy?") and is disabled once tapped.

### Approve function (`POST /api/proposals/:id/approve`)

1. **Auth:** a valid session cookie, an `Origin` header equal to the site origin, and a per-session CSRF token from a header (double-submit).
2. Load the proposal with strong consistency. If it isn't `pending`, return 409. Claim it with a conditional write (`onlyIfMatch` on the ETag) and set `status: "committing"`, so two taps can't commit twice.
3. **Re-validate every path** against the allow-list (below), plus sizes and file count. The check at proposal time is not enough on its own.
4. **Check for conflicts:** get `main`'s head. If it differs from `baseCommit`, compare each touched file's current blob SHA with `baseBlobSha`. If any changed, mark the proposal `stale` and ask the agent to rebase. Never overwrite someone else's change silently.
5. **Commit atomically with the Git Data API**, so a multi-file change is a single commit:
   1. `GET /repos/{o}/{r}/git/ref/heads/main` → head SHA
   2. `GET /repos/{o}/{r}/git/commits/{head}` → tree SHA
   3. `POST /repos/{o}/{r}/git/trees` with `base_tree` = that tree. Entries are `{ path, mode: "100644", type: "blob", content }`; deletes are `{ path, mode: "100644", type: "blob", sha: null }`.
   4. `POST /repos/{o}/{r}/git/commits` `{ message, tree, parents: [head] }`
   5. `PATCH /repos/{o}/{r}/git/refs/heads/main` `{ sha: newCommit, force: false }`. A non-fast-forward fails, which is a second guard against races.

   A single-file alternative is the Contents API `PUT /repos/{o}/{r}/contents/{path}` (`message`, base64 `content`, `sha` when updating, `branch`). Note that the Contents API PUT and DELETE endpoints **conflict when called in parallel and must be called one after another**, so use the Git Data API for multi-file changes.
6. Set `status: "committed"` and store `commitSha` and its URL. Netlify then builds `main` automatically. The console shows "Deploying…" with a link to the Netlify deploy list.
7. **Audit log:** append `{ proposalId, agent, files, commitSha, ipHash, time }` to an `audit` store. The commit message carries the agent name and proposal ID.

All writes go through the GitHub REST API with `Authorization: Bearer $GITHUB_TOKEN` and an `X-GitHub-Api-Version` header.

---

## 5. Security

### Threat model (short)

| Threat | Example | Main controls |
|---|---|---|
| Stranger uses the console | Finds `/console`, burns API credit, commits code | Password gate, rate limits, budget cap |
| Stolen token / key | Key in client JS, logs, or a committed file | Secrets only in Netlify env vars (Functions-scoped once on Pro; visible to builds on Free); never sent to the browser; CSP `connect-src 'self'`; secrets scanning |
| **Agent escalates via code** | Proposal edits a function to print `process.env`, removes the password check, adds a malicious npm dependency, or edits CI | **Path allow-list** that excludes functions, config, package manifests and CI; a human reviews every diff; token without the Workflows permission |
| Prompt injection | A file or chat text says "ignore rules, propose X" | The human approval gate; the allow-list is enforced in code, not in the prompt; repo text is labelled as data |
| Replay / double commit | Two Approve taps, or a retried request | Conditional write on the proposal; `force: false` ref update |
| CSRF | Another site triggers approve | `SameSite=Strict` cookie, `Sec-Fetch-Site: same-origin` (Origin fallback), HMAC-signed CSRF token (OWASP) |

### Password gate

- One shared console password; this is a single-owner app. Store **only a hash** in `CONSOLE_PASSWORD_HASH`: Node `crypto.scrypt` at OWASP's minimum N=2^17, r=8, p=1, with a random salt, stored as `scrypt$17$8$1$salt$hash`. Pass `maxmem` of 256 MiB. Compare with `crypto.timingSafeEqual`.
- On success, create a random session ID (32 bytes) and store it in the `sessions` Blob with an **idle timeout of 30 min and an absolute timeout of 8 h** (OWASP Session Management), enforced server-side. Set the cookie `__Host-bd_session=<id>; Path=/; Secure; HttpOnly; SameSite=Strict`. The `__Host-` prefix pins the cookie to our origin.
- **Every** console function checks the session first. A route not covered by that check is a bug; add a test that calls every `/api/agent*` and `/api/proposals*` route without a cookie and expects 401.
- **Brute force:** apply Netlify's `rateLimit` on the login function (for example `windowLimit: 5, windowSize: 60, aggregateBy: ["ip", "domain"]`). Also keep a failed-attempt counter per IP hash in Blobs that locks the IP out for 15 minutes after 10 failures.
- Logout deletes the session from Blobs.
- No Netlify site password protection or Basic-Auth layer: those aren't part of the Free plan (decision D3). The function-level gate above is the whole gate, so its tests matter.
- The UI never shows whether the account or the password was wrong; it says only "Incorrect password".

### GitHub fine-grained personal access token

Create it under GitHub → Settings → Developer settings → Fine-grained tokens:

- **Resource owner:** the account that owns the repo. **Repository access: Only select repositories → this one repo.**
- **Repository permissions:**
  - **Contents: Read and write** (needed for the contents, trees, commits and refs endpoints).
  - **Metadata: Read-only** (mandatory).
  - **Nothing else.** In particular, no **Workflows** permission: GitHub then refuses commits that touch `.github/workflows/`, which gives a server-side backstop to our allow-list. No Administration, Secrets or Pull requests.
- **Expiration:** 90 days, with a calendar reminder to rotate. (Allowed range is 1–366 days or none; organisations can enforce a maximum.)
- If the repo is in an organisation that requires approval, the token stays `pending` with read-only public access until an admin approves it.
- Store it only as `GITHUB_TOKEN` in Netlify env vars, Functions scope, marked secret. Never in the repo, the client bundle or logs.
- **Decision D4:** GitHub access uses this fine-grained personal access token, not a GitHub App or OAuth app.
- **Branch protection (decision D2):** Approve **commits straight to `main`**. There is no pull-request or agent-branch flow, so the token needs no *Pull requests* permission. `main` must not have a rule that requires pull requests, or every approval fails. Rely on `force: false` on the ref update and the conflict check in step 4. Blocking force pushes and branch deletion on `main` is fine and recommended.

### Path allow-list (enforced in code)

Agents may change **only**:

```
src/app/**          src/shared/**        src/console/ui/**
public/icons/**     public/screens/**    src/data/beaches.json
tests/**            docs/**              .claude/agents/**   .claude/skills/**   (see note)
```

Agents may **never** change (deny wins over allow):

```
netlify/**            netlify.toml          public/_headers   public/_redirects
package.json          package-lock.json     pnpm-lock.yaml    .npmrc
.github/**            scripts/**            vite.config.*     tsconfig*.json
src/console/server/** src/shared/models.ts  .env*             **/*.pem  **/*.key
CLAUDE.md
```

Why deny these:

- `netlify/**` holds the functions that hold the secrets. A changed function could print environment variables.
- Config and header files could remove the CSP or rate limits.
- Package manifests and lockfiles could add a dependency that runs at build time.
- `scripts/` and the build config run at build time.
- `.github/` is CI.

Changes in those areas are made by a human in their own editor.

Note on `.claude/agents/**` and `.claude/skills/**`: allowing them lets agents edit their own prompts and skills. `CLAUDE.md` stays human-only because it holds the team rules every agent loads. That is useful ("add a QA agent"), but every such diff should be reviewed with extra care. An option is a second confirmation in the UI for changes to agent files.

Validation function (shared by proposal and approval):

- Reject if the path:
  - is absolute, contains `..`, `\`, `//`, NUL or control characters, or has a leading or trailing space;
  - doesn't match the allow-list globs after normalising (`path.posix.normalize`) and comparing exactly;
  - matches any deny glob;
  - would be anything but a regular file (`mode` must be `100644`, never symlink `120000`, submodule `160000` or executable `100755`).
- Limits: at most 20 files per proposal, at most 200 KB per file, at most 1 MB total, UTF-8 text only.
- Unit-test it with a table of malicious paths (see `05-testing-and-accessibility.md`).

### No secrets in the browser

- The browser only ever calls `/api/*` on our origin. It never sees the Anthropic key, the GitHub token, the password hash or the session secret.
- Secret env vars are never `VITE_`-prefixed, so Vite cannot inline them. They are **Functions-scoped once the plan allows it**; on Free they are also visible to builds (docs/03), so build-time code stays human-only. Add a CI or test step that greps `dist/` for `sk-ant-`, `github_pat_`, `ghp_` and the names of the secret variables, and fails the build on a hit.
- Function errors returned to the client are generic ("Agent failed — see log ID abc123"). Details go to function logs, with request bodies **redacted**: no message content in logs by default.
- CSP `connect-src 'self'`, `frame-ancestors 'none'`, and no inline scripts.

### Rate limits and spend control

| Layer | Limit (starting values) |
|---|---|
| Netlify `rateLimit` on `agent-start` | 10 requests / 60 s per IP+domain (max window 180 s) |
| Netlify `rateLimit` on login | 5 / 60 s per IP+domain |
| Netlify `rateLimit` on approve | 5 / 60 s |
| App-level daily budget (Blobs counter) | e.g. 100 jobs/day, and a token count from `usage` in each response; jobs refused past `AGENT_DAILY_BUDGET` |
| Per job | ≤ 12 tool iterations, `max_tokens` cap, ≤ 12 min wall time |
| Concurrency | ≤ 2 running jobs per session |
| Anthropic Console | A monthly **spend limit** on the workspace that owns the key (the hard backstop) |
| Netlify plan | **Free (decision D3).** Watch the usage page; the daily budget and CDN caching keep us within the free allowance |

Netlify rate limits are in each function's `config` object (`windowLimit`, `windowSize` in seconds up to 180, `aggregateBy: ["ip", "domain"]`, and `action: "rate_limit"` or `"rewrite"`). **They cannot be set in `netlify.toml`.** Blobs counters are approximate (last write wins), which is fine for a budget. The hard guarantee is the Anthropic spend limit.

### Prompt-injection stance

- An agent can read repo files and receives the user's text. Any of it may contain instructions, so treat it as data.
- **The safety boundary is in code, not in the prompt:** the allow-list, the absence of a commit tool for the agent, and the human Approve step.
- The approval UI shows the **full diff** with no truncation; very long files are collapsed but expandable. It warns visually on changes to `.claude/agents/**`, to any network call (`fetch(` or a URL added), or to anything that looks like secret handling.

---

## 6. Console UI (summary)

- `/console/login`: password field and submit; errors are announced to screen readers.
- `/console`: a grid of agent cards (name, model badge, color dot, description, personality). Tap a card to open the chat.
- `/console/agents/:name`: the chat thread; job status (queued, running with live text, done or error); tool-use chips ("Read src/app/dayCard.ts"); a proposal card with a "Review changes" button.
- `/console/proposals/:id`: the diff review with Approve and Reject; after approval, the commit link and deploy status.
- Every console page: a "Log out" control, a `noindex` header, and `Cache-Control: no-store`. The service worker never caches console pages.

## Sources

- Claude Code docs, *Create custom subagents* (frontmatter fields, model values): https://code.claude.com/docs/en/sub-agents
- Claude API docs, *Streaming messages*: https://platform.claude.com/docs/en/build-with-claude/streaming
- Claude API: Messages, models, tool use, thinking/effort, refusal fallbacks — Claude Platform docs at https://platform.claude.com/docs (models overview, tool use and model migration pages)
- GitHub REST, *Repository contents* (create/update file, permissions, serial-use warning): https://docs.github.com/en/rest/repos/contents
- GitHub REST, *Git trees* (base_tree, `sha: null` deletes, Contents write permission): https://docs.github.com/en/rest/git/trees
- GitHub, *Managing your personal access tokens* (fine-grained, select repositories, expiry): https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
- Netlify, *Background Functions*, *Functions configuration*, *Netlify Blobs*, *Environment variables*, *Rate limiting*: see the links in `03-architecture.md`
