// Example 3: parse and validate an expert's Handoff block (format from CLAUDE.md) and extract routing.
// Run: node --experimental-strip-types 03-handoff-parser.ts
import assert from "node:assert/strict";

const FIELDS = ["status", "summary", "files", "decisions", "tests", "open-questions", "next", "human-apply"] as const;
type Handoff = Record<(typeof FIELDS)[number], string> & { verdict?: string; route: { agent: string; task: string }[] };
const AGENTS = ["meta-agent", "software-architect", "open-meteo-integrator", "beach-conditions-analyst", "pwa-engineer",
  "ui-designer-apple-liquid-glass", "ux-designer-apple-hig", "accessibility-specialist", "agent-console-engineer",
  "security-engineer", "netlify-engineer", "qa-engineer"];

export function parseHandoff(text: string): Handoff {
  const start = text.lastIndexOf("## Handoff");
  if (start < 0) throw new Error("no Handoff block");
  const out: Record<string, string> = {};
  for (const line of text.slice(start).split("\n").slice(1)) {
    const m = line.match(/^([a-z-]+):\s*(.*)$/); if (m) out[m[1]] = m[2].trim();
  }
  for (const f of FIELDS) if (!(f in out) || out[f] === "") throw new Error(`missing field: ${f}`);
  if (!["done", "blocked", "needs-review"].includes(out.status)) throw new Error(`bad status: ${out.status}`);
  if (out.verdict && !["approve", "approve-with-nits", "changes-required"].includes(out.verdict)) throw new Error(`bad verdict: ${out.verdict}`);
  const route = out.next === "none" ? [] : out.next.split(/;\s*(?=[a-z-]+:)/).map(part => {
    const [agent, ...rest] = part.split(":"); const a = agent.trim();
    if (!AGENTS.includes(a)) throw new Error(`unknown agent in next: ${a}`);
    return { agent: a, task: rest.join(":").trim() };
  });
  return { ...(out as Handoff), route };
}

const sample = `Built the Today screen.

## Handoff
status: needs-review
summary: Today screen built.
files: src/app/today.ts
decisions: none
tests: vitest 42 passed
open-questions: none
next: accessibility-specialist: review contrast and focus; security-engineer: confirm no external fetches
human-apply: none`;
const h = parseHandoff(sample);
assert.deepEqual(h.route.map(r => r.agent), ["accessibility-specialist", "security-engineer"]);
assert.throws(() => parseHandoff(sample.replace("tests: vitest 42 passed\n", "")), /missing field: tests/);
assert.throws(() => parseHandoff(sample.replace("security-engineer:", "random-bot:")), /unknown agent/);
assert.equal(parseHandoff(sample.replace(/next: .*/, "next: none")).route.length, 0);
console.log("ok: handoff parsed; route ->", h.route.map(r => r.agent).join(", "));
