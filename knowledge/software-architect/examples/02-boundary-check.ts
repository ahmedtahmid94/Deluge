// Example 2: architecture boundary checker (would run in CI). Flags:
//  - public app code importing console code
//  - browser code calling third-party origins (CSP connect-src 'self'; all external calls go through functions)
//  - env names with VITE_ that look like secrets (Vite inlines VITE_* into the bundle)
//  - I/O inside src/shared (pure modules)
// Run: node --experimental-strip-types 02-boundary-check.ts
import assert from "node:assert/strict";

type Files = Record<string, string>;
export function checkBoundaries(files: Files): string[] {
  const out: string[] = [];
  for (const [path, src] of Object.entries(files)) {
    const browser = path.startsWith("src/app/") || path.startsWith("src/console/ui/");
    if (path.startsWith("src/app/") && /from\s+["'][^"']*console\//.test(src)) out.push(`${path}: public app imports console code`);
    if (browser && /fetch\(\s*["'`]https?:\/\//.test(src)) out.push(`${path}: browser calls a third-party origin; use /api/* via a function`);
    if (/VITE_[A-Z_]*(KEY|TOKEN|SECRET|PASSWORD)/.test(src)) out.push(`${path}: secret-like VITE_ variable would be bundled`);
    if (path.startsWith("src/shared/") && /\b(fetch\(|getStore\(|Netlify\.env|process\.env|Date\.now\(\))/.test(src)) out.push(`${path}: I/O or clock in a pure module`);
  }
  return out;
}

const bad: Files = {
  "src/app/today.ts": `import { renderChat } from "../console/ui/chat"; fetch("https://api.open-meteo.com/v1/forecast")`,
  "src/shared/scoring.ts": `export const now = () => Date.now();`,
  "src/app/env.ts": `const k = import.meta.env.VITE_ANTHROPIC_KEY;`,
};
const good: Files = {
  "src/app/today.ts": `import { scoreDay } from "../shared/scoring"; fetch("/api/forecast?beach=" + id)`,
  "src/shared/scoring.ts": `export function scoreDay(hours, now) { return now; }`,
  "netlify/functions/forecast.mts": `await fetch("https://api.open-meteo.com/v1/forecast?...")`,   // server-side: allowed
};
const problems = checkBoundaries(bad);
problems.forEach(p => console.log("FAIL", p));
assert.equal(problems.length, 4);
assert.deepEqual(checkBoundaries(good), []);
console.log("ok: boundary checker flags 4 violations and passes the clean tree");
