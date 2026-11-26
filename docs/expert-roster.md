# Beach Day — expert roster

The agent team that designs, builds, tests and deploys Beach Day and runs its Agent Console.

**Fixed decision:** Beach Day is a **PWA on Netlify**:

- a static front end;
- **Netlify Functions** for the Open-Meteo, Claude and GitHub calls;
- Netlify Blobs for state;
- **no other servers**.

Every agent works inside that boundary. A proposal that adds a server, database or hosting provider is out of scope unless the human lead changes this decision.

Background research is in `docs/01`–`05` and indexed in `docs/README.md`.

---

## 1. Roster

Eleven roles are required. Two more are added because this app really needs them (see *Why the two extra roles*).

| # | Agent file (`.claude/agents/`) | Persona | Job description |
|---|---|---|---|
| 1 | `orchestrator` | — | Runs the team: turns the lead's goals into tasks, assigns them to the right expert, sequences the work, and assembles results into reviewed proposals for the human to approve. |
| 2 | `meta-agent` (meta agent) | — | Builds and improves the agents themselves: writes and revises `.claude/agents/*.md`, keeps the roster, skills and prompts consistent, and tunes agents from their results. |
| 3 | `software-architect` | — | Owns the overall design: repo structure, module boundaries, data contracts and the static + Functions architecture, and keeps every change inside the "no other servers" decision. |
| 4 | `open-meteo-integrator` | — | Integrates the Open-Meteo Forecast and Marine APIs: request building, response types, caching, rate limits, attribution and graceful handling of missing marine data. |
| 5 | `beach-conditions-analyst` *(added)* | — | Owns the beach-day scoring model and safety wording: thresholds, weights, gates, best-window logic and the sources behind them. |
| 6 | `pwa-engineer` (mobile/PWA expert) | — | Builds the installable mobile front end: manifest, icons, service worker, offline and update flows, and iOS/Android install behaviour. |
| 7 | `ui-designer-apple-liquid-glass` | **Sable** | Designs Beach Day's visual layer in Apple's Liquid Glass style: translucent materials, depth, colour, type and motion, with readable contrast and reduced-transparency fallbacks. |
| 8 | `ux-designer-apple-hig` | **Wren** | Designs flows and interactions to Apple's Human Interface Guidelines: picking a beach, reading the verdict, day detail, install hints, and the console's chat-review-approve flow. |
| 9 | `accessibility-specialist` *(added)* | — | Makes and keeps the app WCAG 2.2 AA: reviews designs and code, writes axe and keyboard tests, and runs the VoiceOver and TalkBack passes. |
| 10 | `agent-console-engineer` | — | Builds the Agent Console: agent listing, Claude API chat from Netlify Functions, background jobs, proposals, and the approve-to-commit flow through the GitHub API. |
| 11 | `security-engineer` | — | Threat-models and reviews everything: the password gate, the fine-grained GitHub token, the path allow-list, secret handling, CSP, rate limits and prompt-injection defences. |
| 12 | `netlify-engineer` | — | Owns Netlify: `netlify.toml`, function config and limits, Blobs, environment variables and scopes, caching headers, deploy contexts, deploys and rollbacks. |
| 13 | `qa-engineer` | — | Owns quality: the test strategy, Vitest unit and function tests, Playwright end-to-end tests on phone viewports, CI checks, and release sign-off. |

### Why the two extra roles

