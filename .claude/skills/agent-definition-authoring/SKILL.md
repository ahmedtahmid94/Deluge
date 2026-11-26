---
name: agent-definition-authoring
description: "Write and revise Claude Code subagent files in .claude/agents/ for the Beach Day team. Use when adding, changing or auditing an agent."
user-invocable: false
metadata:
  roster-title: "Agent definition authoring"
  owner: meta-agent
  shared-with: [orchestrator, agent-console-engineer]
---
# Agent definition authoring

The format follows the Claude Code subagent docs (https://code.claude.com/docs/en/sub-agents):
- YAML frontmatter between `---` lines; the **first line of the file must be `---`**.
- Required fields: `name` (lowercase, hyphens, no `:`) and `description` (when to delegate; keep it short).
- Optional fields used here: `tools`, `model` (`opus`, `sonnet`, `haiku`, `fable`, a full ID, or `inherit`), `color`, `skills` (preloaded in full at startup, at most 32), `effort`.
- Field names are case-sensitive. A misspelled field is silently ignored, so check against the docs.
- The body is the agent's whole system prompt. Subagents also load `CLAUDE.md`, so don't repeat team rules that live there.

Body structure for this repo:
1. A one-line identity, with the persona name if there is one (Sable, Wren).
2. `## Personality`: 2–3 lines. The Agent Console shows this section.
3. `## You own`: paths and decisions.
4. `## How you work`: numbered steps.
5. `## Boundaries`: what you must not do.
6. `## Hand back`: a reminder to end with the Handoff block from `CLAUDE.md`.

Rules:
- Only the orchestrator gets the `Agent` tool. Experts don't, so every handoff goes through the orchestrator.
- `skills:` must match `docs/expert-roster.md` (owner and also). Keep the two in sync.
- After editing, check that the frontmatter parses (for example `claude plugin validate .claude/agents`) and that each skill name exists in `.claude/skills/`.
- The console's build step validates the same files (docs/04, section 1). Model aliases map to API IDs there.
