# Platform boundaries the architecture must respect

Sources (retrieved 2026-11-25/26):
- Netlify Functions configuration: https://docs.netlify.com/build/functions/configuration/
- Background Functions: https://docs.netlify.com/build/functions/background-functions/
- Netlify caching: https://docs.netlify.com/build/caching/caching-overview/
- Netlify env vars and functions: https://docs.netlify.com/build/functions/environment-variables/
- Netlify Blobs: https://docs.netlify.com/build/data-and-storage/netlify-blobs/
- Vite env variables: https://vite.dev/guide/env-and-mode

| Constraint | Source says | Design consequence |
|---|---|---|
| Sync function | 60 s, not configurable | Fast endpoints only: forecast, auth, status, approve |
| Streaming | 60 s, 20 MB | Not used for agent jobs |
| Background function | 15 min; 202; "The handler's return value is discarded"; retried after 1 and 3 min on error | Agent jobs run here, with state in Blobs, and must be idempotent |
| Function responses | "not cached by default" | `/api/forecast` sets CDN headers explicitly (`durable`, SWR) |
| Static assets | Cached at the edge and invalidated on every deploy | Hashed assets; `sw.js` stays fresh |
| Blobs consistency | Eventual by default (up to 60 s); strong on request | Strong for jobs, proposals and sessions |
| Blobs concurrency | No atomic increment; conditional writes only | Claims use `onlyIfMatch`, and GitHub `force:false` backs it up |
| **Env var scopes** | "**On the Pro plan and above**, you can set specific scopes" | On Free (D3), secrets are visible to builds. Keep build-time code human-only (deny-list) |
| Vite env | "Variables prefixed with VITE_ will be exposed in client-side source code … To prevent accidentally leaking env variables to the client, avoid using this prefix." "The values of these variables are bundled into your source code at build time." | No secret may use `VITE_`. Secrets are read only inside functions |

## Vite env details (quoted)

- Built-ins: `import.meta.env.MODE`, `BASE_URL`, `PROD`, `DEV`, `SSR`.
- Load order: `.env` (all cases), `.env.local` (all cases, git-ignored), `.env.[mode]`, `.env.[mode].local`. Mode-specific files take precedence. "environment variables that already exist when Vite is executed have the highest priority".
- Values arrive as strings. Convert them explicitly.