- **`beach-conditions-analyst`.** The score *is* the product, and parts of it are safety-relevant: lightning, heat, rough surf and missing rip-current data. Fetching the data (the integrator's job) and judging what it means for a person on a beach are different skills. Without an owner, thresholds drift and safety wording gets weakened.
- **`accessibility-specialist`.** WCAG 2.2 AA is a stated requirement, and the chosen visual style creates real risk: translucent Liquid Glass surfaces over photos or gradients can fail contrast. A dedicated reviewer balances Sable's and Wren's designs against it, and QA alone would only catch problems after they are built.

### Roles considered and not added

| Role | Why not |
|---|---|
| Backend engineer | There are no other servers. The function code is split between the integrator, the console engineer and the Netlify engineer. |
| DevOps / SRE | Netlify handles hosting, TLS, CDN and deploys; the Netlify engineer covers the rest. |
| Database engineer | Netlify Blobs is a simple key/value store owned by the Netlify engineer. There is no schema work to justify a role. |
| Product manager | The human lead sets goals and the orchestrator turns them into tasks. |
| Prompt engineer | The meta agent owns prompts for the team. The console engineer owns the console's runtime prompts (`CONSOLE_RULES`). |
| Technical writer | Each expert documents their own area in `docs/`, and the orchestrator keeps `docs/README.md` current. |
| Native iOS/Android (Capacitor) engineer | Out of scope by decision (see `02-pwa-installability.md`). The PWA engineer flags when a native need appears. |

### Working rules for every agent

1. **Agents propose; the human approves.** No agent commits. Code changes go through the console's `propose_changes`, or through a reviewed change in a Claude Code session.
2. **Stay inside the path allow-list** in `04-agent-console.md`. Changes to `netlify/**`, `netlify.toml`, package manifests, `scripts/**` and `.github/**` are made by humans. The Netlify, security and console engineers *design* those changes and hand them to the lead.
3. **Every change states its reviewers.** The table in section 3 says who must review what.

---

## 2. Skills, and which agents share them

Each skill has a short definition and the agents that need it. **Owner** is the agent accountable for it; **Also** lists the agents that need working knowledge.

### A. Leadership and team

| Skill | What it means here | Owner | Also |
|---|---|---|---|
| Task breakdown and planning | Split goals into small tasks; order them by dependency | orchestrator | software-architect, meta-agent |
| Delegation and routing | Know each agent's remit and send work to the right one | orchestrator | meta-agent |
| Review aggregation | Gather reviews and resolve disagreements before a proposal reaches the human | orchestrator | software-architect |
| Agent definition authoring | Write `.claude/agents/*.md` frontmatter (`name`, `description`, `tools`, `model`, …) and system prompts with a `## Personality` section | meta-agent | orchestrator, agent-console-engineer |
| Prompt design and evaluation | Clear instructions, examples, failure analysis, before/after comparisons on real tasks | meta-agent | agent-console-engineer, orchestrator |
| Least-privilege tool scoping | Give each agent only the tools it needs | meta-agent | security-engineer |

### B. Architecture and code

| Skill | What it means here | Owner | Also |
|---|---|---|---|
| Static + serverless architecture | Static front end plus Netlify Functions; no other servers | software-architect | netlify-engineer, agent-console-engineer, open-meteo-integrator |
| TypeScript and modern JavaScript | Strict TypeScript, ES modules, small dependency-light code | software-architect | pwa-engineer, open-meteo-integrator, agent-console-engineer, netlify-engineer, qa-engineer, beach-conditions-analyst |
| Vite build tooling | Build config, environment handling, bundle size | pwa-engineer | software-architect, netlify-engineer |
| Data contracts and typing | Response types for `/api/forecast`, jobs and proposals; validation at boundaries | software-architect | open-meteo-integrator, agent-console-engineer, beach-conditions-analyst |
| Pure, testable domain modules | Keep `scoring.ts` and the allow-list free of I/O | software-architect | beach-conditions-analyst, qa-engineer, security-engineer |

### C. Weather and beach domain

| Skill | What it means here | Owner | Also |
|---|---|---|---|
| Open-Meteo Forecast API | Variables, units, `timezone`, multiple coordinates, model selection, WMO weather codes | open-meteo-integrator | beach-conditions-analyst |
| Open-Meteo Marine API | Waves, swell, sea temperature, `cell_selection=sea`, coastal-accuracy limits, partial days | open-meteo-integrator | beach-conditions-analyst |
| API rate limits and caching | Free-tier limits, CDN caching, stale-while-revalidate, CC BY 4.0 attribution | open-meteo-integrator | netlify-engineer, pwa-engineer |
| Meteorology for beachgoers | Lightning, heat index, wind (Beaufort), UV (EPA), surf and how forecasts degrade with lead time | beach-conditions-analyst | open-meteo-integrator, ux-designer-apple-hig |
| Scoring model design | Gates, weights, bands, best window, explainable reasons, tuning from fixtures | beach-conditions-analyst | qa-engineer, software-architect |
| Safety communication | Disclaimers, rip-current links to NWS, lightning wording that cannot be misread | beach-conditions-analyst | ux-designer-apple-hig, security-engineer |

### D. Mobile, PWA and front end

| Skill | What it means here | Owner | Also |
|---|---|---|---|
| Web app manifest and icons | Installability fields, maskable and apple-touch icons, `id`/`start_url`/`scope` | pwa-engineer | ui-designer-apple-liquid-glass |
| Service workers and caching | Versioned precache, stale-while-revalidate for forecasts, network-only for the console, update toast | pwa-engineer | netlify-engineer, security-engineer, qa-engineer |
| iOS and Android install behaviour | `beforeinstallprompt` on Android; Add to Home Screen hint on iOS; standalone mode, safe areas, storage eviction | pwa-engineer | ux-designer-apple-hig, qa-engineer |
| Offline and poor-network UX | Cached forecasts with age labels, offline states, retries | pwa-engineer | ux-designer-apple-hig |
| Front-end implementation | Semantic HTML, CSS (custom properties, `backdrop-filter`, container queries), small components | pwa-engineer | agent-console-engineer, ui-designer-apple-liquid-glass, accessibility-specialist |
| Mobile web performance | Small bundles, fast first render on slow phones | pwa-engineer | software-architect, qa-engineer |
| Native-wrapper judgement (Capacitor) | Recognise when a need (widgets, background location, store listing) requires going native | pwa-engineer | software-architect |

### E. Design

| Skill | What it means here | Owner | Also |
|---|---|---|---|
| Apple Liquid Glass visual language | Translucent layered materials, depth, light, rounded shapes, motion; web approximations with `backdrop-filter` | ui-designer-apple-liquid-glass (Sable) | pwa-engineer |
| Apple Human Interface Guidelines | Navigation patterns, tap targets, typography scale, system behaviours, platform expectations | ux-designer-apple-hig (Wren) | ui-designer-apple-liquid-glass, accessibility-specialist |
| Visual design system | Colour tokens (light/dark), type ramp, spacing, verdict colours, iconography, design tokens as CSS variables | ui-designer-apple-liquid-glass (Sable) | pwa-engineer, accessibility-specialist |
| Interaction and flow design | Beach picking, verdict and day detail, install hints, the console's chat → review → approve flow, empty and error states | ux-designer-apple-hig (Wren) | agent-console-engineer, pwa-engineer |
| Information design for forecasts | Making a score, a best window and reasons readable at a glance; lower confidence for later days | ux-designer-apple-hig (Wren) | beach-conditions-analyst, ui-designer-apple-liquid-glass |
| UX writing | Short, plain, calm wording for verdicts, warnings, errors and confirmations | ux-designer-apple-hig (Wren) | beach-conditions-analyst, ui-designer-apple-liquid-glass |
| Motion with restraint | Purposeful animation that honours `prefers-reduced-motion` and reduced transparency | ui-designer-apple-liquid-glass (Sable) | accessibility-specialist |

### F. Accessibility

| Skill | What it means here | Owner | Also |
|---|---|---|---|
| WCAG 2.2 AA | Contrast, target size (2.5.8), focus not obscured (2.4.11), accessible authentication (3.3.8), reflow | accessibility-specialist | ux-designer-apple-hig, ui-designer-apple-liquid-glass, qa-engineer, pwa-engineer |
| Contrast on translucent surfaces | Measure text contrast over glass on worst-case backgrounds; solid fallbacks | accessibility-specialist | ui-designer-apple-liquid-glass |
| ARIA patterns and live regions | Combobox, dialog, `role="log"` chat, polite announcements for streaming and status | accessibility-specialist | agent-console-engineer, pwa-engineer |
| Assistive-technology testing | VoiceOver (iOS), TalkBack (Android), keyboard-only, 200 % zoom, large system text | accessibility-specialist | qa-engineer |
| Automated a11y testing | axe-core with the `wcag22aa` tag; focus-obscured checks in Playwright | accessibility-specialist | qa-engineer |

### G. Agent Console and AI integration

| Skill | What it means here | Owner | Also |
|---|---|---|---|
| Claude Messages API | Models and IDs, system prompts, adaptive thinking and effort, `stop_reason` handling including refusals, prompt caching | agent-console-engineer | meta-agent |
| Claude tool use | Strict JSON-schema tools (`read_file`, `list_files`, `propose_changes`), tool loop, `is_error` results, iteration caps | agent-console-engineer | meta-agent, security-engineer |
| Claude streaming | Server-sent event order, buffered progress writes, error events | agent-console-engineer | netlify-engineer |
| Long-running job design | Background function plus Blobs plus polling; idempotent retries, heartbeats, time budget, pause/continue | agent-console-engineer | netlify-engineer, software-architect |
| GitHub REST API (contents and Git data) | Read files; atomic multi-file commits (ref → tree → commit → ref with `force: false`); conflict detection | agent-console-engineer | security-engineer |
| Diff and review UI | Per-file diffs, accessible add/remove markers, confirmation before commit | agent-console-engineer | ux-designer-apple-hig, accessibility-specialist |
| Model and cost management | Model mapping from agent frontmatter, budgets, usage tracking | agent-console-engineer | meta-agent, orchestrator |

### H. Security

| Skill | What it means here | Owner | Also |
|---|---|---|---|
| Threat modelling | Strangers, leaked secrets, an agent widening its own access, prompt injection, replay, CSRF | security-engineer | software-architect, agent-console-engineer |
| Authentication and sessions | scrypt password hash, `__Host-` HttpOnly SameSite=Strict cookies, lockout, CSRF tokens, Origin checks | security-engineer | agent-console-engineer |
| Secrets management | Functions-scoped secret env vars, rotation, no secrets in the bundle or logs, build-output scans | security-engineer | netlify-engineer, agent-console-engineer |
| GitHub fine-grained tokens | One repo, Contents read/write and Metadata read, no Workflows, expiry and rotation | security-engineer | agent-console-engineer |
| Path allow-list enforcement | Normalisation, traversal and file-mode rejection, deny lists, size limits, tests | security-engineer | agent-console-engineer, qa-engineer |
| Prompt-injection defence | Controls in code, not in prompts; repo text treated as data; the human approval gate | security-engineer | agent-console-engineer, meta-agent |
| Web security headers | CSP, `frame-ancestors`, `nosniff`, no-store on the console | security-engineer | netlify-engineer |
| Abuse and spend control | Netlify `rateLimit`, daily budget, concurrency caps, Anthropic spend limit | security-engineer | netlify-engineer, agent-console-engineer |

### I. Netlify platform

| Skill | What it means here | Owner | Also |
|---|---|---|---|
| `netlify.toml` and build config | Build command, publish dir, functions dir, `included_files`, headers, redirects | netlify-engineer | software-architect |
| Netlify Functions | Modern `config` (`path`, `rateLimit`, `background`), 60 s sync and streaming limits, 15 min background limit, retries | netlify-engineer | agent-console-engineer, open-meteo-integrator |
| Netlify Blobs | Site-wide stores, strong vs eventual consistency, conditional writes, no atomic increments | netlify-engineer | agent-console-engineer |
| Environment variables and contexts | Scopes (Builds vs Functions), "contains secret values", per-context values for previews | netlify-engineer | security-engineer |
| CDN caching | Browser vs CDN cache headers, cache keys, stale-while-revalidate | netlify-engineer | open-meteo-integrator, pwa-engineer |
| Deploys, previews and rollback | Git-triggered deploys from `main`, Deploy Previews, failed-build behaviour, publishing an earlier deploy | netlify-engineer | qa-engineer, orchestrator |
| Local development (`netlify dev`) | Running functions and the local Blobs sandbox | netlify-engineer | qa-engineer, agent-console-engineer, open-meteo-integrator |

### J. Quality

| Skill | What it means here | Owner | Also |
|---|---|---|---|
| Test strategy | The pyramid in `05-testing-and-accessibility.md`; what must be tested before approval | qa-engineer | software-architect, orchestrator |
| Unit and function tests (Vitest) | Scoring fixtures, allow-list tables, function handlers with fake Anthropic, GitHub and Blobs clients | qa-engineer | beach-conditions-analyst, security-engineer, agent-console-engineer, open-meteo-integrator |
| End-to-end tests (Playwright) | Phone device presets, `page.route` mocks, offline and service-worker update flows, console flows | qa-engineer | pwa-engineer, accessibility-specialist |
| Contract testing | Recorded Open-Meteo fixtures plus a scheduled live check | qa-engineer | open-meteo-integrator |
| CI and release gates | Required checks, bundle secret scan, header smoke test on Deploy Previews, sign-off | qa-engineer | netlify-engineer, security-engineer |
| Real-device testing | Install, launch and update on a real iPhone and Android phone | qa-engineer | pwa-engineer, accessibility-specialist |

---

## 3. Who reviews what

| Change touches | Must review | Should review |
|---|---|---|
| Scoring, thresholds, safety copy | beach-conditions-analyst, qa-engineer | ux-designer-apple-hig |
| Open-Meteo requests, caching | open-meteo-integrator, netlify-engineer | software-architect |
| Manifest, service worker, install UX | pwa-engineer, qa-engineer | security-engineer (cache rules) |
| Visual design and components | ui-designer-apple-liquid-glass, accessibility-specialist | ux-designer-apple-hig |
| Flows and copy | ux-designer-apple-hig, accessibility-specialist | beach-conditions-analyst |
| Agent Console (UI or functions) | agent-console-engineer, security-engineer | accessibility-specialist |
| Auth, tokens, allow-list, headers, rate limits | security-engineer | netlify-engineer, agent-console-engineer |
| Netlify config, env vars, deploys (*human-applied*) | netlify-engineer, security-engineer | software-architect |
| `.claude/agents/*.md` | meta-agent, orchestrator | security-engineer (tools and permissions) |
| Architecture or new dependency (*human-applied*) | software-architect, security-engineer | netlify-engineer |
| Anything going to Approve | orchestrator (gathers the reviews above) | — |

---

## 4. Skills shared most widely

These are the skills that need common conventions and docs, because most of the team depends on them:

| Skill | Shared by |
|---|---|
| TypeScript and modern JavaScript | 7 agents |
| WCAG 2.2 AA | 5 agents |
| Unit and function tests (Vitest) | 5 agents |
| Static + serverless architecture | 4 agents |
| Service workers and caching | 4 agents |
| Netlify Functions | 3 agents |
| Long-running job design | 3 agents |
| Apple HIG | 3 agents |
| Secrets management | 3 agents |
| Path allow-list enforcement | 3 agents |

`meta-agent` should turn the most shared of these into reusable Claude Code skills (`.claude/skills/`) so each agent loads the same guidance. Candidates:

- `netlify-functions`
- `open-meteo`
- `wcag22-checks`
- `vitest-fixtures`
- `path-allowlist`
