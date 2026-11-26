# HTTP security headers

Source: OWASP *HTTP Headers Cheat Sheet*: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html (retrieved 2026-11-26)

OWASP recommendations (quoted):

| Header | Recommendation |
|---|---|
| Framing | "Use Content Security Policy (CSP) frame-ancestors directive if possible." Fallback: `X-Frame-Options: DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload`. Netlify serves HTTPS; add HSTS only after confirming the custom domain setup, because `preload` is hard to undo |
| `Permissions-Policy` | "disable all the features that your site does not need", for example `geolocation=(), camera=(), microphone=()`. Beach Day allows `geolocation=(self)` for "Near me" |
| `Cache-Control` | "Use no-store for sensitive responses." "Avoid relying on default caching behavior for sensitive or protected content." This applies to all console pages and APIs |
| `Server`, `X-Powered-By` | Remove them, or use non-informative values |

The Beach Day header set is in `docs/03` (`netlify.toml`) and the `web-security-headers` skill.
