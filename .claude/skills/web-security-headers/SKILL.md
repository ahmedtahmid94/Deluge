---
name: web-security-headers
description: "HTTP security headers for Beach Day: CSP, framing, sniffing, referrer, permissions and cache rules for private routes. Use when changing headers or adding external resources."
user-invocable: false
metadata:
  roster-title: "Web security headers"
  owner: security-engineer
  shared-with: [netlify-engineer]
---
# Web security headers

Set in `netlify.toml` `[[headers]]` (human-applied; on the agent deny-list):
- `Content-Security-Policy: default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(self), camera=(), microphone=()`
- `/console/*`: `Cache-Control: no-store`, `X-Robots-Tag: noindex`
- `/sw.js`: `Cache-Control: no-cache`

Rules:
- The browser talks only to `'self'`, so external APIs never appear in `connect-src`. Adding any external origin needs security-engineer review.
- No inline scripts or styles, so no `'unsafe-inline'`. Use hashed or bundled files.
- API responses from console functions carry `Cache-Control: no-store`.
- Check headers on every Deploy Preview with a smoke test (qa-engineer).
