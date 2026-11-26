// Example 1: hash and verify the console password with scrypt at OWASP's minimum (N=2^17, r=8, p=1).
// Run: node --experimental-strip-types 01-password-hash.ts
import { scrypt as scryptCb, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import assert from "node:assert/strict";
const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, o: object) => Promise<Buffer>;

const LOG_N = 17, R = 8, P = 1, KEYLEN = 32;
const MAXMEM = 256 * 1024 * 1024;   // Node's default (32 MiB) is too small for N=2^17 (128 MiB)

export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(pw, salt, KEYLEN, { N: 2 ** LOG_N, r: R, p: P, maxmem: MAXMEM });
  return `scrypt$${LOG_N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, logN, r, p, saltB64, keyB64] = parts;
  const expected = Buffer.from(keyB64, "base64");
  const key = await scrypt(pw, Buffer.from(saltB64, "base64"), expected.length,
    { N: 2 ** Number(logN), r: Number(r), p: Number(p), maxmem: MAXMEM });
  return key.length === expected.length && timingSafeEqual(key, expected);   // constant-time
}

const t0 = performance.now();
const stored = await hashPassword("correct horse battery staple");
const ms = Math.round(performance.now() - t0);
assert.match(stored, /^scrypt\$17\$8\$1\$[A-Za-z0-9+/=]{24}\$[A-Za-z0-9+/=]{44}$/);
assert.equal(await verifyPassword("correct horse battery staple", stored), true);
assert.equal(await verifyPassword("wrong", stored), false);
assert.equal(await verifyPassword("x", "garbage"), false);
assert.notEqual(await hashPassword("same"), await hashPassword("same"), "random salt per hash");
await assert.rejects(promisify(scryptCb)("pw", "salt", 32, { N: 2 ** 17, r: 8, p: 1 }), /memory limit/i, "default maxmem fails");
console.log(`ok: scrypt N=2^17 r=8 p=1 hash in ${ms} ms; verify and constant-time compare work`);
