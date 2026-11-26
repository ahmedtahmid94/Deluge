import http from "node:http"; import { readFileSync } from "node:fs";
http.createServer((req, res) => { res.writeHead(200, { "content-type": "text/html" }); res.end(readFileSync(new URL("./site/index.html", import.meta.url))); }).listen(4175);
