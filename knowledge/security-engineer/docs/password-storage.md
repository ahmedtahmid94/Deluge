# Password storage (the console password)

Source: OWASP *Password Storage Cheat Sheet*: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html (retrieved 2026-11-26)

## Algorithm order (quoted)

1. "**Argon2id** with a minimum configuration of 19 MiB of memory, an iteration count of 2, and 1 degree of parallelism."
2. "If Argon2id is not available, use **scrypt** with a minimum CPU/memory cost parameter of (2^17), a minimum block size of 8 (1024 bytes), and a parallelization parameter of 1."
3. bcrypt: work factor 10 or more, with a 72-byte password limit (legacy only).
4. PBKDF2-HMAC-SHA256: 600,000 or more iterations, if FIPS-140 compliance is required.

Equivalent scrypt settings listed by OWASP:

| N | r | p | Memory |
|---|---|---|---|
| 2^17 | 8 | 1 | 128 MiB |
| 2^16 | 8 | 2 | 64 MiB |
| 2^15 | 8 | 3 | 32 MiB |
| 2^14 | 8 | 5 | 16 MiB |
| 2^13 | 8 | 10 | 8 MiB |

"Consider using a pepper to provide additional defense in depth (though alone, it provides no additional secure characteristics)."

## Beach Day choice

- Node has no built-in Argon2id, so we use **Node `crypto.scrypt` with N=2^17, r=8, p=1**, a 16-byte random salt and a 32-byte key. Netlify functions have plenty of memory for this.
- Node's default `maxmem` is 32 MiB, which is too low for N=2^17. Pass `maxmem: 256 * 1024 * 1024`, or the call throws.
- Store the hash in `CONSOLE_PASSWORD_HASH` as `scrypt$17$8$1$<salt b64>$<hash b64>`.
- Compare with `crypto.timingSafeEqual` on equal-length buffers.
- Verified in `../examples/01-password-hash.ts`. It takes about 0.3–0.6 s per hash on this machine, which is acceptable for a rate-limited login.
