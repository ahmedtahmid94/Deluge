// Run: node --experimental-strip-types 03-agent-start.test.mts
import assert from "node:assert/strict";
import { makeHandler } from "./03-agent-start.mts";

const stored = new Map<string, object>();
let forwarded: Request | undefined;
const handler = makeHandler(
  { create: async (k, v) => (stored.has(k) ? false : (stored.set(k, v), true)) },
  (k) => (k === "INTERNAL_JOB_SECRET" ? "s3cret" : undefined),
  (async (url: URL, init: RequestInit) => { forwarded = new Request(url, init); return new Response(null, { status: 202 }); }) as unknown as typeof fetch,
);
const ctx = {} as Parameters<typeof handler>[1];
const res = await handler(new Request("https://site.example/api/agent/jobs", { method: "POST", body: JSON.stringify({ agent: "qa-engineer", message: "run tests" }) }), ctx);
assert.equal(res.status, 202);
const { jobId } = await res.json();
assert.ok(stored.has(`job:${jobId}`), "job stored as queued before the worker runs");
assert.equal(forwarded!.headers.get("x-internal-secret"), "s3cret");
assert.equal(new URL(forwarded!.url).pathname, "/api/agent/run");
assert.equal((await handler(new Request("https://site.example/api/agent/jobs"), ctx)).status, 405);
console.log("ok: start-job handoff verified (job", jobId.slice(0, 8) + "…)");
