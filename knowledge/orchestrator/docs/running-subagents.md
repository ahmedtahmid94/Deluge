# Running a team of subagents in Claude Code

Source: Claude Code docs, *Create custom subagents*: https://code.claude.com/docs/en/sub-agents (retrieved 2026-11-26)

## Starting as the orchestrator (quoted)

- "Pass `--agent <name>` to start a session where the main thread itself takes on that subagent's tool restrictions and model": `claude --agent orchestrator`.
- "a custom subagent's system prompt replaces the default Claude Code system prompt entirely". "CLAUDE.md files and project memory still load".
- To make it the project default, set `{"agent": "orchestrator"}` in `.claude/settings.json`. "The CLI flag overrides the setting".
- "When an agent runs as the main thread with `claude --agent`, it can spawn subagents using the Agent tool. To restrict which subagent types it can spawn, use `Agent(agent_type)` syntax". This "applies only to an agent running as the main thread".

## Parallel and background (quoted)

- "For independent investigations, spawn multiple subagents to work simultaneously … Each subagent explores its area independently, then Claude synthesizes the findings."
- "Running many subagents that each return detailed results can consume significant context, and each subagent spends tokens of its own while it runs." Ask experts for the compact Handoff block, not full transcripts.
- "With nothing configured, a subagent other than `web-fetch` that Claude spawns from your main conversation starts in the background." Background subagents "run concurrently while you continue working". Their permission prompts surface in the main session.
- **Chaining:** "For multi-step workflows, ask Claude to use subagents in sequence. Each subagent completes its task and returns results to Claude, which then passes relevant context to the next subagent." This is exactly our "handoffs go through the orchestrator" rule.

## Limits (quoted)

- **Concurrency:** "By default, when 20 subagents are running in a session, spawning another with the Agent tool fails with `Concurrent subagent limit reached`". We plan batches of at most about 6.
- **Nesting:** subagents can spawn their own "up to three layers below the main conversation". Our experts have no `Agent` tool, so they can't nest.

## What an expert sees (quoted)

- "Each subagent starts with a fresh, isolated context window. It doesn't see your conversation history, the skills you've already invoked, or the files Claude has already read. Claude composes a delegation message that summarizes the task".
- Its initial context: its system prompt, the task message, **CLAUDE.md files**, git status and **preloaded skills**.
- So every brief must stand alone: the goal, the decisions, the paths, the earlier outputs and the expected output.

## Resuming (quoted)

"Each subagent invocation creates a new instance rather than continuing an earlier one. To continue an existing subagent's work, ask Claude to resume it. Resumed subagents retain their full conversation history". Resume an expert for a follow-up on the same task (for example re-review after fixes) instead of starting cold.

## When not to delegate (quoted)

Use the main conversation for "frequent back-and-forth", phases that "share significant context", "a quick, targeted change", or when "Latency matters".
