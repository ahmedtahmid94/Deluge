// Verifies: precache, stale-while-revalidate forecast, offline shell, private routes never cached,
// and the update flow (new build -> waiting worker -> toast -> SKIP_WAITING -> reload -> old cache deleted).
// Run: node test.mjs   (uses the preinstalled Playwright + Chromium)
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright"); // preinstalled Playwright (CommonJS)
import assert from "node:assert/strict";
import { start } from "./serve.mjs";

let build = "aaa111";
const server = await start(4173, () => build);
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
try {
  await page.goto("http://localhost:4173/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();                                   // now controlled by the SW
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.waitForFunction(() => document.getElementById("forecast").textContent.includes("Great"));
  await page.evaluate(() => fetch("/api/agent/jobs/1").then((r) => r.json()));

  const keys = await page.evaluate(() => caches.keys());
  assert.deepEqual(keys.sort(), ["beachday-data-v1", "beachday-shell-aaa111"]);
  const dataUrls = await page.evaluate(async () => (await (await caches.open("beachday-data-v1")).keys()).map((r) => new URL(r.url).pathname));
  assert.deepEqual(dataUrls, ["/api/forecast"]);          // agent API was NOT cached

  // Offline: shell + cached forecast still render.
  await context.setOffline(true);
  await page.reload();
  await page.waitForFunction(() => document.getElementById("forecast").textContent.startsWith("Great"));
  console.log("offline render:", await page.textContent("#forecast"));
  await context.setOffline(false);

  // Update flow.
  build = "bbb222";
  await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()));
  await page.waitForSelector("#update:not([hidden])");
  await Promise.all([page.waitForEvent("load"), page.click("#reload")]);
  await page.waitForFunction(async () => (await caches.keys()).includes("beachday-shell-bbb222"));
  const after = await page.evaluate(() => caches.keys());
  assert.ok(!after.includes("beachday-shell-aaa111"), "old shell cache deleted");
  console.log("caches after update:", after.sort().join(", "));
  console.log("ok: service worker behaviour verified");
} finally { await browser.close(); server.close(); }
