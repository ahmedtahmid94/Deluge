---
name: typescript-conventions
description: "TypeScript and JavaScript conventions for Beach Day code, both front end and Netlify Functions. Use whenever writing or reviewing code."
user-invocable: false
metadata:
  roster-title: "TypeScript and modern JavaScript"
  owner: software-architect
  shared-with: [pwa-engineer, open-meteo-integrator, agent-console-engineer, netlify-engineer, qa-engineer, beach-conditions-analyst]
---
# TypeScript conventions

- TypeScript with `strict: true`, ES modules, and target ES2022 for functions and modern evergreen browsers for the front end.
- Function files are `.mts`. Use web-standard `Request`/`Response` and the modern Netlify Functions signature `export default async (req: Request, context: Context) => Response`.
- Fewer dependencies is better. Use platform APIs (`fetch`, `crypto.subtle`, `crypto.randomUUID`, `URL`, `Intl.DateTimeFormat`) before adding packages. New dependencies need software-architect and security-engineer review and are applied by a human (package manifests are on the agent deny-list).
- Validate all external input at the boundary (query strings, request bodies, Open-Meteo and Claude responses, agent files) and narrow it to typed values. Never trust `as` casts on network data.
- Use discriminated unions for states (`{ status: "running" } | { status: "done", ... }`), not booleans plus optionals.
- No `any`. Use `unknown` and narrow it.
- Errors: throw typed errors inside modules, and turn them into generic JSON errors at the function boundary.
- Dates: handle times in `America/New_York` with `Intl`. Never hand-roll DST.
- Name things for the domain: `beachId`, `dayScore`, `bestWindow`, `proposalId`.
- Keep files small and focused. Export pure functions for testing.
