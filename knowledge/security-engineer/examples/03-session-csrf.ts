// Example 3: session cookie + signed CSRF token + Fetch Metadata / Origin checks (OWASP),
// with idle (30 min) and absolute (8 h) timeouts enforced server-side.
// Run: node --experimental-strip-types 03-session-csrf.ts
import { randomBytes, createHmac, timingSafeEqual } from "node:crypto";
import assert from "node:assert/strict";

const SITE_ORIGIN = "https://beachday.example";
const SECRET = randomBytes(32);                     // SESSION_SECRET (env var in production)
const IDLE_MS = 30 * 60_000, ABSOLUTE_MS = 8 * 3600_000;
type Session = { id: string; createdAt: number; lastSeenAt: number };
const sessions = new Map<string, Session>();      // Netlify Blobs "sessions" store in production

export function login(now: number) {
  const id = randomBytes(32).toString("base64url");            // 256 bits from a CSPRNG
  sessions.set(id, { id, createdAt: now, lastSeenAt: now });
  return {
    setCookie: `__Host-bd_session=${id}; Path=/; Secure; HttpOnly; SameSite=Strict`,
    csrfToken: csrfFor(id),
  };
}
const csrfFor = (sid: string) => createHmac("sha256", SECRET).update(`csrf:${sid}`).digest("base64url");

function cookieValue(cookieHeader: string | null, name: string) {
  return cookieHeader?.split(/;\s*/).find(c => c.startsWith(name + "="))?.slice(name.length + 1) ?? null;
}

export function authorize(req: Request, now: number): { ok: true; session: Session } | { ok: false; status: number; reason: string } {
  const sid = cookieValue(req.headers.get("cookie"), "__Host-bd_session");
  const s = sid ? sessions.get(sid) : undefined;
  if (!s) return { ok: false, status: 401, reason: "no session" };
  if (now - s.lastSeenAt > IDLE_MS || now - s.createdAt > ABSOLUTE_MS) { sessions.delete(s.id); return { ok: false, status: 401, reason: "expired" }; }
  if (!["GET", "HEAD"].includes(req.method)) {
    const site = req.headers.get("sec-fetch-site");
    if (site !== null ? site !== "same-origin" : req.headers.get("origin") !== SITE_ORIGIN)
      return { ok: false, status: 403, reason: "cross-site" };
    const given = Buffer.from(req.headers.get("x-csrf-token") ?? ""), want = Buffer.from(csrfFor(s.id));
    if (given.length !== want.length || !timingSafeEqual(given, want)) return { ok: false, status: 403, reason: "bad csrf" };
  }
  s.lastSeenAt = now;
  return { ok: true, session: s };
}
export function logout(req: Request) { const sid = cookieValue(req.headers.get("cookie"), "__Host-bd_session"); if (sid) sessions.delete(sid); }

const { setCookie, csrfToken } = login(0);
assert.match(setCookie, /^__Host-bd_session=[A-Za-z0-9_-]{43}; Path=\/; Secure; HttpOnly; SameSite=Strict$/);
const cookie = setCookie.split(";")[0];
const approve = (h: Record<string, string>) => new Request(SITE_ORIGIN + "/api/proposals/p1/approve", { method: "POST", headers: { cookie, ...h } });

assert.equal(authorize(new Request(SITE_ORIGIN + "/api/agents"), 1000).ok, false, "no cookie -> 401");
assert.equal(authorize(new Request(SITE_ORIGIN + "/api/agents", { headers: { cookie } }), 1000).ok, true);
assert.equal(authorize(approve({ "sec-fetch-site": "same-origin", "x-csrf-token": csrfToken }), 2000).ok, true);
assert.deepEqual(authorize(approve({ "sec-fetch-site": "cross-site", "x-csrf-token": csrfToken }), 3000), { ok: false, status: 403, reason: "cross-site" });
assert.deepEqual(authorize(approve({ origin: "https://evil.example", "x-csrf-token": csrfToken }), 3000), { ok: false, status: 403, reason: "cross-site" });
assert.deepEqual(authorize(approve({ "sec-fetch-site": "same-origin", "x-csrf-token": "forged" }), 3000), { ok: false, status: 403, reason: "bad csrf" });
assert.equal(authorize(approve({ origin: SITE_ORIGIN, "x-csrf-token": csrfToken }), 4000).ok, true);  // no Fetch Metadata -> Origin fallback
assert.deepEqual(authorize(new Request(SITE_ORIGIN + "/api/agents", { headers: { cookie } }), 4000 + IDLE_MS + 1), { ok: false, status: 401, reason: "expired" });
const s2 = login(0); const c2 = s2.setCookie.split(";")[0];
logout(new Request(SITE_ORIGIN + "/api/auth/logout", { method: "POST", headers: { cookie: c2 } }));
assert.equal(authorize(new Request(SITE_ORIGIN + "/api/agents", { headers: { cookie: c2 } }), 10).ok, false, "logout is server-side");
console.log("ok: cookie attributes, CSRF (Fetch Metadata, Origin fallback, HMAC token), idle timeout, server-side logout");
