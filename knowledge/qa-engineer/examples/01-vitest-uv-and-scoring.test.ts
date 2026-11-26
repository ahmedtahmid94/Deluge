// Example 1: Vitest table tests at the EPA/Beaufort boundaries, a stubbed fetch, and a frozen clock.
// Run: npx vitest run 01-vitest-uv-and-scoring.test.ts
import { describe, expect, it, test, vi, afterEach } from "vitest";

// --- code under test (would live in src/shared/scoring.ts) ---
export function uvCategory(uv: number): "low" | "moderate" | "high" | "very-high" | "extreme" {
  if (uv < 3) return "low"; if (uv < 6) return "moderate"; if (uv < 8) return "high"; if (uv < 11) return "very-high"; return "extreme";
}
export function windScore(mph: number, gustMph: number): number {     // 100 at ≤12 mph, 0 at ≥25 mph or gusts ≥30
  if (gustMph >= 30 || mph >= 25) return 0;
  if (mph <= 12) return 100;
  return Math.round(100 * (25 - mph) / 13);
}
export async function fetchAge(fetchFn: typeof fetch, now: () => number) {
  const res = await fetchFn("/api/forecast?beach=south-beach");
  const { generatedAt } = await res.json() as { generatedAt: string };
  return Math.round((now() - Date.parse(generatedAt)) / 60000);
}

// --- tests ---
describe("uvCategory (EPA UV Index scale)", () => {
  test.each([[0, "low"], [2.9, "low"], [3, "moderate"], [5.9, "moderate"], [6, "high"], [7.9, "high"],
    [8, "very-high"], [10.9, "very-high"], [11, "extreme"], [13, "extreme"]] as const)("UV %s -> %s", (uv, cat) => {
    expect(uvCategory(uv)).toBe(cat);
  });
});

describe("windScore (Beaufort: ≤12 mph gentle breeze)", () => {
  test.each([[12, 10, 100], [13, 15, 92], [24, 28, 8], [25, 26, 0], [10, 30, 0]])("wind %s gust %s -> %s", (w, g, s) => {
    expect(windScore(w, g)).toBe(s);
  });
  it("never increases when wind rises", () => {
    for (let w = 0; w < 30; w++) expect(windScore(w + 1, 0)).toBeLessThanOrEqual(windScore(w, 0));
  });
});

describe("forecast age with stubbed fetch and frozen time", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
  it("reports minutes since generatedAt", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-26T15:25:00Z"));
    const fake = vi.fn(async () => Response.json({ generatedAt: "2026-11-26T15:00:00Z" }));
    vi.stubGlobal("fetch", fake);
    expect(await fetchAge(fetch, Date.now)).toBe(25);
    expect(fake).toHaveBeenCalledWith("/api/forecast?beach=south-beach");
  });
});
