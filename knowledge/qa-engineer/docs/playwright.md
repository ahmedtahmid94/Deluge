# Playwright for Beach Day

Sources (retrieved 2026-11-26):
- Best practices: https://playwright.dev/docs/best-practices
- Emulation: https://playwright.dev/docs/emulation
- Mock APIs: https://playwright.dev/docs/mock
- Service workers: https://playwright.dev/docs/service-workers

## Best practices (quoted)

- "**Test user-visible behavior.** Automated tests should verify that the application code works for the end users, and avoid relying on implementation details".
- "**Make tests as isolated as possible.** Each test should … run independently with its own local storage, session storage, data, cookies etc." Each test gets a new browser context.
- "**Avoid testing third-party dependencies.** Only test what you control." Mock Open-Meteo and the GitHub and Claude APIs with the network API.
- "**Use locators.** … we recommend prioritizing user-facing attributes and explicit contracts", for example `page.getByRole('button', { name: 'submit' })`. Avoid CSS-class or XPath selectors.
- "**Use web first assertions**":
  ```js
  await expect(page.getByText('welcome')).toBeVisible();          // 👍 waits and retries
  expect(await page.getByText('welcome').isVisible()).toBe(true); // 👎 no waiting
  ```
- Traces: "We don't recommend setting this to on so that traces are run on every test as it's very performance heavy." In CI, pass `--trace off` and turn it on only to debug a failure.

## Emulation (quoted)

- Device projects:
  ```js
  projects: [{ name: 'Mobile Safari', use: { ...devices['iPhone 13'] } }]
  ```
  Override `viewport` or `isMobile` **after** spreading the device.
- `locale` and `timezoneId`, for example `timezoneId: 'America/New_York'`. Always set this so "today" in tests is a Florida day.
- `permissions: ['geolocation']` with `geolocation: { latitude, longitude }`, and `context.setGeolocation(...)`.
- "The `reducedMotion`, `forcedColors` and `contrast` options emulate the prefers-reduced-motion, forced-colors and prefers-contrast media features". Values are `'reduce'`, `'active'` and `'more'`. Use `page.emulateMedia({...})` per page; `colorScheme: 'dark'` for dark mode.
- **Offline:** `offline: true` or `context.setOffline(true)`. "Offline emulation only affects requests that go through the browser's regular network stack, such as page navigations, fetch(), XMLHttpRequest and WebSockets."

## Mocking (quoted)

```js
await page.route('*/**/api/v1/fruits', async route => {
  const json = [{ name: 'Strawberry', id: 21 }];
  await route.fulfill({ json });
});
```

- To change a real response: `const response = await route.fetch(); … route.fulfill({ response, json })`.
- HAR replay: `page.routeFromHAR('./hars/fruit.har', { url: '*/**/api/v1/fruits', update: false })`.

## Service workers: a mocking pitfall (quoted)

- Requests made by a service worker are reported on the **BrowserContext**, and "`browserContext.route()` sees the request".
- When the worker has a fetch handler, the page-owned events for that resource "are not routeable, as they would not have even had the possibility to hit the external network since the Service Worker has a fetch handler registered."
- **So once Beach Day's worker controls the page, `page.route('/api/forecast')` will not intercept.** Either use `context.route(...)`, or create the context with `serviceWorkers: 'block'` for tests that don't test the worker.
- Wait for activation with a `controllerchange` listener or `navigator.serviceWorker.ready`.
- Known limitation: "Requests for updated Service Worker main script code currently cannot be routed" (microsoft/playwright#14711). Test updates by serving a different `sw.js` from a real local server, as in `pwa-engineer/examples/02-service-worker`.

Verified in `../examples/02-playwright-forecast.spec.ts` (Playwright 1.63, Chromium).
