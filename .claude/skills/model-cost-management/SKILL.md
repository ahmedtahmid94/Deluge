---
name: model-cost-management
description: "Control which models Agent Console agents use and what they cost: model mapping, budgets and usage tracking. Use when choosing models or setting limits."
user-invocable: false
metadata:
  roster-title: "Model and cost management"
  owner: agent-console-engineer
  shared-with: [meta-agent, orchestrator]
---
# Model and cost management

- `src/shared/models.ts` maps agent frontmatter aliases to API model IDs and holds an allow-list. A build fails on an unknown model.
- Default model: `claude-opus-5-5`. Use `sonnet` (`claude-sonnet-5-5`) or `haiku` (`claude-haiku-5-5`) for agents whose console tasks are simple; meta-agent decides per agent from evaluation results.
- Effort per task type: chat `low`/`medium`; code proposals `high`. Measure before raising it.
- Prompt caching on the system prompt and tool definitions. Check `usage.cache_read_input_tokens` is above zero on later turns.
- Track per job: input, output and cache-read tokens, and model. Show a running total per day in the console.
- Budgets:
  - `AGENT_DAILY_BUDGET` jobs per day;
  - about 12 tool iterations per job;
  - a `max_tokens` cap;
  - at most 2 concurrent jobs per session.
- A workspace **spend limit** in the Anthropic Console is the hard backstop.
- On the Netlify Free plan (decision D3), long background jobs also use the free allowance. Keep jobs short and avoid unnecessary polling (1–2 s while running, stop when done).
