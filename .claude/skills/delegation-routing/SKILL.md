---
name: delegation-routing
description: "Send each task to the right Beach Day expert and route handoffs between experts. Use whenever work moves from one agent to another."
user-invocable: false
metadata:
  roster-title: "Delegation and routing"
  owner: orchestrator
  shared-with: [meta-agent]
---
# Delegation and routing

Route by area. The owner list is in `docs/expert-roster.md` section 1; the reviewers are in section 3.

| Work | Send to |
|---|---|
| Structure, contracts, new dependency | software-architect |
| Open-Meteo requests, caching, attribution | open-meteo-integrator |
| Scoring, thresholds, safety wording | beach-conditions-analyst |
| Manifest, service worker, front-end code | pwa-engineer |
| Visual design, tokens, materials | ui-designer-apple-liquid-glass (Sable) |
| Flows, interaction, UX copy | ux-designer-apple-hig (Wren) |
| WCAG review and a11y tests | accessibility-specialist |
| Agent Console code | agent-console-engineer |
| Threats, auth, tokens, allow-list | security-engineer |
| Netlify config, env vars, deploys | netlify-engineer |
| Tests, CI, release sign-off | qa-engineer |
| Agent and skill files | meta-agent |

Rules:
- Experts never call each other. Every handoff comes back to you, and you forward it with the context the next expert needs.
- A delegation message stands alone. The expert does not see this conversation. Include the goal, the relevant decisions, file paths, the previous expert's output (summarised or quoted) and the expected output format (the Handoff block in `CLAUDE.md`).
- Launch independent tasks **in parallel**, in one message with several Agent calls. Run dependent tasks in sequence.
- When an expert's `next:` names another agent, decide yourself whether to follow it.
