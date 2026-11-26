// Checks every text/background token pair (and verdict chips) against WCAG AA / Apple's table, light and dark,
// including the glass header composited over its worst-case backgrounds.
// Run: node --experimental-strip-types 02-token-contrast.ts
import assert from "node:assert/strict";
type RGB = [number, number, number];
const hex = (h: string): RGB => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)) as RGB;
const lin = (c: number) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const L = ([r, g, b]: RGB) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a: RGB, b: RGB) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const over = (f: RGB, a: number, bg: RGB): RGB => f.map((c, i) => Math.round(c * a + bg[i] * (1 - a))) as RGB;

const themes = {
  light: { text: "#0b1f33", secondary: "#33506b", accent: "#005f92", card: "#ffffff", glass: ["#ffffff", 0.62], bgs: ["#fdf6e3", "#7fc8f8"] },
  dark:  { text: "#f2f7fb", secondary: "#c3d4e3", accent: "#8fd3ff", card: "#0e2a44", glass: ["#0e2a44", 0.66], bgs: ["#06223a", "#023e8a"] },
} as const;
// Verdict chips: label text on chip fill. Each verdict also has an icon + word (never colour alone).
const verdicts = { great: ["#0b5d1e", "#d7f5dc"], good: ["#1d4f91", "#dcebfb"], fair: ["#7a4b00", "#fdf0d5"], poor: ["#8a2c0d", "#fde3d8"], nogo: ["#ffffff", "#9b1c1c"] };

let failures = 0;
const check = (name: string, fg: RGB, bg: RGB, min: number) => {
  const r = ratio(fg, bg); const ok = r >= min; if (!ok) failures++;
  console.log(`${ok ? "pass" : "FAIL"}  ${name.padEnd(34)} ${r.toFixed(2)}:1 (min ${min})`);
};
for (const [name, t] of Object.entries(themes)) {
  check(`${name} body on card`, hex(t.text), hex(t.card), 4.5);
  check(`${name} secondary on card`, hex(t.secondary), hex(t.card), 4.5);
  check(`${name} accent link on card`, hex(t.accent), hex(t.card), 4.5);
  for (const bg of t.bgs) check(`${name} text on glass over ${bg}`, hex(t.text), over(hex(t.glass[0]), t.glass[1], hex(bg)), 4.5);
}
for (const [v, [fg, bg]] of Object.entries(verdicts)) check(`verdict ${v} label on chip`, hex(fg), hex(bg), 4.5);
assert.equal(failures, 0, `${failures} token pairs fail`);
console.log("ok: all token pairs meet WCAG AA");
