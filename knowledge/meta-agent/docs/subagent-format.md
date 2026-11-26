# Claude Code subagent files

Source: Claude Code docs, *Create custom subagents*: https://code.claude.com/docs/en/sub-agents (retrieved 2026-11-26)

## Location and loading (quoted)

- "**Project subagents** (`.claude/agents/`) are ideal for subagents specific to a codebase. Check them into version control".
- They are scanned recursively, and "identity comes only from the `name` frontmatter field".
- "Claude Code watches `~/.claude/agents/` and `.claude/agents/`. When you add or edit a subagent file … the next delegation uses the updated definition, with no restart needed."

## Frontmatter (quoted)

- "Only `name` and `description` are required."
- "Multi-word field names use camelCase, such as `maxTurns` and `disallowedTools`, and must match the table exactly: **Claude Code ignores a field it doesn't recognize without reporting an error.**"
- `name`: "Unique identifier of at most 256 characters … Names can't contain `:`".
- `tools`: "Inherits every tool available to subagents if omitted." To preload skills, use `skills` rather than listing `Skill` here.
- `model`: `sonnet`, `opus`, `haiku`, `fable`, a full ID, or `inherit`.
- `skills`: "Skills to preload into the subagent's context at startup. **The full skill content is injected**, not only the description."
- Other fields: `effort`, `color` (red, blue, green, yellow, purple, orange, pink, cyan), `maxTurns`, `memory`, `isolation: worktree`, `permissionMode`, `hooks`, `mcpServers`, `initialPrompt`, and `omitClaudeMd`.

## Files Claude Code skips (quoted)

- No `name`: the file is treated as documentation.
- "An opening `---` that isn't the file's first line".
- A `name` that starts with `-`, contains `:`, or is longer than 256 characters.
- "A `name` but no `description`".
- "YAML that doesn't parse".
- Check with `claude plugin validate .claude/agents`.

## Preloading skills (quoted)

- "The full content of each listed skill is injected into the subagent's context at startup, **up to the first 32 distinct names** in the list."
- "**You can't preload skills that set `disable-model-invocation: true`**".
- "If a listed skill is missing or disabled … Claude Code skips it and logs a warning".

## Spawning and tools (quoted)

- "If you omit `Agent` from the `tools` list entirely, the agent can't spawn any subagents". This is why experts don't have it.
- "The `Agent(agent_type)` allowlist syntax applies only to an agent running as the main thread with `claude --agent`."

## Context (quoted)

A subagent starts with "a fresh, isolated context window". It receives its own system prompt, the task message, **CLAUDE.md files**, git status and preloaded skills. "The main conversation's auto memory isn't loaded."

"Keep descriptions brief: Claude Code shows a startup warning when your subagents' combined descriptions pass the 15,000-token limit".
