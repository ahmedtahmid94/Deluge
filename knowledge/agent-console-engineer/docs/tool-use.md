# Claude tool use

Source: Claude Platform docs, *Define tools*: https://platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use (retrieved 2026-11-26; redirects to /define-tools)

## Tool definition (quoted)

| Parameter | Docs say |
|---|---|
| `name` | "Must match the regex `^[a-zA-Z0-9_-]{1,128}$`." |
| `description` | "A detailed plain text description of what the tool does, when it should be used, and how it behaves." |
| `input_schema` | "A JSON Schema object defining the expected parameters for the tool." |
| `input_examples` | Optional valid example inputs |

Optional properties include `cache_control`, `strict`, `defer_loading` and `allowed_callers`. **`strict: true`** guarantees inputs validate against the schema; use it with `additionalProperties: false` and `required`.

## Best practices (quoted)

- "**Provide extremely detailed descriptions.** This is by far the most important factor in tool performance." Cover what it does, when to use it (and when not), each parameter, and its limits. "Aim for at least 3–4 sentences for each tool description."
- "Consolidate related operations into fewer tools" by using an `action` parameter.
- "Use meaningful namespacing in tool names."
- "Design tool responses to return only high-signal information."
- "Ask for an explanation, not reasoning." A parameter asking for step-by-step reasoning "might lead to a `reasoning_extraction` refusal".

## `tool_choice` (quoted)

- `auto`: "allows Claude to determine whether to call any provided tools. This is the default value when tools are provided."
- `any` and `tool` force a tool call. "Forcing a tool also skips thinking." **These return 400 on Opus 5.5, Sonnet 5.5 and Fable 5.2**, so we use `auto` plus an explicit instruction.
- `none` prevents tool use.

## The loop

1. The assistant turn contains `tool_use` blocks `{ type: "tool_use", id, name, input }`, and often a text block first.
2. Run **every** `tool_use` block in that turn (parallel calls are the default).
3. Reply with **one** user message containing a `tool_result` for each call: `{ type: "tool_result", tool_use_id, content, is_error? }`. Splitting results across messages teaches the model to stop making parallel calls. Mark failures `is_error: true`; never drop a result.
4. Repeat until `stop_reason` is not `tool_use`. Cap the iterations (we use 12).

Verified in `../examples/01-tool-loop.ts`.
