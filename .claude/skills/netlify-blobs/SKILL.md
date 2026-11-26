---
name: netlify-blobs
description: "Using Netlify Blobs for Beach Day state: stores, keys, consistency and conditional writes. Use when reading or writing sessions, jobs, proposals or counters."
user-invocable: false
metadata:
  roster-title: "Netlify Blobs"
  owner: netlify-engineer
  shared-with: [agent-console-engineer]
---
# Netlify Blobs

```ts
import { getStore } from "@netlify/blobs";
const jobs = getStore({ name: "jobs", consistency: "strong" });
await jobs.setJSON(`job:${id}`, job);
const j = await jobs.get(`job:${id}`, { type: "json" });
```

- `getStore` gives **site-wide** stores that persist across deploys. Use these, not `getDeployStore`.
- **Consistency is eventual by default (up to 60 s).** Use `consistency: "strong"` for sessions, jobs and proposals, which are read right after writing.
- Methods: `set`/`setJSON` (with options `metadata`, `onlyIfNew`, `onlyIfMatch`), `get` (`type: "json"|"text"|"blob"|"arrayBuffer"|"stream"`), `getWithMetadata`, `delete`, `list({ prefix })`.
- **No atomic increments**; last write wins. Use `onlyIfMatch` (ETag) for state changes that must happen once, such as claiming a proposal for commit, and `onlyIfNew` for creates.
- Limits: store name ≤64 bytes, key ≤600 bytes, object ≤5 GB, metadata ≤2 KB.
- Stores: `sessions`, `jobs`, `proposals`, `ratelimit`, `login`, `audit`. One store per record type, so prefixes aren't needed.
- **Pitfalls verified with `@netlify/blobs` 11.1.11 and its local `BlobsServer`:**
  1. `getWithMetadata()` and `getMetadata()` returned no ETag, and **`onlyIfMatch: undefined` is an unconditional write**. Use the ETag returned by `set()`, and assert it is a non-empty string.
  2. Concurrent `onlyIfMatch` writes with the same ETag both succeeded locally, while sequential stale writes were rejected. Don't rely on Blobs alone for exactly-once; GitHub's `force:false` is the final guard.
  3. `list({ prefix })` returned nothing locally. Verify on a Deploy Preview before relying on it.
  See `knowledge/netlify-engineer/examples/02-blobs-local.mjs`.
- Local dev (`netlify dev`) uses a sandboxed local store, which never touches production data.
