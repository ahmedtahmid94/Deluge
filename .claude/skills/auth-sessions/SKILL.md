---
name: auth-sessions
description: "The Agent Console password gate and session handling: hashing, cookies, lockout and CSRF. Use when writing or reviewing auth code or any console route."
user-invocable: false
metadata:
  roster-title: "Authentication and sessions"
  owner: security-engineer
  shared-with: [agent-console-engineer]
---
# Authentication and sessions

- One console password. Store **only** `CONSOLE_PASSWORD_HASH`, an scrypt hash with a random salt, in the format `scrypt$N$r$p$salt$hash`. Compare with `crypto.timingSafeEqual`.
- On success:
  - create a 32-byte random session ID and store `sess:<id>` in Blobs (strong consistency) with an expiry (8 h sliding) and an IP hash;
  - set `__Host-bd_session=<id>; Path=/; Secure; HttpOnly; SameSite=Strict`;
  - issue a per-session CSRF token that the UI sends in an `X-CSRF-Token` header.
- **Every** console function checks the session first. Mutating routes also check `Origin` equals the site origin and the CSRF token. Test that every console route without a session returns 401.
- **Brute force:**
  - Netlify `rateLimit` on login (`windowLimit: 5, windowSize: 60, aggregateBy: ["ip","domain"]`);
  - a Blobs counter per IP hash that locks out for 15 minutes after 10 failures.
- Errors are generic ("Incorrect password"). Never reveal whether a session expired or was invalid beyond "Please sign in again".
- Logout deletes the session record. Changing the password (env var) invalidates sessions by rotating `SESSION_SECRET` or clearing the `sessions` store.
- There is no Netlify site password or Basic-Auth layer on the Free plan (decision D3). This gate is the whole gate.
- WCAG 3.3.8: allow paste and password managers (`autocomplete="current-password"`).
