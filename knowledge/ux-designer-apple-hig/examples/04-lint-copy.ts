// Lints the copy deck against HIG Writing + Beach Day safety rules.
// Run: node --experimental-strip-types 04-lint-copy.ts 03-copy-deck.json
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

type Rule = { id: string; test: (key: string, text: string) => boolean; why: string };
const RULES: Rule[] = [
  { id: "no-safe", test: (_, t) => /\bsafe(ly|ty)?\b/i.test(t) && !/safety/i.test(t), why: "Never call conditions 'safe' (Beach Day safety rule)" },
  { id: "no-we", test: (_, t) => /\b(we|we're|we've|our)\b/i.test(t), why: "HIG Writing: avoid 'we'" },
  { id: "no-oops", test: (_, t) => /\b(oops|uh-oh|whoops)\b/i.test(t), why: "HIG Writing: interjections sound insincere" },
  { id: "no-click", test: (_, t) => /\bclick\b/i.test(t), why: "HIG Writing: say 'tap' on touch devices" },
  { id: "no-click-here", test: (_, t) => /\bhere\b/i.test(t) && /\b(tap|click)\b/i.test(t), why: "HIG Writing: descriptive link text" },
  { id: "no-bang-in-warnings", test: (k, t) => /^(safety|state)\./.test(k) && t.includes("!"), why: "No exclamation marks in warnings" },
  { id: "no-ok-yes", test: (k, t) => /^console\..*\.(confirm|cancel)$/.test(k) && /^(ok|yes|no)$/i.test(t.trim()), why: "HIG Alerts: use specific verbs, not OK/Yes/No" },
  { id: "rip-current-link-out", test: (k, t) => /rip current/i.test(t) && !/NWS|National Weather Service/.test(t), why: "Decision D1: rip-current text must point to the NWS" },
  { id: "sentence-case-buttons", test: (k, t) => /^button\./.test(k) && /\s[A-Z][a-z]/.test(t.replace("Beach Day", "")), why: "Beach Day uses sentence case" },
];
export function lint(deck: Record<string, string>) {
  return Object.entries(deck).flatMap(([k, t]) => RULES.filter(r => r.test(k, t)).map(r => `${k}: ${r.id} — ${r.why}`));
}
const deck = JSON.parse(readFileSync(process.argv[2] ?? "03-copy-deck.json", "utf8"));
const problems = lint(deck);
problems.forEach(p => console.log("FAIL", p));
// Self-test: the linter catches the anti-patterns it claims to.
assert.deepEqual(lint({ "state.error": "Oops! We're having trouble." }).length, 3);
assert.equal(lint({ "safety.x": "Rip currents are low today" }).length, 1);
assert.equal(lint({ "console.approve.confirm": "OK" }).length, 1);
assert.equal(lint({ "verdict.x": "Safe to swim" }).length, 1);
assert.equal(problems.length, 0);
console.log(`ok: ${Object.keys(deck).length} strings pass the copy rules`);
