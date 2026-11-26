---
name: netlify-config
description: "Beach Day's netlify.toml: build settings, functions directory, included files, headers and redirects. Use when drafting any Netlify configuration change."
user-invocable: false
metadata:
  roster-title: "`netlify.toml` and build config"
  owner: netlify-engineer
  shared-with: [software-architect]
---
# netlify.toml and build config

`netlify.toml` is on the agent deny-list. Draft changes here and the lead applies them.

```toml
"$schema" = "https://open-api.netlify.com/netlify.schema.json"
[build]
  command = "npm run build"
  publish = "dist"
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
  included_files = [".claude/agents/**"]
```

Plus the `[[headers]]` blocks from the `web-security-headers` skill.

Notes:
- `[[headers]]` and `[[redirects]]` in `netlify.toml` apply to **all** deploy contexts. For per-context headers, copy a `_headers` file into the publish dir in that context's build command.
- Function routes and rate limits go in each function's `config` export, not in `netlify.toml`. Rate limits **cannot** be set there.
- Use `[context.deploy-preview]` and `[context.branch-deploy]` for preview settings, but **never put secret values in this file**. Set secrets in the Netlify UI.
- Keep `$schema` so editors validate the file.
- Free plan (decision D3): don't add plan-gated features (Basic-Auth headers, site password protection).
