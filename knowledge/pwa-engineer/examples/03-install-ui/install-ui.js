// Install UI for Beach Day: Android/desktop Chromium uses beforeinstallprompt (MDN pattern);
// iOS has no prompt, so show a dismissible "Share -> Add to Home Screen" hint when not standalone.
export function isStandalone(win = window) {
  return win.matchMedia("(display-mode: standalone)").matches || win.navigator.standalone === true;
}
export function isIOS(nav = navigator) {
  return /iPad|iPhone|iPod/.test(nav.userAgent) || (nav.platform === "MacIntel" && nav.maxTouchPoints > 1);
}
export function setupInstallUI(doc = document, win = window) {
  const button = doc.getElementById("install");      // hidden by default
  const hint = doc.getElementById("ios-hint");        // hidden by default
  let deferred = null;
  if (isStandalone(win)) return;                      // already installed
  win.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();                               // stop the mini-infobar; show our button instead
    deferred = e;
    button.hidden = false;
  });
  button.addEventListener("click", async () => {
    if (!deferred) return;
    const { outcome } = await deferred.prompt();      // one-shot
    doc.body.dataset.installOutcome = outcome;
    deferred = null;
    button.hidden = true;
  });
  win.addEventListener("appinstalled", () => { button.hidden = true; });
  let dismissed = false;
  try { dismissed = win.localStorage.getItem("bd-ios-hint-dismissed") === "1"; } catch {}
  if (isIOS(win.navigator) && !dismissed) {
    hint.hidden = false;
    hint.querySelector("button").addEventListener("click", () => {
      hint.hidden = true;
      try { win.localStorage.setItem("bd-ios-hint-dismissed", "1"); } catch {}
    });
  }
}
