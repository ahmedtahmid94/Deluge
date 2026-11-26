// Tiny static + fake API server for the test. BUILD env var stamps sw.js.
import http from "node:http";
import { readFileSync } from "node:fs";
const types = { ".html": "text/html", ".js": "text/javascript", ".webmanifest": "application/manifest+json" };
export function start(port, build) {
  let n = 0;
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    if (url.pathname === "/api/forecast") {
      res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
      return res.end(JSON.stringify({ verdict: "Great", generatedAt: `t${++n}` }));
    }
    if (url.pathname.startsWith("/api/agent")) {
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ secret: "private" }));
    }
    const p = url.pathname === "/" ? "/index.html" : url.pathname;
    try {
      let body = readFileSync(new URL("./site" + p, import.meta.url));
      if (p === "/sw.js") body = Buffer.from(String(body).replace("__BUILD__", build()));
      if (p === "/manifest.webmanifest") body = Buffer.from('{"name":"Beach Day","start_url":"/","display":"standalone","icons":[]}');
      res.writeHead(200, { "content-type": types[p.slice(p.lastIndexOf("."))] ?? "text/plain", "cache-control": "no-cache" });
      res.end(body);
    } catch { if (p === "/manifest.webmanifest") { res.writeHead(200); return res.end("{}"); } res.writeHead(404); res.end(); }
  });
  return new Promise((r) => server.listen(port, () => r(server)));
}
