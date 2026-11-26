// The worked example from docs/01, plus every gate. Run: node --experimental-strip-types 01-worked-example.test.ts
import assert from "node:assert/strict";
import { scoreHour, scoreDay, band, type Hour } from "./scoring.ts";

const nice = (time: string, o: Partial<Hour> = {}): Hour => ({ time, rainPct: 10, rainIn: 0, code: 1, cloudPct: 10, windMph: 9,
  gustMph: 14, feelsF: 86, waveFt: 1.5, seaTempF: 82, ...o });

// docs/01: 10 am perfect -> 100 Great; 3 pm thunderstorm -> No-go; day still Great via the morning window.
assert.equal(scoreHour(nice("2026-07-04T10:00")).score, 100);
assert.equal(band(100), "great");
const storm = scoreHour(nice("2026-07-04T15:00", { rainPct: 60, code: 95 }));
assert.deepEqual([storm.score, storm.caps], [0, ["lightning"]]);
const day = Array.from({ length: 24 }, (_, h) => nice(`2026-07-04T${String(h).padStart(2, "0")}:00`,
  h >= 15 && h <= 17 ? { rainPct: 70, code: 95 } : {}));
const d = scoreDay(day, "2026-07-04T06:35", "2026-07-04T20:15");
assert.equal(d.verdict, "great");
assert.deepEqual(d.window, { from: "08:00", to: "15:00" });
assert.ok(d.gates.includes("lightning") && d.gates.includes("after-lightning"));

// Gates
assert.equal(scoreHour(nice("t", { feelsF: 104 })).caps[0], "dangerous-heat");
assert.ok(scoreHour(nice("t", { feelsF: 104 })).score <= 49);
assert.equal(scoreHour(nice("t", { feelsF: 126 })).score, 0);
assert.equal(scoreHour(nice("t", { waveFt: 6 })).score, 0);
assert.ok(scoreHour(nice("t", { waveFt: 4.5 })).score <= 64);
assert.ok(scoreHour(nice("t", { gustMph: 36 })).score <= 49);
// Steady rain (WMO 61-67 / 80-82 with >= 70% chance) caps the hour at Poor.
assert.ok(scoreHour(nice("t", { code: 63, rainPct: 90, rainIn: 0.05 })).score <= 49);
// A day with no 3-hour good window can't be better than Poor even if its best 4 hours average >= 50.
const choppy = Array.from({ length: 24 }, (_, h) => nice(`2026-07-05T${String(h).padStart(2, "0")}:00`, h % 2 ? { code: 63, rainPct: 80 } : { rainPct: 40, windMph: 16 }));
assert.equal(scoreDay(choppy, "2026-07-05T06:35", "2026-07-05T20:15").verdict, "poor");
// Missing marine data: still scored, weights redistributed (not penalised).
assert.equal(scoreHour(nice("t", { waveFt: null, seaTempF: null })).score, 100);
// Monotonic: worse wind never raises the score.
for (let w = 0; w < 30; w++) assert.ok(scoreHour(nice("t", { windMph: w + 1, gustMph: w + 1 })).score <= scoreHour(nice("t", { windMph: w, gustMph: w })).score);
console.log("ok: worked example and all gates behave as specified");
