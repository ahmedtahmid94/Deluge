// Example 2: axe-core scan with WCAG 2.2 AA tags (page and open dialog), the APG dialog focus rules,
// and a 2.4.11 "focus not obscured" check with a sticky header and a fixed toast.
// Run (needs @axe-core/playwright): node 02-axe-and-dialog.mjs
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import http from "node:http";
import assert from "node:assert/strict";
import { AxeBuilder } from "@axe-core/playwright";
const { chromium, devices } = createRequire(import.meta.url)("playwright");

const html = readFileSync(new URL("./page.html", import.meta.url));
const server = http.createServer((_, res) => { res.writeHead(200, { "content-type": "text/html" }); res.end(html); }).listen(4176);
const browser = await chromium.launch();
try {
  const page = await (await browser.newContext({ ...devices["iPhone 15"] })).newPage();
  await page.goto("http://localhost:4176/");
  const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
  const blocking = (r) => r.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""));

  let results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  assert.deepEqual(blocking(results), [], JSON.stringify(blocking(results), null, 2));
  console.log(`page: ${results.passes.length} rules passed, ${results.violations.length} violations`);

  // 2.4.11: tab through everything; the focused element must never be fully covered.
  const covered = [];
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    const hidden = await page.evaluate(() => {
      const el = document.activeElement; if (!el || el === document.body) return null;
      const r = el.getBoundingClientRect();
      const [l, t, rt, b] = [Math.max(r.left, 0), Math.max(r.top, 0), Math.min(r.right, innerWidth), Math.min(r.bottom, innerHeight)];
      if (rt <= l || b <= t) return null;
      for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) {
        const hit = document.elementFromPoint(l + (rt - l) * (x + .5) / 5, t + (b - t) * (y + .5) / 5);
        if (hit && el.contains(hit)) return null;
      }
      return el.textContent.trim() || el.tagName;
    });
    if (hidden) covered.push(hidden);
  }
  assert.deepEqual(covered, [], "focused element fully obscured: " + covered.join(", "));

  // APG dialog: focus to least destructive action, Escape closes, focus returns to the invoker.
  await page.getByRole("button", { name: "Approve and commit" }).first().click();
  assert.equal(await page.evaluate(() => document.activeElement.id), "cancel");
  results = await new AxeBuilder({ page }).include("#confirm").withTags(TAGS).analyze();
  assert.deepEqual(blocking(results), []);
  await page.keyboard.press("Escape");
  assert.equal(await page.evaluate(() => document.getElementById("confirm").open), false);
  assert.equal(await page.evaluate(() => document.activeElement.id), "approve");
  console.log("ok: axe (wcag22aa) clean, focus never obscured, dialog focus rules hold");
} finally { await browser.close(); server.close(); }
