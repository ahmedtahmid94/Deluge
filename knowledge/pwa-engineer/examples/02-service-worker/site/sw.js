// Beach Day service worker (MDN "Using Service Workers" + "Caching" patterns).
const BUILD = "__BUILD__";                 // replaced at build time with the commit SHA
const SHELL = `beachday-shell-${BUILD}`;
const DATA = "beachday-data-v1";
const SHELL_FILES = ["/", "/index.html", "/app.js", "/manifest.webmanifest"];
const PRIVATE = [/^\/console/, /^\/api\/agent/, /^\/api\/auth/, /^\/api\/proposals/];

self.addEventListener("install", (event) => {
  // If precaching fails, installation fails (waitUntil rejects).
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k.startsWith("beachday-shell-") && k !== SHELL).map((k) => caches.delete(k)))));
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting(); // only on the user's tap
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== location.origin) return;   // never cache non-GET
  if (PRIVATE.some((re) => re.test(url.pathname))) return;                         // network only
  if (url.pathname === "/api/forecast") { event.respondWith(staleWhileRevalidate(event)); return; }
  event.respondWith(caches.match(event.request, { ignoreSearch: url.pathname === "/" }).then((hit) => hit ?? fetch(event.request)));
});

async function staleWhileRevalidate(event) {
  const cache = await caches.open(DATA);
  const cached = await cache.match(event.request);
  const network = fetch(event.request).then((res) => {
    if (res.ok && !res.headers.has("set-cookie")) cache.put(event.request, res.clone());
    return res;
  });
  if (cached) { event.waitUntil(network.catch(() => {})); return cached; }
  return network;
}
