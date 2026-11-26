// Example 2: Netlify Blobs patterns against the real @netlify/blobs client and its local BlobsServer:
// strong consistency, onlyIfNew (create once), onlyIfMatch (compare-and-swap with ETag), and two pitfalls.
// Run (needs @netlify/blobs installed): node 02-blobs-local.mjs
import { getStore } from "@netlify/blobs";
import { BlobsServer } from "@netlify/blobs/server";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";

const server = new BlobsServer({ directory: mkdtempSync(join(tmpdir(), "blobs-")), token: "local-token", port: 8971 });
await server.start();
try {
  const proposals = getStore({ name: "proposals", siteID: "local-site", token: "local-token",
    apiURL: "http://localhost:8971", consistency: "strong" });

  // Create once.
  const first = await proposals.setJSON("prop:1", { status: "pending" }, { onlyIfNew: true });
  const again = await proposals.setJSON("prop:1", { status: "pending" }, { onlyIfNew: true });
  assert.equal(first.modified, true); assert.equal(again.modified, false);

  // Claim for commit exactly once (compare-and-swap with the ETag returned by set()).
  // PITFALLS found while verifying against the local BlobsServer (@netlify/blobs 11.1.11):
  //  1. getWithMetadata()/getMetadata() returned NO etag, and onlyIfMatch: undefined silently becomes
  //     an UNCONDITIONAL write. Always assert the etag is a non-empty string first.
  //  2. Two *concurrent* onlyIfMatch writes with the same etag BOTH succeeded locally. Sequential stale
  //     writes are rejected. Production atomicity was not verifiable here, so the GitHub ref update with
  //     force:false stays the final guard against a double commit (the second update is not a fast-forward).
  const etag = first.etag;
  assert.ok(typeof etag === "string" && etag.length > 0, "need a real etag before a conditional write");
  const claim = await proposals.setJSON("prop:1", { status: "committing", by: "A" }, { onlyIfMatch: etag });
  const late = await proposals.setJSON("prop:1", { status: "committing", by: "B" }, { onlyIfMatch: etag });
  assert.equal(claim.modified, true, "first claim wins");
  assert.equal(late.modified, false, "stale etag is rejected");
  const now = await proposals.get("prop:1", { type: "json" });
  assert.equal(now.by, "A");

  // List. PITFALL 3: list({ prefix }) returned [] locally for every prefix tried (":", "/", none), while
  // list() returned all keys. Beach Day keeps one store per record type, so it never needs prefixes;
  // verify prefix listing on a Deploy Preview before relying on it.
  await proposals.setJSON("prop:2", { status: "pending" });
  const { blobs } = await proposals.list();
  assert.deepEqual(blobs.map((x) => x.key).sort(), ["prop:1", "prop:2"]);
  console.log("ok: Blobs onlyIfNew, onlyIfMatch (stale etag rejected), strong reads, list()");
} finally { await server.stop(); }
