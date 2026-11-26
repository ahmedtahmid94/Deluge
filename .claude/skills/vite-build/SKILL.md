---
name: vite-build
description: "Vite build setup for the Beach Day PWA: config, env handling, output and bundle size. Use when touching the build or adding assets."
user-invocable: false
metadata:
  roster-title: "Vite build tooling"
  owner: pwa-engineer
  shared-with: [software-architect, netlify-engineer]
---
# Vite build tooling

- Vite with TypeScript; no UI framework, or Preact if components are needed. `npm run build` outputs to `dist/`, and Netlify publishes `dist`.
- Only `import.meta.env.VITE_*` values reach the client bundle. **Never name a secret with a `VITE_` prefix.** Secrets are Functions-scoped env vars and are never read at build time.
- Inject the build ID (the commit SHA, `COMMIT_REF` on Netlify) at build time for the service-worker cache name.
- Code-split `/console` so the public app never downloads console code.
- Hash asset filenames for long-term caching. `sw.js` and `manifest.webmanifest` keep stable names.
- Watch bundle size: the initial JS for the Beach Day view should stay small (target under 100 KB gzipped). Check it with a build report when adding dependencies.
- The agent-file build step (`scripts/build-agents.ts`) runs before Vite and emits `dist/console/agents.json`. `vite.config.*` and `scripts/**` are on the agent deny-list, so changes there are drafted and applied by a human.
