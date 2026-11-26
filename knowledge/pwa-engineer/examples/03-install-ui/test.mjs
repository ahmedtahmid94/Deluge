// Verifies the install UI on an emulated Android phone (synthetic beforeinstallprompt) and an emulated iPhone.
// Run: node test.mjs
import { createRequire } from "node:module";
import http from "node:http";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const { chromium, devices } = createRequire(import.meta.url)("playwright");

const server = http.createServer((req, res) => {
  const f = req.url === "/" ? "page.html" : req.url.slice(1);
  res.writeHead(200, { "content-type": f.endsWith(".js") ? "text/javascript" : "text/html" });
  res.end(readFileSync(new URL("./" + f, import.meta.url)));
}).listen(4174);
const browser = await chromium.launch();
try {
  // Android: dispatch a fake BeforeInstallPromptEvent with a prompt() that resolves "accepted".
  const android = await browser.newContext({ ...devices["Pixel 7"] });
  const p = await android.newPage();
  await p.goto("http://localhost:4174/");
  assert.equal(await p.isHidden("#install"), true, "hidden until the event fires");
  await p.evaluate(() => {
    const e = new Event("beforeinstallprompt", { cancelable: true });
    e.prompt = async () => ({ outcome: "accepted" });
    window.dispatchEvent(e);
  });
  await p.click("#install");
  await p.waitForFunction(() => document.body.dataset.installOutcome === "accepted");
  assert.equal(await p.isHidden("#install"), true, "hidden after use");
  assert.equal(await p.isHidden("#ios-hint"), true, "no iOS hint on Android");

  // iPhone: no event; hint shows, dismissal persists across reloads.
  const iphone = await browser.newContext({ ...devices["iPhone 15"] });
  const q = await iphone.newPage();
  await q.goto("http://localhost:4174/");
  assert.equal(await q.isVisible("#ios-hint"), true);
  await q.click("#ios-hint button");
  await q.reload();
  assert.equal(await q.isHidden("#ios-hint"), true, "dismissal remembered");
  console.log("ok: install UI verified on Pixel 7 and iPhone 15 emulation");
} finally { await browser.close(); server.close(); }
