# Security engineer examples

| File | What it shows | How to check |
|---|---|---|
| `01-password-hash.ts` | scrypt at OWASP's minimum (N=2^17, r=8, p=1) with raised `maxmem`, and a constant-time verify | `node --experimental-strip-types 01-password-hash.ts` |
| `02-path-allowlist.ts` | Accept-known-good path validation tested with OWASP traversal encodings and the Beach Day deny-list | `node --experimental-strip-types 02-path-allowlist.ts` |
| `03-session-csrf.ts` | A `__Host-` session cookie; CSRF with Sec-Fetch-Site, an Origin fallback and an HMAC token; idle timeout; server-side logout | `node --experimental-strip-types 03-session-csrf.ts` |

Verified 2026-11-26: all print `ok`. The hash took about 300 ms. 29 hostile paths were rejected and 8 safe ones accepted. The default `maxmem` fails for N=2^17, and the test asserts that.
