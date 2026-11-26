// Example 3: fetch both endpoints in parallel with a timeout, one retry on 5xx,
// marine failure -> marine: null, and a stale cached copy on forecast failure.
// Uses a fake fetch so it runs offline. Run: node --experimental-strip-types 03-fetch-with-fallback.ts
import assert from "node:assert/strict";

type Fetch = (url: string, init?: { signal?: AbortSignal }) => Promise<Response>;
type Result = { forecast: unknown; marine: unknown | null; stale: boolean };

async function getJson(fetchFn: Fetch, url: string, timeoutMs = 8000): Promise<unknown> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetchFn(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (res.ok) {
      const body = await res.json() as { error?: boolean; reason?: string };
      if (body?.error) throw new Error(`open-meteo: ${body.reason}`);
      return body;
    }
    if (res.status < 500) throw new Error(`open-meteo HTTP ${res.status}`); // 4xx: don't retry
  }
  throw new Error("open-meteo: 5xx after retry");
}

async function loadBeach(fetchFn: Fetch, fUrl: string, mUrl: string, cache: Map<string, Result>, key: string): Promise<Result> {
  const [f, m] = await Promise.allSettled([getJson(fetchFn, fUrl), getJson(fetchFn, mUrl)]);
  if (f.status === "rejected") {
    const old = cache.get(key);
    if (old) return { ...old, stale: true };
    throw f.reason;
  }
  const result: Result = { forecast: f.value, marine: m.status === "fulfilled" ? m.value : null, stale: false };
  cache.set(key, result);
  return result;
}

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json" } });
const cache = new Map<string, Result>();

// 1) forecast ok, marine 400 -> marine null
let r = await loadBeach(async (u) => u.includes("marine") ? json({ error: true, reason: "bad" }, 400) : json({ hourly: {} }), "f", "marine", cache, "sb");
assert.deepEqual(r, { forecast: { hourly: {} }, marine: null, stale: false });

// 2) forecast 503 then 200 -> retried and succeeds
let calls = 0;
r = await loadBeach(async (u) => u.includes("marine") ? json({ m: 1 }) : (++calls === 1 ? json({}, 503) : json({ ok: 1 })), "f", "marine", cache, "sb");
assert.equal(calls, 2); assert.deepEqual(r.forecast, { ok: 1 });

// 3) forecast down twice -> stale cached copy
r = await loadBeach(async () => json({}, 503), "f", "marine", cache, "sb");
assert.equal(r.stale, true); assert.deepEqual(r.forecast, { ok: 1 });
console.log("ok: fallback behaviour verified");
