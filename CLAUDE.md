# Beach Day — team guide

Beach Day is a mobile-first **PWA on Netlify** that tells you whether today and the next few days are good beach days at a South Florida beach. It uses the free Open-Meteo Forecast and Marine APIs. A password-gated **Agent Console** inside the app lets the lead chat with this team's agents and approve the code changes they propose.

- **Architecture (fixed):** a static Vite front end, **Netlify Functions** for all Open-Meteo, Claude and GitHub calls, Netlify Blobs for state, and **no other servers**.
- **Docs:** start at `docs/README.md`. It holds the index and the lead's decisions. The team roster is `docs/expert-roster.md`.

## Lead decisions (these override everything else)

| | Decision |
|---|---|
| D1 | **No rip-current proxy.** Never estimate or imply rip-current risk; link out to the National Weather Service for every beach. |
| D2 | **Approve commits straight to `main`.** No PR or branch flow for console approvals. |
| D3 | **Netlify Free plan** for now. Use only Free features and stay within its allowance. |
| D4 | **Fine-grained personal access token** for GitHub: this repo only, Contents read/write and Metadata read, no Workflows. |

## The team

The agents are in `.claude/agents/` and their skills in `.claude/skills/`. Each agent preloads its skills through the `skills:` field.

| Agent | Role |
|---|---|
| `orchestrator` | Runs the team: plans, launches experts in parallel, routes all handoffs, gathers reviews, reports to the lead |
| `meta-agent` | Builds and improves the agents and skills |
| `software-architect` | Structure, contracts, the "no other servers" boundary |
| `open-meteo-integrator` | Forecast and Marine API integration, caching, attribution |
| `beach-conditions-analyst` | Scoring model, thresholds, safety wording |
| `pwa-engineer` | Front end, manifest, service worker, install and offline |
| `ui-designer-apple-liquid-glass` (**Sable**) | Visual design in Apple's Liquid Glass style |
| `ux-designer-apple-hig` (**Wren**) | Flows, interaction and copy to Apple's HIG |
| `accessibility-specialist` | WCAG 2.2 AA reviews and tests |
| `agent-console-engineer` | Agent Console: Claude API, jobs, proposals, GitHub commits |
| `security-engineer` | Threat model, auth, token, allow-list, headers, rate limits |
| `netlify-engineer` | Netlify config, functions, Blobs, env vars, caching, deploys |
| `qa-engineer` | Tests, CI gates, real-device checks, release sign-off |

## How the team works

**Start a team session with the orchestrator as the main agent:**

```bash
claude --agent orchestrator
```

The orchestrator's `tools` list (`Agent(...)`) restricts it to calling the twelve experts. That restriction only applies when it runs as the main session agent.

1. **The orchestrator runs experts in parallel.** It splits a goal into tasks, groups independent tasks into batches, and launches each batch at once: one message with several Agent calls. Dependent tasks run in sequence. Reviews also run in parallel.
2. **Agents hand work to each other only through the orchestrator.**
   - Experts don't have the `Agent` tool and never call one another.
   - An expert finishes its task and returns a Handoff block. If another expert must act next, the expert names it under `next:`.
   - The orchestrator decides, then briefs that expert with the context it needs. Each expert starts with a fresh context and does not see earlier conversations, so the brief must stand alone.
3. **Reviews before approval.** The orchestrator collects the required reviews (`docs/expert-roster.md` section 3) and merges them before anything reaches the lead or the console's Approve button.
4. **Humans commit.**
   - Agents never commit or push.
   - In the Agent Console, a proposal is committed only when the lead clicks Approve.
   - Changes to `netlify/**`, `netlify.toml`, `public/_headers`, `public/_redirects`, package manifests and lockfiles, `scripts/**`, `.github/**`, `vite.config.*`, `tsconfig*.json`, `src/console/server/**`, `src/shared/models.ts` and this file are **drafted by experts and applied by the lead**. They are on the console's deny-list (`docs/04`, section 5).

### Handoff block (every expert ends with this)

```
## Handoff
status: done | blocked | needs-review
summary: <one or two sentences>
files: <paths created or changed, or "none">
decisions: <choices made, with reasons, or "none">
tests: <what was run and the result, or "not run" with the reason>
open-questions: <for the lead or orchestrator, or "none">
next: <agent name>: <what they need to do, and which outputs to pass them>  (repeat per agent, or "none")
human-apply: <changes the lead must apply by hand, or "none">
```

Reviewers add `verdict: approve | approve-with-nits | changes-required` and findings as `severity — file:line — issue — fix`.

## Working rules for everyone

- Read the relevant `docs/` file before working. Keep docs accurate when you change behaviour.
- **Code:** strict TypeScript, pure domain modules in `src/shared/`, and validation at every boundary.
- **Secrets:** none in the browser, the repo, logs or docs. They are Functions-scoped Netlify env vars, referred to by name only.
- **Accessibility:** WCAG 2.2 AA is required. Verdicts and diffs never rely on colour alone.
- **Safety:** never call a day "safe"; follow the safety-communication rules; decision D1 always applies.
- **Tests:** never skip or weaken a test to get green. Report failures.
- **Sources:** for model IDs, API parameters and platform limits, check the official docs; don't rely on memory.

## Maintaining the team

`meta-agent` owns `.claude/agents/` and `.claude/skills/` and keeps them in sync with `docs/expert-roster.md`, including each agent's `skills:` list (owner and shared-with), which may not exceed 32 skills. After editing, validate with:

```bash
claude plugin validate .claude/agents
```
