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
- Stores: `sessions`, `jobs`, `proposals`, `ratelimit`, `login`, `audit`.
- Local dev (`netlify dev`) uses a sandboxed local store, which never touches production data.
