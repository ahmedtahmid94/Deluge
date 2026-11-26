# 03 — Architecture: static Netlify site + Netlify Functions

## Overview

```
                 ┌──────────────────────── Netlify ────────────────────────┐
 Phone (PWA)     │                                                         │
 ┌───────────┐   │  CDN: static build (dist/)                              │
 │ App shell │◄──┼── index.html, JS, CSS, icons, beaches.json, sw.js       │
 │ + SW cache│   │                                                         │
 │           │──►│  /api/forecast   (function, CDN-cached ~20 min) ──────────────► Open-Meteo forecast + marine
 │ /console  │──►│  /api/auth/*     (function)                             │
 │           │──►│  /api/agents     (function, reads bundled agent list)   │
 │           │──►│  /api/agent/*    (functions + background function) ────────────► Claude API (Messages)
 │           │   │  /api/proposals/*/approve (function) ──────────────────────────► GitHub REST API (commit)
 └───────────┘   │  Netlify Blobs: sessions, jobs, proposals, rate counters│        │
                 │                                                         │        ▼
                 │  Git push to main ◄─────────────────────────────────────┼──── GitHub repo
                 │  → automatic build + deploy                             │
                 └─────────────────────────────────────────────────────────┘
```

## Two halves

1. **Beach Day (public)**: a static site with one small proxy function. It has no secrets and needs no login.
2. **Agent Console (private)**: password-gated pages and functions that hold the Anthropic and GitHub secrets. See `04-agent-console.md`.

They share one Netlify site and one repo, but are separate in code (`src/app/` vs `src/console/`, and `netlify/functions/forecast*` vs `netlify/functions/agent*`). Public pages never import console code.

## Repository layout (proposed)

```
/
├─ netlify.toml
├─ package.json
├─ src/
│  ├─ app/                 # Beach Day UI
│  ├─ console/             # Agent Console UI (lazy-loaded route /console)
│  ├─ shared/scoring.ts    # pure scoring module (used by function + UI + tests)
│  ├─ shared/openmeteo.ts  # request builders + response types
│  └─ data/beaches.json
├─ public/                 # manifest.webmanifest, icons, _headers
├─ netlify/functions/
│  ├─ forecast.mts
│  ├─ auth-login.mts / auth-logout.mts
│  ├─ agents.mts
│  ├─ agent-start.mts
│  ├─ agent-run-background.mts   # or config.background = true
│  ├─ agent-status.mts
│  └─ proposal-approve.mts
├─ .claude/agents/*.md     # the agent team (listed by the console)
├─ tests/                  # unit, function, e2e
└─ docs/
```

Tooling suggestion: **Vite + TypeScript** with no framework, or Preact if the team wants components. The bundle stays small, which helps on mobile. Netlify detects Vite. Set `publish = "dist"`.

## `netlify.toml` (starting point)

```toml
"$schema" = "https://open-api.netlify.com/netlify.schema.json"

[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
  # Make agent definitions readable at runtime by the agents/agent-run functions
  included_files = [".claude/agents/**"]

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(self), camera=(), microphone=()"
    Content-Security-Policy = "default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache"

[[headers]]
  for = "/console/*"
  [headers.values]
    Cache-Control = "no-store"
    X-Robots-Tag = "noindex"
```

Notes:

- `connect-src 'self'` works because the browser **only talks to our own functions**. Open-Meteo, Anthropic and GitHub are called server-side. If the team ever lets the browser call Open-Meteo directly, add `https://api.open-meteo.com https://marine-api.open-meteo.com` to the policy.
- `included_files` lets functions read `.claude/agents/*.md` at runtime. The alternative is a build step that turns those files into a generated `agents.json` module. **Prefer the build step**: it validates the frontmatter at build time and fails the deploy on a broken agent file.
- Function routes come from `export const config = { path: "/api/..." }` in each function file (modern Netlify Functions API). Rate limits must also go in that `config` object; **they cannot be set in `netlify.toml`**.
- Redirects and headers in `netlify.toml` apply to all deploy contexts. For per-context headers, use a `_headers` file in the publish directory. (Netlify docs)

