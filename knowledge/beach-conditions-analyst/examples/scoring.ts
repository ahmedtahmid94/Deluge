// Reference implementation of the Beach Day scoring model (docs/01). Pure functions, no I/O.
export type Hour = {
  time: string;               // local "YYYY-MM-DDTHH:00"
  rainPct: number | null; rainIn: number | null; code: number | null; cloudPct: number | null;
  windMph: number | null; gustMph: number | null; feelsF: number | null;
  waveFt: number | null; seaTempF: number | null;
};
export type Verdict = "great" | "good" | "fair" | "poor" | "no-go";
export type Scored = { time: string; score: number; caps: string[]; lost: Record<string, number> };

const THUNDER = new Set([95, 96, 99]);
const clamp = (x: number) => Math.max(0, Math.min(100, x));
const lerpDown = (v: number, full: number, zero: number) => clamp(100 * (zero - v) / (zero - full));  // 100 at <=full, 0 at >=zero

function components(h: Hour) {
  const rain = h.rainPct === null ? null : Math.min(lerpDown(h.rainPct, 10, 70), h.rainIn === null ? 100 : lerpDown(h.rainIn, 0, 0.1));
  const sky = h.code === null ? null : h.code <= 1 ? 100 : h.code === 2 ? 75 : (h.code === 3 || h.code === 45 || h.code === 48) ? 0
    : h.cloudPct === null ? 30 : lerpDown(h.cloudPct, 30, 90);
  const wind = h.windMph === null ? null : (h.gustMph ?? 0) >= 30 ? 0 : lerpDown(h.windMph, 12, 25);
  const feels = h.feelsF === null ? null : h.feelsF < 78 ? clamp(100 * (h.feelsF - 65) / (78 - 65)) : lerpDown(h.feelsF, 90, 103);
  const sea = h.waveFt === null ? null : lerpDown(h.waveFt, 2, 5);
  const water = h.seaTempF === null ? null : h.seaTempF > 86 ? 100 : clamp(100 * (h.seaTempF - 70) / (78 - 70));
  return { rain, sky, wind, feels, sea, water };
}
const WEIGHTS = { rain: 30, sky: 15, wind: 20, feels: 20, sea: 10, water: 5 } as const;

export function scoreHour(h: Hour, prevThunder = false): Scored {
  const c = components(h);
  const present = (Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]).filter(k => c[k] !== null);
  const totalW = present.reduce((s, k) => s + WEIGHTS[k], 0);       // missing marine -> weights redistributed
  let score = 0; const lost: Record<string, number> = {};
  for (const k of present) {
    const w = WEIGHTS[k] / totalW;
    score += w * (c[k] as number);
    lost[k] = Math.round(w * (100 - (c[k] as number)));
  }
  const caps: string[] = [];
  const cap = (max: number, why: string) => { if (score > max) score = max; caps.push(why); };
  if (h.code !== null && THUNDER.has(h.code)) cap(0, "lightning");
  else if (prevThunder) cap(49, "after-lightning");
  if (h.feelsF !== null && h.feelsF >= 125) cap(0, "extreme-heat"); else if (h.feelsF !== null && h.feelsF >= 103) cap(49, "dangerous-heat");
  if (h.waveFt !== null && h.waveFt >= 6) cap(0, "rough-surf"); else if (h.waveFt !== null && h.waveFt >= 4) cap(64, "rough-surf");
  if (h.gustMph !== null && h.gustMph >= 35) cap(49, "strong-gusts");
  // Added 2026-11-26 after scoring a real all-day-rain fixture rated "Fair" (see README): steady rain caps the hour.
  const rainy = h.code !== null && ((h.code >= 61 && h.code <= 67) || (h.code >= 80 && h.code <= 82));
  if (rainy && (h.rainPct ?? 0) >= 70) cap(49, "steady-rain");
  return { time: h.time, score: Math.round(score), caps, lost };
}

export const band = (s: number): Verdict => s >= 80 ? "great" : s >= 65 ? "good" : s >= 50 ? "fair" : s >= 30 ? "poor" : "no-go";

export function scoreDay(hours: Hour[], sunrise: string, sunset: string) {
  const hourOf = (t: string) => Number(t.slice(11, 13));
  const start = Math.max(8, hourOf(sunrise) + 1 + (Number(sunrise.slice(14, 16)) > 0 ? 1 : 0));
  const end = Math.min(19, hourOf(sunset) - 1);                     // last full hour before sunset-1h
  const scored: Scored[] = [];
  let prevThunder = false;
  for (const h of hours) {
    const s = scoreHour(h, prevThunder); prevThunder = h.code !== null && THUNDER.has(h.code);
    if (hourOf(h.time) >= start && hourOf(h.time) < end) scored.push(s);
  }
  // Best window: highest-mean run of >= 3 consecutive hours all scoring >= 60.
  let best: { from: number; to: number; mean: number } | null = null;
  for (let i = 0; i < scored.length; i++) for (let j = i + 2; j < scored.length; j++) {
    const run = scored.slice(i, j + 1); if (run.some(s => s.score < 60)) break;
    const mean = run.reduce((a, s) => a + s.score, 0) / run.length;
    if (!best || mean > best.mean || (mean === best.mean && j - i > best.to - best.from)) best = { from: i, to: j, mean };
  }
  // Day score: mean of the best 4 consecutive hours.
  let dayScore = 0;
  const k = Math.min(4, scored.length);
  for (let i = 0; i + k <= scored.length; i++) dayScore = Math.max(dayScore, scored.slice(i, i + k).reduce((a, s) => a + s.score, 0) / k);
  const totals: Record<string, number> = {};
  for (const s of scored) for (const [c, v] of Object.entries(s.lost)) totals[c] = (totals[c] ?? 0) + v;
  const reasons = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 2).filter(([, v]) => v > 0).map(([c]) => c);
  const window = best ? { from: scored[best.from].time.slice(11, 16), to: `${String(hourOf(scored[best.to].time) + 1).padStart(2, "0")}:00` } : null;
  const gates = [...new Set(scored.flatMap(s => s.caps))];
  // Added 2026-11-26: a day with no window of >= 3 good hours can't be better than Poor.
  const verdict = !best && band(Math.round(dayScore)) !== "no-go" && Math.round(dayScore) >= 50 ? "poor" : band(Math.round(dayScore));
  return { score: Math.round(dayScore), verdict, window, reasons, gates, hours: scored };
}
