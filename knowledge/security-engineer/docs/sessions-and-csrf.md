# Sessions and CSRF

Sources (retrieved 2026-11-26):
- OWASP *Session Management Cheat Sheet*: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- OWASP *CSRF Prevention Cheat Sheet*: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html

## Session IDs and cookies (quoted)

- "Session identifiers must have at least 64 bits of entropy." "A strong CSPRNG … must be used." We use 32 random bytes from `crypto.randomBytes`.
- "Session cookies must explicitly set SameSite=Strict (preferred) or SameSite=Lax."
- `__Host-` prefix: "the cookie must be set with Secure, must not have a Domain attribute, and must use Path=/. Prevents subdomain forgery and HTTPS downgrade attacks."
  ```
  Set-Cookie: __Host-SessionID=<value>; Secure; HttpOnly; SameSite=Strict; Path=/
  ```
- "Do not store authentication tokens, session IDs, JWTs … in localStorage or sessionStorage." The console uses an HttpOnly cookie only.

## Expiry and logout (quoted)

- "Common idle timeouts ranges are 2-5 minutes for high-value applications and 15-30 minutes for low risk applications."
- Absolute timeouts: "between 4 and 8 hours" for full-day use.
- "Session timeout management and expiration must be enforced server-side."
- "Enforce session expiration on the server and invalidate the session when the user logs out; deleting a cookie alone does not invalidate a stolen copy of the session ID."
- Provide a visible logout on every page.

**Beach Day:**
- idle timeout **30 min** and absolute timeout **8 h**, both stored in the session record in Blobs;
- logout deletes the record;
- a new session ID on every login.

(This corrects the earlier "8 h sliding" wording.)

## CSRF (quoted)

- "Do not use GET requests for state changing operations."
- **Signed double-submit cookie (recommended):** "explicitly ties tokens to the user's authenticated session". Use an HMAC with a server-side secret.
- **Naive double-submit (discouraged):** "bypassable by an attacker who can write cookies on the target domain".
- **Fetch Metadata:** "Sec-Fetch-Site is the most useful Fetch Metadata header for blocking CSRF-like cross-origin requests and should be the primary signal." "By default, reject non-safe methods (POST / PUT / PATCH / DELETE) when Sec-Fetch-Site: cross-site." If the header is missing, fall back to standard Origin verification.
- "Since requests with custom headers are automatically subject to the same-origin policy, it is more secure to insert the CSRF token in a custom HTTP request header via JavaScript."

**Beach Day:** every mutating console request must pass all of these:
1. `Sec-Fetch-Site` is `same-origin` (or, when that header is absent, `Origin` equals the site origin);
2. an `X-CSRF-Token` header equal to `HMAC(SESSION_SECRET, sessionId)`, compared in constant time;
3. a `SameSite=Strict` cookie.

Verified in `../examples/03-session-csrf.ts`.
