# Netlify Blobs

Source: https://docs.netlify.com/build/data-and-storage/netlify-blobs/ (retrieved 2026-11-25). Package: `@netlify/blobs` (v11.1.11 verified).

- `getStore(name, opts)` opens a **site-wide** store: "shared across all deploys of a site and persisted on new deploys". `getDeployStore` is scoped to one deploy.
- Methods:
  - `set(key, value, { metadata, onlyIfMatch, onlyIfNew })` and `setJSON`;
  - `get(key, { consistency, type })` with `type` one of `arrayBuffer`, `blob`, `json`, `stream` or `text` (the default);
  - `getWithMetadata` (returns the `etag`);
  - `delete`;
  - `list({ prefix, directories, paginate })`.
- **Consistency:** eventual by default ("updates/deletions propagate within 60 seconds"). Use strong consistency with `getStore({ name, consistency: "strong" })` or per call `store.get(key, { consistency: "strong" })`. The Netlify CLI always uses strong consistency.
- **Conditional writes:** `onlyIfNew` (create only) and `onlyIfMatch: etag` (compare-and-swap). There is no atomic increment; otherwise last write wins.
- Limits:

  | Item | Limit |
  |---|---|
  | Store name | ≤ 64 bytes |
  | Key | ≤ 600 bytes |
  | Object | ≤ 5 GB |
  | Metadata | ≤ 2 KB |
  | `list` page | 1,000 entries |

- Functions written in Go can't use Blobs. Local development uses a sandboxed store.
- Testing: `@netlify/blobs/server` exports a `BlobsServer` that serves a local store. We use it in `../examples/02-blobs-local.mjs` to verify `onlyIfNew`, `onlyIfMatch` and strong reads against the real client.
