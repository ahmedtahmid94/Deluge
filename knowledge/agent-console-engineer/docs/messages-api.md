# Claude Messages API (from a Netlify Function)

Sources:
- API reference: https://platform.claude.com/docs/en/api/messages
- Streaming: https://platform.claude.com/docs/en/build-with-claude/streaming (retrieved 2026-11-26)
- The Messages reference page did not render when scraped, so the request and response details below come from the Claude API skill reference bundled with Claude Code, cached from the official docs on 2026-11-03. Verify changes against the reference page.

## Request

- `POST https://api.anthropic.com/v1/messages`. Use the official SDK `@anthropic-ai/sdk`. `new Anthropic()` reads `ANTHROPIC_API_KEY` from the environment.
- Required: `model`, `max_tokens`, `messages` (alternating `user`/`assistant` turns; content is a string or content blocks).
- `system`: the agent's prompt. Use text blocks with `cache_control: { type: "ephemeral" }` on the stable prefix (prompt caching; the render order is tools → system → messages).
- `thinking: { type: "adaptive" }` on current models. The old `budget_tokens` form returns **400** on Opus 5.5, Sonnet 5.5 and Fable 5.2. On Opus 5.5, `{type:"disabled"}` is also a 400.
- `output_config: { effort: "low" | "medium" | "high" | "xhigh" | "max" }`. **Opus 5.5 defaults to `medium`**, so set it explicitly.
- `tools`, `tool_choice`: `auto` (the default with tools) or `none`. **`any` and `tool` return 400 on Opus 5.5, Sonnet 5.5 and Fable 5.2.**
- **No assistant prefill**: a final assistant message returns 400 on current models.
- `max_tokens`: about 16,000 non-streaming, up to about 64,000 streaming. Large values need streaming to avoid HTTP timeouts.

## Response

- `content`: an array of blocks (`text`, `thinking`, `tool_use`). Narrow on `.type` before reading.
- `stop_reason`:
  - `end_turn`
  - `tool_use`: run the tools and reply with `tool_result` blocks
  - `max_tokens`: the output was cut off
  - `pause_turn`: resend to continue
  - `refusal`: read `stop_details.category` and `explanation`; `stop_details` is `null` otherwise
- `usage`: `input_tokens`, `output_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`. Record them for budgets. If `cache_read_input_tokens` stays 0 on later turns, something is breaking the cache.

## Refusal fallback (Opus 5.5, Sonnet 5.5, Fable 5.2)

Send the beta header `server-side-fallback-2026-07-01` with `fallbacks: "default"`. A refused request is then retried on a suitable model by the server. Tell the user when a fallback model answered.

## Streaming event order (quoted from the streaming page)

1. `message_start`: a Message with empty `content`.
2. Per content block: `content_block_start`, then any number of `content_block_delta` (`text_delta`; tool inputs as `input_json_delta` partial JSON, "the final `tool_use.input` is always an object"), then `content_block_stop`.
3. One or more `message_delta`: top-level changes such as `stop_reason` and usage.
4. `message_stop`.

- Errors can arrive mid-stream: `event: error … {"type": "overloaded_error"}`. "If you use the SDK … The SDK ends the stream, and the code that reads the stream gets an error instead."
- Tool input deltas are partial JSON. Parse after `content_block_stop`, or use the SDK's `finalMessage()`.

## Errors

The SDK retries 408, 409, 429 and 5xx twice by default. Catch typed errors from specific to general (`Anthropic.RateLimitError`, then `Anthropic.APIStatusError`, then `Anthropic.APIConnectionError`). A 400 is a bug in our request; don't retry it.
