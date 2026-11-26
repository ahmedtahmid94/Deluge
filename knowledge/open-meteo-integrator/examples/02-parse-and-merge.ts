// Example 2: validate real Open-Meteo responses and merge forecast + marine by hour.
// Uses the live fixtures in ./fixtures (iso8601 time format, captured 2026-11-25).
// Run: node --experimental-strip-types 02-parse-and-merge.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

type Hour = {
  time: string; tempF: number | null; feelsF: number | null; rainPct: number | null;
  windMph: number | null; gustMph: number | null; code: number | null; uv: number | null;
  waveFt: number | null; seaTempF: number | null;
};

function isObj(x: unknown): x is Record<string, unknown> { return typeof x === "object" && x !== null; }

// Throws on shape errors; returns the hourly block with arrays checked against `time`.
function readHourly(body: unknown, required: string[], units: Record<string, string>) {
  if (!isObj(body)) throw new Error("not an object");
  if (body.error === true) throw new Error(`open-meteo error: ${String(body.reason)}`);
  const hourly = body.hourly, hu = body.hourly_units;
  if (!isObj(hourly) || !isObj(hu) || !Array.isArray(hourly.time)) throw new Error("missing hourly");
  const n = hourly.time.length;
  for (const k of required) {
    const arr = hourly[k];
    if (!Array.isArray(arr) || arr.length !== n) throw new Error(`bad array: ${k}`);
  }
  for (const [k, unit] of Object.entries(units)) {
    if (hu[k] !== unit) throw new Error(`unexpected unit for ${k}: ${String(hu[k])}`);
  }
  return hourly as Record<string, unknown[]> & { time: string[] };
}

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const cToF = (c: number | null) => (c === null ? null : Math.round((c * 9 / 5 + 32) * 10) / 10);

const fc = readHourly(JSON.parse(readFileSync(new URL("./fixtures/forecast-south-beach-2026-11-25.json", import.meta.url), "utf8")),
  ["temperature_2m", "apparent_temperature", "precipitation_probability", "wind_speed_10m", "wind_gusts_10m", "weather_code", "uv_index"],
  { temperature_2m: "°F", wind_speed_10m: "mp/h" });  // note: Open-Meteo labels mph as "mp/h"
const mr = readHourly(JSON.parse(readFileSync(new URL("./fixtures/marine-south-beach-2026-11-25.json", import.meta.url), "utf8")),
  ["wave_height", "sea_surface_temperature"],
  { wave_height: "ft", sea_surface_temperature: "°C" }); // SST stays Celsius even with length_unit=imperial

const marineAt = new Map(mr.time.map((t, i) => [t, i]));
const hours: Hour[] = fc.time.map((t, i) => {
  const j = marineAt.get(t);
  return {
    time: t, tempF: num(fc.temperature_2m[i]), feelsF: num(fc.apparent_temperature[i]),
    rainPct: num(fc.precipitation_probability[i]), windMph: num(fc.wind_speed_10m[i]),
    gustMph: num(fc.wind_gusts_10m[i]), code: num(fc.weather_code[i]), uv: num(fc.uv_index[i]),
    waveFt: j === undefined ? null : num(mr.wave_height[j]),
    seaTempF: j === undefined ? null : cToF(num(mr.sea_surface_temperature[j])),
  };
});

assert.equal(hours.length, 48);
const tenAmNov26 = hours.find(h => h.time === "2026-11-26T10:00")!;
assert.deepEqual(tenAmNov26, { time: "2026-11-26T10:00", tempF: 71.4, feelsF: 69.7, rainPct: 0, windMph: 14.3,
  gustMph: 28, code: 0, uv: 3.3, waveFt: 2.165, seaTempF: 77 });
// Error bodies are rejected:
assert.throws(() => readHourly({ error: true, reason: "Invalid value" }, [], {}), /open-meteo error/);
console.log(tenAmNov26);
console.log("ok: parsed", hours.length, "merged hours");
