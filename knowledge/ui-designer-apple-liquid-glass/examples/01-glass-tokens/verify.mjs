// Verifies the glass header falls back to a solid surface under Reduce Transparency and Increase Contrast,
// in light and dark mode. Uses Chromium's CDP media emulation for prefers-reduced-transparency.
// Run: node verify.mjs
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import http from "node:http";
import assert from "node:assert/strict";
const { chromium } = createRequire(import.meta.url)("playwright");

const files = { "/": "demo.html", "/tokens.css": "tokens.css" };
const server = http.createServer((req, res) => {
  const f = files[req.url]; res.writeHead(f ? 200 : 404, { "content-type": f?.endsWith(".css") ? "text/css" : "text/html" });
  res.end(f ? readFileSync(new URL("./" + f, import.meta.url)) : "");
}).listen(4177);
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const cdp = await page.context().newCDPSession(page);
  const look = () => page.$eval("#header", (el) => { const s = getComputedStyle(el); return { bg: s.backgroundColor, filter: s.backdropFilter }; });
  for (const scheme of ["light", "dark"]) {
    const emulate = (features) => cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: scheme }, ...features] });
    await emulate([]); await page.goto("http://localhost:4177/");
    const normal = await look();
    assert.match(normal.filter, /blur\(20px\)/); assert.match(normal.bg, /rgba\(/);       // translucent glass
    await emulate([{ name: "prefers-reduced-transparency", value: "reduce" }]);
    const reduced = await look();
    assert.equal(reduced.filter, "none"); assert.doesNotMatch(reduced.bg, /rgba\(/);     // solid
    await emulate([{ name: "prefers-contrast", value: "more" }]);
    const contrast = await look();
    assert.equal(contrast.filter, "none");
    console.log(`${scheme}: glass ${normal.bg} -> reduced ${reduced.bg} -> contrast ${contrast.bg}`);
  }
  console.log("ok: glass falls back to solid surfaces in light and dark");
} finally { await browser.close(); server.close(); }
