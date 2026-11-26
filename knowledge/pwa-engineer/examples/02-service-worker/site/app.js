// Registers the worker, loads the forecast, and shows an update toast when a new worker is waiting.
async function loadForecast() {
  const el = document.getElementById("forecast");
  try {
    const res = await fetch("/api/forecast?beach=south-beach");
    const body = await res.json();
    el.textContent = `${body.verdict} (updated ${body.generatedAt})`;
  } catch { el.textContent = "You're offline — no saved forecast for this beach yet"; }
}
function showUpdate(worker) {
  const toast = document.getElementById("update");
  toast.hidden = false;
  document.getElementById("reload").onclick = () => worker.postMessage({ type: "SKIP_WAITING" });
}
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js", { scope: "/" }).then((reg) => {
    if (reg.waiting) showUpdate(reg.waiting);
    reg.addEventListener("updatefound", () => {
      const w = reg.installing;
      w.addEventListener("statechange", () => {
        if (w.state === "installed" && navigator.serviceWorker.controller) showUpdate(w);
      });
    });
  });
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (!reloaded) { reloaded = true; location.reload(); } });
}
loadForecast();
