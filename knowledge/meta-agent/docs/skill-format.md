# Claude Code skills

Source: Claude Code docs, *Skills*: https://code.claude.com/docs/en/skills (retrieved 2026-11-26)

## Structure

- A skill is a directory with `SKILL.md`: YAML frontmatter, then Markdown instructions. Project skills live in `.claude/skills/<name>/SKILL.md`.
- "Claude Code reads the frontmatter only when the opening `---` is the file's first line."
- "If the YAML between the markers doesn't parse, the skill still loads with no fields set".
- "Claude Code ignores a field it doesn't recognize without reporting an error."

## Frontmatter fields (quoted, selection)

| Field | Docs say |
|---|---|
| `name` | "Command name shown in the `/` menu. Defaults to the directory name." |
| `description` | "What the skill does and when to use it. … Put the key use case first: the combined `description` and `when_to_use` text is truncated at **1,536 characters**" |
| `user-invocable: false` | "Only Claude can invoke the skill … Use for background knowledge users shouldn't invoke directly." We use it for every team skill |
| `disable-model-invocation: true` | Claude can't load it on its own; "**Also prevents the skill from being preloaded into subagents**". Never use it on team skills |
| `allowed-tools` | Pre-approves tools for the invoking turn |
| `context: fork`, `agent` | Run the skill in a subagent |
| `paths` | Globs that activate the skill |
| `metadata` | "Free-form YAML map for your own key-value data … Claude Code doesn't act on its contents". We store `roster-title`, `owner` and `shared-with` here |

## Content guidance (quoted)

- "Keep the body itself concise. Once a skill loads, its content stays in context across turns, so every line is a recurring token cost. State what to do rather than narrating how or why".
- "Keep `SKILL.md` under 500 lines. Move detailed reference material to separate files", and reference those files from `SKILL.md` so Claude knows when to load them.

## Invocation table (quoted)

| Frontmatter | You can invoke | Claude can invoke |
|---|---|---|
| (default) | Yes | Yes |
| `disable-model-invocation: true` | Yes | Not on its own |
| `user-invocable: false` | No | Yes |

"Subagents with preloaded skills work differently: the full skill content is injected at startup."
