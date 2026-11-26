# Install prompt (`beforeinstallprompt`)

Source: MDN, *Window: beforeinstallprompt event*: https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event (retrieved 2026-11-26)

- Status: **"Limited availability. This feature is not Baseline because it does not work in some of the most widely-used browsers."** It is Chromium-only; there is none on iOS (MDN *Making PWAs installable*).
- It "fires when the browser has detected that a website can be installed as a Progressive Web App."
- Pattern from MDN:
  1. Keep the in-app install UI **hidden by default**, "because not all browsers will support installation".
  2. In the listener, call `event.preventDefault()`, which "prevents the browser displaying its own install UI on some platforms". Store the event and reveal the button.
  3. On click, call `await installPrompt.prompt()`. The result has an `outcome` (`"accepted"` or `"dismissed"`). Then clear the stored event and hide the button. A prompt can be used only once.

```js
let installPrompt = null;
const installButton = document.querySelector("#install");
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  installButton.removeAttribute("hidden");
});
installButton.addEventListener("click", async () => {
  if (!installPrompt) return;
  const result = await installPrompt.prompt();
  console.log(`Install prompt was: ${result.outcome}`);
  installPrompt = null;
  installButton.setAttribute("hidden", "");
});
```

- **iOS:** there is no event, so show our own "Share → Add to Home Screen" hint when the app is not running standalone: `matchMedia("(display-mode: standalone)").matches` is false and `navigator.standalone` is not `true`.
- Listen for `appinstalled` to hide the install UI after installation.

Verified in `../examples/03-install-ui/`.