## Netlify Functions: limits that shape the design

| Setting | Value | Configurable |
|---|---|---|
| Synchronous execution limit | **60 seconds** | No |
| Streaming response | **60 s** execution, **20 MB** response | No |
| Background function execution | **15 minutes** | No |

**Plan: Netlify Free (decision D3).** Functions, background functions, Blobs and per-function rate limits (aggregated per domain + IP) are all available on Free; site password protection and Basic-Auth headers are not relied on. Free has a monthly usage allowance, so CDN caching and the agent budgets are also there to stay inside it. If a limit is hit, the lead decides whether to upgrade.

Background functions are declared with `export const config = { background: true, path: ... }` (or the older `-background` filename suffix). The caller gets an **immediate `202`**, **no response body and no streaming**. On error, Netlify **retries after 1 minute and again 2 minutes later**. Background functions are available on credit-based plans (Free, Personal, Pro) and Enterprise.

Implications:

- `/api/forecast` finishes well under 1 s, so it is a normal function.
- **Agent chat** streams, but a turn can run longer than 60 s, especially when an agent reads files and drafts a multi-file change. The design in `04-agent-console.md` therefore runs agent work in a **background function** that writes progress to **Netlify Blobs**, and the browser polls a short status function.
- Background retries can run the same job twice, so jobs must be **idempotent**: check the job state before starting, and record the step reached.

## Netlify Blobs (state)

`@netlify/blobs` is a key/value store available to functions.

- `getStore(name)` opens a **site-wide** store that persists across deploys. `getDeployStore` is scoped to one deploy. Use site-wide stores.
- Methods: `set` (with `metadata`, `onlyIfMatch`, `onlyIfNew`), `setJSON`, `get(key, { type: "json" })`, `delete`, `list({ prefix })`.
- **Consistency is eventual by default (up to 60 s to propagate).** Use **`consistency: "strong"`** for anything read right after it is written, which here is job status, proposals and sessions. `getStore({ name, consistency: "strong" })` sets it for the whole store.
- There are **no atomic increments**: last write wins. Use the conditional writes (`onlyIfNew`, `onlyIfMatch` with an ETag) where it matters, such as "approve once", and accept approximate rate counters.
- Limits: store name ≤ 64 bytes, key ≤ 600 bytes, object ≤ 5 GB, metadata ≤ 2 KB.

Stores:

| Store | Key | Value |
|---|---|---|
| `sessions` | `sess:<random id>` | `{ createdAt, expiresAt, ipHash }` |
| `jobs` | `job:<uuid>` | `{ agent, status, events[], messages[], proposalId?, error? }` |
| `proposals` | `prop:<uuid>` | `{ agent, summary, files[{path, content, baseSha}], baseCommit, status }` |
| `ratelimit` | `rl:<bucket>:<yyyy-mm-dd>` | counters (approximate) |
| `login` | `fail:<ipHash>` | failed-login counter with timestamps |

## Forecast function (`/api/forecast`)

```
GET /api/forecast?beach=south-beach
```

