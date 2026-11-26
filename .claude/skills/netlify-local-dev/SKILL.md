---
name: netlify-local-dev
description: "Running Beach Day locally with netlify dev: functions, env vars and the local Blobs sandbox. Use when developing or testing functions locally."
user-invocable: false
metadata:
  roster-title: "Local development (`netlify dev`)"
  owner: netlify-engineer
  shared-with: [qa-engineer, agent-console-engineer, open-meteo-integrator]
---
# Local development with netlify dev

- `npx netlify dev` runs the Vite dev server and the functions behind one local origin, so `/api/*` routes work as in production.
- Env vars: set local values under the Local development context (`netlify env:set NAME value --context dev`) or link the site. Use **dummy** values for secrets where possible: a test Anthropic key with a low limit, and no real GitHub token unless testing commits on a scratch repo.
- Netlify Blobs locally uses a sandboxed store with strong consistency, which never touches production data.
- Background functions can be invoked locally. Check the 202 behaviour and that the job state updates in the local store.
- Rate limits are enforced at Netlify's edge and may not apply locally. Check them on a Deploy Preview.
- Unit and function tests (Vitest) don't need `netlify dev`. They call handlers directly with `Request` objects and fakes.
