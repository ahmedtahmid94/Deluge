# Claude models

Source: Claude Platform docs, *Models overview*: https://platform.claude.com/docs/en/about-claude/models/overview (retrieved 2026-11-26; redirects to /docs/en/models/overview)

Docs guidance (quoted): "If you're unsure which model to use, start with Claude Opus 5.5 for most workloads. Use Claude Fable 5.2 for demanding reasoning and long-horizon agentic work, or when your evals on Claude Opus 5.5 at higher effort still fall short."

| Model | API ID / alias | Context | Max output | Price (input / output per MTok) | Latency | Retirement (not sooner than) |
|---|---|---|---|---|---|---|
| Claude Fable 5.2 | `claude-fable-5-2` | 1M | 128K | $8 / $40 | Moderate | 2027-11-09 |
| Claude Opus 5.5 | `claude-opus-5-5` | 1M | 128K | $4 / $20 | Moderate | 2027-09-22 |
| Claude Sonnet 5.5 | `claude-sonnet-5-5` | 1M | 128K | $2 / $10 | Fast | 2027-09-28 |
| Claude Haiku 5.5 | `claude-haiku-5-5` | 1M | 128K | from $0.10 / $0.50 | Fastest | 2027-10-07 |

"Older models might still be available, but where possible, you should default to the latest models."

## Mapping in Beach Day (`src/shared/models.ts`)

| Agent frontmatter `model` | API ID |
|---|---|
| `opus`, `inherit` or missing | `claude-opus-5-5` |
| `sonnet` | `claude-sonnet-5-5` |
| `haiku` | `claude-haiku-5-5` |
| `fable` | `claude-fable-5-2` |

Use the IDs exactly, with no date suffixes. Re-check this table against the page, or `GET /v1/models`, before changing it.
