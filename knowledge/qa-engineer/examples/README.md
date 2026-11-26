# QA engineer examples

| File | What it shows | How to check |
|---|---|---|
| `01-vitest-uv-and-scoring.test.ts` | `test.each` boundary tables (EPA UV, Beaufort wind), monotonicity, `vi.stubGlobal('fetch')`, fake timers | `npx vitest run 01-vitest-uv-and-scoring.test.ts` |
| `02-playwright-forecast.spec.ts` + `playwright.config.ts` + `site/` + `serve.mjs` | Playwright on iPhone 15 and Pixel 7 projects with a mocked `/api/forecast`, role locators, web-first assertions, Florida time zone, an error state, `serviceWorkers: "block"` | `npx playwright test --config playwright.config.ts --trace off` |

Verified 2026-11-26 (Vitest 4.1, @playwright/test 1.63): 17 Vitest tests passed; 4 Playwright tests passed (2 specs × 2 devices). WebKit isn't installed in this environment, so the iPhone project uses Chromium with iPhone emulation. Run real WebKit in CI if it is available.
