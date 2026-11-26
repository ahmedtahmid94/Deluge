---
name: netlify-functions
description: "Writing and configuring Netlify Functions for Beach Day: signature, routing, limits, background mode and rate limits. Use when creating or changing any function."
user-invocable: false
metadata:
  roster-title: "Netlify Functions"
  owner: netlify-engineer
  shared-with: [agent-console-engineer, open-meteo-integrator]
---
# Netlify Functions

Modern signature (`netlify/functions/<name>.mts`):

```ts
import type { Config, Context } from "@netlify/functions";
export default async (req: Request, context: Context) => new Response("ok");
export const config: Config = {
  path: "/api/forecast",
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
```

Limits (Netlify docs, none configurable):

| Kind | Limit |
|---|---|
| Synchronous | **60 s** |
| Streaming | 60 s and **20 MB** |
| **Background** (`config.background = true`, or a `-background` filename) | **15 min**; immediate **202**, no response body, no streaming, retried after 1 and 3 minutes on error |

Background functions are available on the Free plan (D3).

Beach Day functions:
- `forecast`
- `auth-login`, `auth-logout`
- `agents`
- `agent-start`, `agent-run` (background), `agent-status`
- `proposal-approve`

Rules:
- Return JSON with an explicit `Content-Type`, `Cache-Control` and status. Errors are generic, with a log ID.
- Read env vars inside the handler with `Netlify.env.get`.
- Validate input before any I/O. Set timeouts on outbound `fetch`.
- `netlify/**` is on the agent deny-list: function code is drafted by experts and applied by a human.
