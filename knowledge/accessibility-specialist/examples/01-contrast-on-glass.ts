// Example 1: WCAG contrast for text on a translucent (glass) surface, measured against the WORST-CASE
// background the surface can sit over. Blur averages colours; a flat extreme is the worst case.
// Run: node --experimental-strip-types 01-contrast-on-glass.ts
import assert from "node:assert/strict";

type RGB = [number, number, number];
const hex = (h: string): RGB => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)) as RGB;
// WCAG 2.2 relative luminance (sRGB). WCAG 2.2 uses the 0.04045 threshold; 0.03928 in older text gives the same results for 8-bit colours.
const lin = (c: number) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const luminance = ([r, g, b]: RGB) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
export const contrast = (a: RGB, b: RGB) => { const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (l1 + 0.05) / (l2 + 0.05); };
// Source-over compositing of a fill with opacity `alpha` onto a background.
export const over = (fill: RGB, alpha: number, bg: RGB): RGB => fill.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha))) as RGB;

export function worstCase(text: RGB, fill: RGB, alpha: number, backgrounds: RGB[]) {
  return Math.min(...backgrounds.map(bg => contrast(text, over(fill, alpha, bg))));
}

// Sanity checks against known values.
assert.equal(contrast(hex("#000000"), hex("#ffffff")).toFixed(0), "21");
assert.equal(contrast(hex("#777777"), hex("#ffffff")).toFixed(2), "4.48");   // the classic "just fails 4.5" grey

// Beach Day header glass: white fill over the sky-to-sea gradient, dark text.
const text = hex("#0b1f33");
const glassFill = hex("#ffffff");
const backgrounds = [hex("#fdf6e3") /* sand */, hex("#7fc8f8") /* sky */, hex("#0077b6") /* sea */, hex("#023e8a") /* deep sea */];
for (const alpha of [0.35, 0.55, 0.72]) {
  console.log(`glass alpha ${alpha}: worst-case contrast ${worstCase(text, glassFill, alpha, backgrounds).toFixed(2)}:1`);
}
// 35% white over deep sea fails for body text; find the minimum opacity that passes 4.5:1.
let a = 0; while (worstCase(text, glassFill, a, backgrounds) < 4.5) a = Math.round((a + 0.01) * 100) / 100;
console.log(`minimum glass opacity for body text: ${a}`);
assert.ok(worstCase(text, glassFill, 0.35, backgrounds) < 4.5, "thin glass over deep sea fails");
assert.ok(worstCase(text, glassFill, a, backgrounds) >= 4.5);
console.log("ok: contrast on glass checked against worst-case backgrounds");