1. Look up the beach in `beaches.json`. **Reject unknown IDs with 400.** The function only ever sends coordinates from our own list, so it cannot be used as an open proxy.
2. Call both Open-Meteo endpoints in parallel with fixed variable lists, `timezone=America/New_York`, °F/mph/inch, `forecast_days=7`, and `cell_selection=sea` for marine.
3. Merge the two by timestamp, run `scoring.ts`, and return `{ beach, generatedAt, days[{date, score, verdict, window, reasons, uv}], hours[...] }`. Also return the raw hourly values so the detail view needs no second call.
4. Cache headers: `Cache-Control: public, max-age=300` for the browser, plus `Netlify-CDN-Cache-Control: public, s-maxage=1200, stale-while-revalidate=600` so the CDN serves a beach for 20 minutes between upstream calls. With 11 beaches that is at most about 11 × 2 × 72 ≈ 1,600 upstream calls a day, under the 10,000/day free limit whatever the traffic. (Check the CDN cache-header names against Netlify's caching docs when implementing.)
5. If Open-Meteo fails or the marine data is missing, return the weather score and set `marine: null`. The UI says "Sea data unavailable" and redistributes the sea and water weights.
6. Attribution: the response includes `attribution: "Weather data by Open-Meteo.com (CC BY 4.0)"`, and the UI shows it.

Scoring runs on the server so that every client gets the same result, and the pure module is shared so the UI can rescore if the user changes a preference such as "I burn easily".

Why a proxy and not direct browser calls? A proxy gives CDN caching against the rate limits, a stable response shape if Open-Meteo changes, one origin for a strict CSP, and one place to add NWS rip-current data later. The cost is one small function.

## Environment variables

Set these in the Netlify UI or CLI, **never in `netlify.toml` or the repo**. Mark secrets as **"Contains secret values"**, which turns on Netlify's extra restrictions and secrets scanning.

| Variable | Scope | Used by |
|---|---|---|
| `ANTHROPIC_API_KEY` | **Functions only** | agent functions |
| `GITHUB_TOKEN` (fine-grained PAT) | **Functions only** | approve function, read-file tool |
| `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH` | Functions | approve function |
| `CONSOLE_PASSWORD_HASH` | **Functions only** | login |
| `SESSION_SECRET` | **Functions only** | cookie signing |
| `INTERNAL_JOB_SECRET` | **Functions only** | start → background function handoff |
| `AGENT_DAILY_BUDGET` (number) | Functions | rate limiting |

**Scope secrets to Functions, not Builds.** If a variable is in the Builds scope, any build script or dependency `postinstall` can read it, and a bundler can inline it into client JavaScript. Keeping secrets out of the build is a second defence after the path allow-list in `04-agent-console.md`. Read them inside functions with `Netlify.env.get("NAME")` or `process.env.NAME`.

Contexts: use a **separate, low-limit Anthropic key** and **no GitHub token** for Deploy Previews and branch deploys, so a preview can never commit.

## Deploy flow

1. The GitHub repo is connected to Netlify, with **production branch = `main`**. Every push to `main` builds and deploys (Netlify continuous deployment).
2. An Agent Console approval commits to `main` through the GitHub API. The push triggers the normal Netlify build, and the site updates in about a minute.
3. If the build fails, Netlify keeps the previous deploy live. Show the deploy state in the console. A Netlify read-only API token is optional and not needed for v1; a link to the Netlify deploys page is enough.
4. Rollback: use **Publish deploy** on an earlier deploy in Netlify, or `git revert` the agent commit.

## Sources

- Netlify, *Functions configuration* (60 s / 15 min / 20 MB limits): https://docs.netlify.com/build/functions/configuration/
- Netlify, *Functions API reference* (streaming limits, `config.rateLimit`): https://docs.netlify.com/build/functions/api/
- Netlify, *Background Functions*: https://docs.netlify.com/build/functions/background-functions/
- Netlify, *Netlify Blobs*: https://docs.netlify.com/build/data-and-storage/netlify-blobs/
- Netlify, *Environment variables overview*: https://docs.netlify.com/build/environment-variables/overview/
- Netlify, *File-based configuration* (`netlify.toml`): https://docs.netlify.com/build/configure-builds/file-based-configuration/
- Netlify, *Custom headers*: https://docs.netlify.com/manage/routing/headers/
- Netlify, *Create deploys* (Git continuous deployment, build hooks): https://docs.netlify.com/deploy/create-deploys/
- Netlify, *Rate limiting*: https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/
- Open-Meteo docs and terms: see `01-use-case-and-beach-scoring.md`
