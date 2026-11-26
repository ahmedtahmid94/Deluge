# Agent knowledge

Each agent in `.claude/agents/` has its own folder here:

```
knowledge/<agent-name>/
  docs/       reference notes taken from official documentation, each with its source link and retrieval date
  examples/   2–3 small worked examples of what good looks like, with a README saying how each was verified
```

Every agent file has a **"Before you answer"** section that tells the agent to read every file in its folder first, and to prefer these notes over memory.

## Sources by agent

| Agent | Official sources in `docs/` |
|---|---|
| orchestrator | Claude Code docs: subagents (running in parallel, background, chaining, limits, `--agent`) |
| meta-agent | Claude Code docs: subagents and skills (formats, preloading, invocation rules) |
| software-architect | Netlify docs (limits, caching, env scopes), Vite env docs, TypeScript TSConfig reference |
| open-meteo-integrator | open-meteo.com Forecast and Marine API docs, terms; **live API responses** |
| beach-conditions-analyst | NWS (lightning, heat index, rip currents), EPA UV Index, NOAA WPC Beaufort scale, Open-Meteo |
| pwa-engineer | MDN (installable, manifest, service workers, caching, `beforeinstallprompt`), web.dev Learn PWA |
| ui-designer-apple-liquid-glass (Sable) | Apple HIG: Materials and Liquid Glass, Color, Typography, Motion, Accessibility |
| ux-designer-apple-hig (Wren) | Apple HIG: Tab bars, Sheets, Alerts, Writing, Layout, Accessibility |
| accessibility-specialist | W3C *Understanding WCAG 2.2* (2.5.8, 2.4.11, 1.4.3, 3.3.8, 4.1.3), WAI-ARIA APG dialog, Playwright accessibility testing |
| agent-console-engineer | Claude Platform docs (models, Messages, streaming, tool use), GitHub REST (contents, refs, commits, trees) |
| security-engineer | OWASP cheat sheets (passwords, sessions, CSRF, HTTP headers), OWASP Path Traversal, OWASP LLM01 prompt injection, GitHub fine-grained PAT docs |
| netlify-engineer | Netlify docs: Functions API and limits, background functions, rate limiting, env vars, Blobs, headers, caching |
| qa-engineer | Playwright docs (best practices, emulation, mocking, service workers), Vitest mocking guide |

Pages were read on 2026-11-25/26 through a scraping service, because this environment can't reach most sites directly. Where a page didn't render (the Claude Messages API reference), the note says so and names its fallback source.

## Verification

`./verify.sh` reruns every example that needs no npm install (Node 22 with `--experimental-strip-types`, plus the preinstalled Playwright Chromium). It also prints how to run the four examples that need extra packages.

Run on 2026-11-26:
- every example passed;
- the extra-package examples (axe, Blobs, Vitest, `@playwright/test`) were also run and passed, using the versions noted in each examples README.

## Findings from the verification (now reflected in docs and skills)

| Finding | Where it came from | Fixed in |
|---|---|---|
| Marine `sea_surface_temperature` stays **°C** with `length_unit=imperial` | Live Open-Meteo response | `open-meteo-marine-api` skill, docs/01 |
| `timezone` ignores DST changes inside the requested range; use `timeformat=unixtime` | Open-Meteo docs | `open-meteo-forecast-api` skill |
| An all-day-rain day scored "Fair" under the first scoring spec | Scoring the live fixture | Steady-rain gate and no-window cap: docs/01, `beach-scoring-model` |
| **Netlify Free can't scope env vars to Functions** ("Pro plan and above") | Netlify docs | docs/03, docs/README (new open decision), env and secret skills, CLAUDE.md |
| scrypt minimum is N=2^17, r=8, p=1, and Node needs a raised `maxmem` | OWASP and running the example | `auth-sessions` skill |
| Session needs an idle (30 min) **and** an absolute (8 h) timeout; use a signed CSRF token plus `Sec-Fetch-Site` | OWASP | `auth-sessions` skill, docs/04 |
| Blobs: `onlyIfMatch` with an undefined ETag is unconditional; concurrent CAS wasn't atomic in the local server | Running `@netlify/blobs` locally | `netlify-blobs` skill |
| `page.route` doesn't see requests a service worker handles | Playwright docs | `playwright-e2e` skill |
| `scroll-padding` alone doesn't stop a fixed toast hiding the last controls | axe + focus check | `wcag-22-aa` skill |
| White glass under 39 % opacity fails 4.5:1 over the deep-sea background | Contrast example | `translucent-contrast` skill |
