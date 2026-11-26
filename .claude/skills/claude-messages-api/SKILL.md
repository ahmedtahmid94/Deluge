---
name: claude-messages-api
description: "How the Agent Console calls the Claude Messages API from Netlify Functions: SDK, models, thinking, effort, stop reasons, fallbacks and caching. Use when writing or changing any Claude API call."
user-invocable: false
metadata:
  roster-title: "Claude Messages API"
  owner: agent-console-engineer
  shared-with: [meta-agent]
---
# Claude Messages API (from Netlify Functions)

- SDK: `@anthropic-ai/sdk`. `new Anthropic()` reads `ANTHROPIC_API_KEY` from the Netlify env var (Functions-scoped once on Pro). **Never call the API from the browser.**
- Endpoint: `client.messages.create` / `client.messages.stream` (`POST /v1/messages`).
- Request shape:
  - `system` is the agent file's body plus `CONSOLE_RULES`, as a text block with `cache_control: { type: "ephemeral" }` (prompt caching for repeated turns);
  - `messages` is the job history;
  - `tools` are the console tools.
- Models: map the frontmatter alias with `src/shared/models.ts`:

  | Alias | Model ID |
  |---|---|
  | `opus`, `inherit` or missing | `claude-opus-5-5` |
  | `sonnet` | `claude-sonnet-5-5` |
  | `haiku` | `claude-haiku-5-5` |
  | `fable` | `claude-fable-5-2` |

  Refresh this table from the Models API (`client.models.list()`) or the docs, not from memory. Never add date suffixes.
- **Thinking:** `thinking: { type: "adaptive" }`. `budget_tokens` returns 400 on these models. Set depth with `output_config: { effort }`: `low`/`medium` for chat, `high` for code proposals. Opus 5.5 defaults to `medium`.
- **No assistant prefill** (returns 400). **No forced `tool_choice` `any`/`tool`** (returns 400 on Opus 5.5 / Sonnet 5.5 / Fable 5.2). Use `auto` plus clear instructions.
- **Stop reasons:**
  - `end_turn`: done;
  - `tool_use`: run the tools;
  - `max_tokens`: tell the user the response was too long;
  - `pause_turn`: continue;
  - `refusal`: show "The model declined", reading `stop_details`.
- **Fallbacks:** for Opus 5.5 and Fable 5.2, send the beta `server-side-fallback-2026-07-01` with `fallbacks: "default"`. Tell the user when a fallback model answered.
- **Errors:** catch typed errors from specific to general (`RateLimitError`, `APIStatusError`, `APIConnectionError`). The SDK retries 429 and 5xx twice. 400s are bugs.
- Record `usage` (input, output, cache read tokens) on the job, for budgets.
