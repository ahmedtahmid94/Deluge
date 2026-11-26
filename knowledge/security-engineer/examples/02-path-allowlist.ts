// Example 2: validate agent-proposed paths with "accept known good" (OWASP), tested with OWASP's
// traversal encodings and Beach Day's deny-list. Run: node --experimental-strip-types 02-path-allowlist.ts
import { posix } from "node:path";
import assert from "node:assert/strict";

const ALLOW = ["src/app/**", "src/shared/**", "src/console/ui/**", "public/icons/**", "public/screens/**",
  "src/data/beaches.json", "tests/**", "docs/**", ".claude/agents/**", ".claude/skills/**"];
const DENY = ["netlify/**", "netlify.toml", "public/_headers", "public/_redirects", "package.json", "package-lock.json",
  "pnpm-lock.yaml", ".npmrc", ".github/**", "scripts/**", "vite.config.*", "tsconfig*.json", "src/console/server/**",
  "src/shared/models.ts", ".env*", "**/*.pem", "**/*.key", "CLAUDE.md"];

// Minimal glob: ** = any depth, * = within one segment. Anchored, case-sensitive.
function globToRegex(g: string): RegExp {
  const re = g.split("**").map(s => s.split("*").map(x => x.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join("[^/]*")).join(".*");
  return new RegExp(`^${re.replace(/^\.\*\//, "(?:.*/)?")}$`);
}
const allowRe = ALLOW.map(globToRegex), denyRe = DENY.map(globToRegex);

export type FileChange = { path: string; action: "create" | "update" | "delete"; content?: string; mode?: string };
export function checkPath(p: unknown): string | null {          // returns a reason, or null if allowed
  if (typeof p !== "string" || p.length === 0 || p.length > 200) return "bad length";
  if (/[\u0000-\u001f\u007f\\%]/.test(p)) return "control char, backslash or percent-encoding";
  if (p !== p.trim()) return "leading/trailing space";
  if (p.startsWith("/") || p.includes("//")) return "absolute or empty segment";
  if (p.split("/").some(s => s === ".." || s === ".")) return "dot segment";
  if (posix.normalize(p) !== p) return "not normalized";
  if (denyRe.some(r => r.test(p))) return "denied path";
  if (!allowRe.some(r => r.test(p)) || p === "src/shared/models.ts") return "not in allow-list";
  return null;
}
export function validateProposal(files: FileChange[]): string[] {
  const errs: string[] = [];
  if (files.length === 0 || files.length > 20) errs.push("1-20 files");
  let total = 0;
  for (const f of files) {
    const why = checkPath(f.path); if (why) errs.push(`${f.path}: ${why}`);
    if ((f.mode ?? "100644") !== "100644") errs.push(`${f.path}: mode ${f.mode} not allowed`);
    const bytes = Buffer.byteLength(f.content ?? "", "utf8"); total += bytes;
    if (bytes > 200 * 1024) errs.push(`${f.path}: over 200 KB`);
    if (f.content !== undefined && f.content.includes("\uFFFD")) errs.push(`${f.path}: not valid UTF-8 text`);
  }
  if (total > 1024 * 1024) errs.push("over 1 MB total");
  return errs;
}

const hostile = [
  "../netlify.toml", "src/app/../../netlify/functions/x.ts", "/etc/passwd", "netlify/functions/agents.mts", "netlify.toml",
  "package.json", ".github/workflows/ci.yml", "src\\app\\x.ts", "src/app/%2e%2e/x", "src/app/%2e%2e%2fx", "src/app/..%c0%af/x",
  "src/app/%252e%252e%255c", "src/app/x.ts ", " src/app/x.ts", "src/app/x.ts\u0000.png", ".env", ".env.production",
  "keys/server.pem", "src/console/server/auth.ts", "src/shared/models.ts", "scripts/build-agents.ts", "vite.config.ts",
  "tsconfig.json", "CLAUDE.md", "src//app/x.ts", "src/./app/x.ts", "README.md", "public/_headers", "docs/../netlify.toml",
];
for (const p of hostile) assert.ok(checkPath(p) !== null, `should reject: ${JSON.stringify(p)}`);
const safe = ["src/app/dayCard.ts", "src/shared/scoring.ts", "docs/notes.md", "tests/scoring.test.ts",
  ".claude/agents/qa-engineer.md", ".claude/skills/ux-writing/SKILL.md", "src/data/beaches.json", "public/icons/icon-192.png"];
for (const p of safe) assert.equal(checkPath(p), null, `should accept: ${p}`);
assert.deepEqual(validateProposal([{ path: "src/app/a.ts", action: "update", content: "x", mode: "120000" }]), ["src/app/a.ts: mode 120000 not allowed"]);
assert.ok(validateProposal(Array.from({ length: 21 }, (_, i) => ({ path: `src/app/f${i}.ts`, action: "create" as const, content: "" }))).includes("1-20 files"));
assert.ok(validateProposal([{ path: "src/app/big.ts", action: "create", content: "x".repeat(200 * 1024 + 1) }])[0].includes("over 200 KB"));
console.log(`ok: rejected ${hostile.length} hostile paths, accepted ${safe.length} safe paths, limits enforced`);
