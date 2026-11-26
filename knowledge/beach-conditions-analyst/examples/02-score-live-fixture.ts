// Scores the real South Beach forecast captured 2026-11-25 (rainy day, then a clear, breezy, cool day).
// Run: node --experimental-strip-types 02-score-live-fixture.ts
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { scoreDay, type Hour } from "./scoring.ts";

const dir = new URL("../../open-meteo-integrator/examples/fixtures/", import.meta.url);
const f = JSON.parse(readFileSync(new URL("forecast-south-beach-2026-11-25.json", dir), "utf8"));
const m = JSON.parse(readFileSync(new URL("marine-south-beach-2026-11-25.json", dir), "utf8"));
assert.equal(m.hourly_units.sea_surface_temperature, "°C");
const hours: Hour[] = f.hourly.time.map((t: string, i: number) => ({
  time: t, rainPct: f.hourly.precipitation_probability[i], rainIn: f.hourly.precipitation[i], code: f.hourly.weather_code[i],
  cloudPct: f.hourly.cloud_cover[i], windMph: f.hourly.wind_speed_10m[i], gustMph: f.hourly.wind_gusts_10m[i],
  feelsF: f.hourly.apparent_temperature[i], waveFt: m.hourly.wave_height[i], seaTempF: m.hourly.sea_surface_temperature[i] * 9 / 5 + 32,
}));
for (const [k, date] of f.daily.time.entries()) {
  const day = scoreDay(hours.filter(h => h.time.startsWith(date)), f.daily.sunrise[k], f.daily.sunset[k]);
  console.log(date, { score: day.score, verdict: day.verdict, window: day.window, reasons: day.reasons, gates: day.gates });
  if (date === "2026-11-25") assert.ok(["poor", "no-go"].includes(day.verdict), "all-day heavy rain is not a beach day");
  if (date === "2026-11-26") { assert.ok(day.score > 25, "clear day scores higher than the rainy one"); assert.ok(day.reasons.includes("wind") || day.reasons.includes("feels")); }
}
console.log("ok: live fixture scored");
