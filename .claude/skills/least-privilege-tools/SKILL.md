---
name: least-privilege-tools
description: "Give each agent only the tools it needs. Use when writing an agent's tools field or reviewing agent permissions."
user-invocable: false
metadata:
  roster-title: "Least-privilege tool scoping"
  owner: meta-agent
  shared-with: [security-engineer]
---
# Least-privilege tool scoping

- Reviewers and designers that only read code get `Read, Glob, Grep`. Add `Write, Edit` only if they produce spec or doc files.
- Builders get `Read, Write, Edit, Glob, Grep, Bash`.
- Research needs `WebFetch, WebSearch`. Give those only to agents that read external docs.
- Only `orchestrator` lists `Agent`. Experts must not spawn other agents; handoffs go through the orchestrator.
- `tools` is an allowlist; `disallowedTools` removes tools from the inherited pool. Prefer an explicit `tools` list for this team.
- Remember that Bash can write files and run anything. Don't give it to agents that should stay read-only.
- No agent gets credentials. Secrets live only in Netlify env vars, Functions scope.
- Ask security-engineer to review any agent whose tools gain Bash, Write/Edit, Agent or MCP access.
