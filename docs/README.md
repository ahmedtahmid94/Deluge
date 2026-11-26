# Beach Day — research docs

Beach Day is a mobile-first **Progressive Web App on Netlify**. You pick a South Florida beach and see whether today and the next few days are good beach days. It uses the free **Open-Meteo** forecast and marine APIs, which need no API key. The deployed app also contains a password-gated **Agent Console**: you can chat with the agents defined in `.claude/agents/`, and an agent can propose code changes that are committed to GitHub, and so redeployed, **only after a human clicks Approve**.

These docs are the shared context for the team of expert agents that will build the app. Read this index first, then the file for your area.

## Index

| # | Doc | Read it if you are working on |
|---|---|---|
| 01 | [Use case and beach-day scoring](01-use-case-and-beach-scoring.md) | Product, the scoring module, Open-Meteo integration, beach data, safety copy |
| 02 | [PWA installability and native wrappers](02-pwa-installability.md) | Manifest, icons, service worker, iOS/Android install UX, the Capacitor question |
| 03 | [Architecture: static site + Netlify Functions](03-architecture.md) | Repo layout, `netlify.toml`, functions, Netlify Blobs, env vars, deploy flow |
| 04 | [Agent Console: design, security, long jobs](04-agent-console.md) | Agent listing, chat over the Claude API, propose/approve/commit, auth, tokens, allow-list, rate limits, background jobs |
| 05 | [Testing and accessibility](05-testing-and-accessibility.md) | Vitest, Playwright, axe, security tests, WCAG 2.2 AA |

## Key decisions (summary)

1. **A PWA, not a native app, for v1.** Everything needed works on the web. iOS has no install prompt, so we show an "Add to Home Screen" hint. Capacitor only becomes worth it for store listing, widgets, background location or reliable scheduled notifications. → 02
2. **Score hours, then summarise days.** Hard safety gates come first: lightning (WMO codes 95/96/99), NWS heat-index danger at 103 °F, and very rough sea. Then weighted comfort: rain, sky, wind (Beaufort), feels-like, sea, water temperature. UV is shown as EPA advice, not a penalty. The output is a verdict, a best time window and plain-language reasons. → 01
3. **The browser talks only to our own origin.** `/api/forecast` proxies Open-Meteo for a fixed list of beaches, scores the forecast, and is CDN-cached for about 20 minutes. That keeps us well inside the free limits (10,000 calls/day, non-commercial, CC BY 4.0 attribution required) and allows a strict CSP. → 03
4. **All agent work runs in a Netlify background function** (15 min limit, immediate 202, no streaming, retried on failure). Progress goes to Netlify Blobs with strong consistency, and the browser polls a short status function. Synchronous and streaming functions are capped at 60 s, too short for agent jobs that use tools. Jobs are idempotent and time-boxed. → 03, 04
5. **Agents propose; humans commit.** Agents get read-only repo tools plus `propose_changes`, which only stores a proposal. **Approve** re-validates the proposal and commits it atomically to `main` through the GitHub Git Data API with `force: false`. Netlify then redeploys from the push. → 04
6. **Security is enforced in code, not in prompts:**
   - a password gate (scrypt hash, `__Host-` HttpOnly SameSite=Strict session cookie, rate-limited login);
   - a fine-grained GitHub token for **this repo only** (Contents read/write and Metadata read; **no Workflows**; 90-day expiry);
   - a **path allow-list** that blocks functions, config, headers, package manifests, scripts and CI, so an agent cannot widen its own access;
   - secrets in **Functions-scoped** env vars only, and a CI scan of the build output for leaked keys;
   - Netlify per-function `rateLimit`, a daily budget, and an Anthropic spend limit. → 04
7. **Agent metadata comes from `.claude/agents/*.md`** (Claude Code subagent format: `name` and `description` required, optional `model` of `sonnet`/`opus`/`haiku`/`fable`/full ID/`inherit`). "Personality" is a `## Personality` section in the body. A build step validates the files and emits public metadata; the console maps model aliases to API IDs (default `claude-opus-5-5`). → 04
8. **WCAG 2.2 AA:**
   - verdicts never rely on colour alone;
   - tap targets of at least 24 px (44 px for primary controls);
   - focus is never hidden behind toasts or the sticky header;
   - axe runs with the `wcag22aa` tag;
   - manual VoiceOver and TalkBack passes before each release. → 05

## Open questions for the team

- **Rip-current risk:** add NWS Surf Zone Forecast or alert data, from NWS Miami and NWS Key West, in v1.1? It is the biggest safety gap. (01)
- **Marine `forecast_days`:** the Open-Meteo docs disagree on the maximum. Check against the live API and handle partial days. (01)
- **Beach coordinates** in the seed list are approximate. Check them on a map, and add offshore marine points where needed. (01)
- **Branch protection on `main`:** v1 commits directly. Switching to PR + Deploy Preview needs an extra token permission (Pull requests: write). (04)
- **Scoring heuristics** (wave, gust and water-temperature thresholds and the weights) are our assumptions, not official values. Tune them with real days and user feedback. (01)
- **Netlify CDN cache headers:** confirm the exact `Netlify-CDN-Cache-Control` behaviour while implementing `/api/forecast`. (03)

## How these docs were researched

The research used the official documentation for each area:

- the Open-Meteo forecast API, marine API and terms;
- MDN's PWA guides on installability, the manifest and caching;
- Netlify's docs on functions configuration and limits, background functions, Blobs, environment variables, rate limiting, `netlify.toml`, headers and deploys;
- the Claude API docs on streaming, the Messages API, models and tool use, plus the Claude Code subagent docs;
- the GitHub REST docs on repository contents, Git trees and fine-grained personal access tokens.

Safety thresholds come from NWS (lightning, heat index, rip-current outlooks), the EPA (UV index) and NOAA (Beaufort scale). Each doc ends with its sources.

This session's sandbox could not reach some sites directly, so pages were read through a web-scraping service. Two gaps came out of that:

- The Netlify *Functions overview* page did not render its limits table. The limits were taken from Netlify's *Functions configuration* and *Functions API* pages instead.
- The Open-Meteo terms page did not say how multi-variable or multi-location requests are counted.

Check numbers that matter (limits, model IDs, API parameters) against the live docs when implementing, because they change.
