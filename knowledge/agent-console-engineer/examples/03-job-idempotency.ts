// Example 3: background-job state machine that survives Netlify's background-function retries
// (retried after 1 and 3 minutes on error). In-memory store with ETag-style conditional writes,
// mirroring Netlify Blobs' onlyIfMatch. Run: node --experimental-strip-types 03-job-idempotency.ts
import assert from "node:assert/strict";

type Job = { id: string; status: "queued" | "running" | "done" | "error" | "interrupted"; heartbeatAt: number; modelCalls: number };
class FakeStore {
  private m = new Map<string, { v: string; etag: number }>();
  async get(k: string) { const e = this.m.get(k); return e ? { data: JSON.parse(e.v) as Job, etag: String(e.etag) } : null; }
  async set(k: string, v: Job, opts: { onlyIfMatch?: string; onlyIfNew?: boolean } = {}) {
    const cur = this.m.get(k);
    if (opts.onlyIfNew && cur) return { modified: false };
    if (opts.onlyIfMatch !== undefined && (!cur || String(cur.etag) !== opts.onlyIfMatch)) return { modified: false };
    this.m.set(k, { v: JSON.stringify(v), etag: (cur?.etag ?? 0) + 1 });
    return { modified: true };
  }
}

const STALE_MS = 90_000;
export async function runJob(store: FakeStore, id: string, now: () => number, callModel: () => Promise<void>) {
  const got = await store.get(id);
  if (!got) return "missing";
  const { data: job, etag } = got;
  if (job.status === "done" || job.status === "error" || job.status === "interrupted") return "already-finished";
  if (job.status === "running") {
    if (now() - job.heartbeatAt < STALE_MS) return "already-running";
    await store.set(id, { ...job, status: "interrupted" }, { onlyIfMatch: etag });   // never call the model twice
    return "marked-interrupted";
  }
  const claim = await store.set(id, { ...job, status: "running", heartbeatAt: now() }, { onlyIfMatch: etag });
  if (!claim.modified) return "lost-race";                                         // another invocation claimed it
  await callModel();
  const after = (await store.get(id))!;
  await store.set(id, { ...after.data, status: "done", modelCalls: after.data.modelCalls + 1 }, { onlyIfMatch: after.etag });
  return "ran";
}

const store = new FakeStore();
let t = 0; const now = () => t; let calls = 0;
await store.set("job:1", { id: "job:1", status: "queued", heartbeatAt: 0, modelCalls: 0 }, { onlyIfNew: true });
assert.equal(await runJob(store, "job:1", now, async () => { calls++; }), "ran");
assert.equal(await runJob(store, "job:1", now, async () => { calls++; }), "already-finished"); // retry is a no-op
assert.equal(calls, 1);

// A crashed run: status running with an old heartbeat -> retry marks it interrupted, no second model call.
await store.set("job:2", { id: "job:2", status: "running", heartbeatAt: 0, modelCalls: 0 }, { onlyIfNew: true });
t = 120_000;
assert.equal(await runJob(store, "job:2", now, async () => { calls++; }), "marked-interrupted");
assert.equal(calls, 1);

// Two concurrent invocations on a queued job: exactly one runs.
await store.set("job:3", { id: "job:3", status: "queued", heartbeatAt: 0, modelCalls: 0 }, { onlyIfNew: true });
const results = await Promise.all([runJob(store, "job:3", now, async () => { calls++; }), runJob(store, "job:3", now, async () => { calls++; })]);
assert.deepEqual(results.sort(), ["lost-race", "ran"]);
assert.equal(calls, 2);
console.log("ok: job idempotency verified (retry no-op, stale -> interrupted, race -> one runner)");
