// Runs the function handler directly with Request objects and a fake upstream.
// Run: node --experimental-strip-types 01-forecast-function.test.mts
import assert from "node:assert/strict";
import handler, { config } from "./01-forecast-function.mts";

const calls: string[] = [];
globalThis.fetch = (async (input: string | URL | Request) => {
  const url = String(input); calls.push(url);
  if (url.includes("marine")) return new Response("{}", { status: 503 });
  return Response.json({ hourly: { time: [1], temperature_2m: [80] } });
}) as typeof fetch;
const ctx = {} as Parameters<typeof handler>[1];

let res = await handler(new Request("https://site.example/api/forecast?beach=atlantis"), ctx);
assert.equal(res.status, 400); assert.equal(res.headers.get("cache-control"), "no-store");
assert.equal(calls.length, 0, "unknown beach never reaches upstream (not an open proxy)");

res = await handler(new Request("https://site.example/api/forecast?beach=south-beach"), ctx);
const body = await res.json();
assert.equal(res.status, 200);
assert.equal(body.marine, null, "marine failure -> null, not an error");
assert.match(res.headers.get("netlify-cdn-cache-control")!, /durable/);
assert.ok(calls.every(u => u.includes("timezone=America%2FNew_York")));
assert.equal(config.path, "/api/forecast");
console.log("ok: forecast function —", res.status, res.headers.get("netlify-cdn-cache-control"));
