# Netlify engineer examples

| File | What it shows | How to check |
|---|---|---|
| `01-forecast-function.mts` + `.test.mts` | A modern function with `config` (path, rateLimit), allow-listed beaches, `durable` + SWR cache headers, `marine: null` on failure | `node --experimental-strip-types 01-forecast-function.test.mts` |
| `02-blobs-local.mjs` | Netlify Blobs against the real client and its local `BlobsServer`: `onlyIfNew`, `onlyIfMatch`, strong reads, `list()` | `node 02-blobs-local.mjs` (needs `@netlify/blobs`) |
| `03-agent-start.mts` + `.test.mts` | The sync "start job" handoff to a background function, with an internal secret, returning 202 + jobId | `node --experimental-strip-types 03-agent-start.test.mts` |

Verified 2026-11-26: all print `ok`. The `.mts` files typecheck against `@netlify/functions` 6.1.2.

Pitfalls found while verifying `@netlify/blobs` 11.1.11 against the local server:
1. `getWithMetadata()` and `getMetadata()` returned **no ETag**, and `onlyIfMatch: undefined` silently becomes an unconditional write. Use the ETag returned by `set()`, and assert it exists.
2. **Concurrent** `onlyIfMatch` writes with the same ETag both succeeded locally, while sequential stale writes were rejected. Production atomicity is unverified, so GitHub's `force:false` stays the final guard against a double commit.
3. `list({ prefix })` returned nothing locally. Beach Day uses one store per record type, so it doesn't need prefixes.
