---
name: claude-streaming
description: "Streaming Claude responses inside the Agent Console's background worker and surfacing progress to the browser. Use when handling streamed output."
user-invocable: false
metadata:
  roster-title: "Claude streaming"
  owner: agent-console-engineer
  shared-with: [netlify-engineer]
---
# Claude streaming

- Use `client.messages.stream({...})`. Listen with `stream.on("text", ...)` for text, and use `await stream.finalMessage()` for the complete message. Don't wrap events in a hand-made Promise.
- Server-sent event order:
  1. `message_start`
  2. for each content block: `content_block_start` → `content_block_delta` (`text_delta`, or `input_json_delta` for tool inputs, `thinking_delta`) → `content_block_stop`
  3. `message_delta` (with `stop_reason` and usage)
  4. `message_stop`
- `ping` events may arrive at any time. An `error` event (for example `overloaded_error`) is raised by the SDK as an exception.
- Tool inputs stream as partial JSON. Parse only after `content_block_stop`, or use the SDK's final message.
- `max_tokens`: stream when it is large (above about 16,000). Up to about 64,000 is fine with streaming.
- **In Beach Day the browser never connects to the Claude stream.** The background function consumes it and writes progress to Blobs in batches (every 1–2 s or 2 KB) as events with an increasing `seq`. The browser polls `GET /api/agent/jobs/:id?after=<seq>`.
- Thinking `display` defaults to omitted, so streamed thinking blocks are empty. Show "Thinking…" status instead of thinking text.
