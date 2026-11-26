// Example 1: shared contracts (src/shared/contracts.ts) with runtime validation at the boundary.
// Discriminated unions for job state; null = unknown; validators narrow `unknown` to typed values.
// Run: node --experimental-strip-types 01-contracts.ts
import assert from "node:assert/strict";

export type Verdict = "great" | "good" | "fair" | "poor" | "no-go";
export type DayForecast = {
  date: string; score: number; verdict: Verdict;
  window: { from: string; to: string } | null; reasons: string[];
  uv: { max: number; category: "low" | "moderate" | "high" | "very-high" | "extreme" };
  confidence: "normal" | "less-certain" | "outlook";
};
export type ForecastResponse = { beach: string; generatedAt: string; attribution: string; days: DayForecast[]; marine: { available: true } | null };

export type Job =
  | { id: string; agent: string; status: "queued"; seq: number }
  | { id: string; agent: string; status: "running"; seq: number; heartbeatAt: number }
  | { id: string; agent: string; status: "done"; seq: number; proposalId: string | null }
  | { id: string; agent: string; status: "error" | "refused" | "interrupted" | "paused"; seq: number; message: string };

const VERDICTS: readonly Verdict[] = ["great", "good", "fair", "poor", "no-go"];
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);
class ContractError extends Error {}

export function parseForecast(x: unknown): ForecastResponse {
  if (!isObj(x) || typeof x.beach !== "string" || typeof x.generatedAt !== "string" || !Array.isArray(x.days))
    throw new ContractError("forecast: bad envelope");
  if (!String(x.attribution ?? "").includes("Open-Meteo")) throw new ContractError("forecast: attribution missing (CC BY 4.0)");
  const days = x.days.map((d, i): DayForecast => {
    if (!isObj(d) || typeof d.score !== "number" || !VERDICTS.includes(d.verdict as Verdict)) throw new ContractError(`day ${i}: bad`);
    return d as DayForecast;
  });
  return { beach: x.beach, generatedAt: x.generatedAt, attribution: String(x.attribution), days, marine: x.marine === null ? null : { available: true } };
}

// Exhaustive handling: adding a status without handling it is a compile error (the `never` check).
export function jobLabel(j: Job): string {
  switch (j.status) {
    case "queued": return "Waiting to start";
    case "running": return "Working…";
    case "done": return j.proposalId ? "Proposal ready" : "Done";
    case "error": case "refused": case "interrupted": case "paused": return j.message;
    default: { const never: never = j; return never; }
  }
}

const ok = parseForecast({ beach: "south-beach", generatedAt: "2026-11-26T14:00:00Z", attribution: "Weather data by Open-Meteo.com (CC BY 4.0)",
  marine: null, days: [{ date: "2026-11-26", score: 87, verdict: "great", window: { from: "10:00", to: "13:00" }, reasons: ["feels"], uv: { max: 5.45, category: "moderate" }, confidence: "normal" }] });
assert.equal(ok.days[0]?.verdict, "great");
assert.equal(ok.marine, null);
assert.throws(() => parseForecast({ beach: "x", generatedAt: "t", days: [] }), /attribution/);
assert.throws(() => parseForecast({ beach: "x", generatedAt: "t", attribution: "Open-Meteo", days: [{ score: 1, verdict: "meh" }] }), /day 0/);
assert.equal(jobLabel({ id: "1", agent: "qa-engineer", status: "done", seq: 3, proposalId: "p1" }), "Proposal ready");
console.log("ok: contracts validate at the boundary and job states are exhaustive");
