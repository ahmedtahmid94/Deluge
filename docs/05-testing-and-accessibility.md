# 05 — Testing and accessibility

## Test pyramid

| Layer | Tool | What | Runs |
|---|---|---|---|
| Unit | **Vitest** | `scoring.ts`, path allow-list, model mapping, agent-file parser, Open-Meteo request builders | Every commit, under 5 s |
| Function | Vitest calling function handlers with `Request` objects | Forecast, auth, agent start/status/run, approve, with mocked `fetch`, Anthropic and GitHub clients and an in-memory Blobs fake | Every commit |
| Contract | Vitest with recorded JSON fixtures, plus a nightly live check | The Open-Meteo response shape still matches our types | Fixtures every commit; live check nightly or manual |
| End-to-end | **Playwright** (`@playwright/test`) with `page.route()` mocks | Real browser flows on phone viewports | Every commit against `vite preview` or `netlify dev`; smoke test against the Deploy Preview |
| Accessibility | **@axe-core/playwright** + manual checks | WCAG 2.2 AA | With e2e; manual before each release |
| Security | Unit tests + a build-output scan | Secret leakage, auth on every console route, path traversal | Every commit |

Pass `--trace off` to Playwright in CI unless debugging; turn traces on for a failing test only.

## Unit tests (highest value)

### Scoring

- **Fixture days** in `tests/fixtures/openmeteo/`, saved from real responses for a few beaches and edited into edge cases:
  - *perfect morning, storm at 3 pm* → day "Great", window 9 am–1 pm, reason mentions storms (the worked example in `01`)
  - *all-day thunderstorms* → "No-go"
  - *feels-like 105 °F* → capped at "Poor" (NWS Danger)
  - *gusts 32 mph, clear* → Poor or Fair, reason "Windy"
  - *waves 6 ft* → No-go for swimming
  - *marine data `null`* → weather-only score, `marine: null`, weights redistributed
  - *sunrise/sunset edges, DST change days* (America/New_York), and *fewer than 4 beach hours*
- **Property tests** (optional, `fast-check`): the score is always between 0 and 100; worsening any one input never raises the score; a gate always caps the verdict.
- **Boundaries:** test exactly 12 / 13 mph wind, 90 / 103 °F feels-like, and UV 2 / 3 / 5 / 6 / 7 / 8 / 10 / 11 against the category tables.

### Path allow-list (security-critical)

A table of cases that **must be rejected**:

```
../netlify.toml            src/app/../../netlify/functions/x.ts   /etc/passwd
netlify/functions/agents.mts   netlify.toml   package.json   .github/workflows/ci.yml
src\\app\\x.ts             src/app/%2e%2e/x                         "src/app/x.ts "
src/app/x.ts\u0000.png     .env   .env.production   keys/server.pem
src/console/server/auth.ts  src/shared/models.ts   scripts/build-agents.ts
```

Also test that a symlink, submodule or executable mode is rejected, along with more than 20 files, a file over 200 KB, and non-UTF-8 content. Cases that **must be accepted**: `src/app/dayCard.ts`, `docs/notes.md`, `tests/scoring.test.ts`, `.claude/agents/qa.md`.

### Agent-file parser

- A valid file gives name, description, model ID and personality (from `## Personality`, or the first paragraph).
- A missing `name` or `description`, an unknown `model`, a bad name format, or a duplicate name fails the build with a clear error naming the file.
- `inherit` and a missing `model` map to the default model.

## Function tests

- **forecast:** an unknown beach gives 400. Upstream URLs contain exactly the expected variables, units, timezone and `cell_selection=sea`. Cache headers are set. A failed marine call still returns 200 with `marine: null`. The function never forwards caller-supplied coordinates.
- **auth:** a correct password sets a `__Host-` cookie with `HttpOnly; Secure; SameSite=Strict`. A wrong password gives 401 with a generic message. The lockout starts after N failures. Logout deletes the session.
- **Every console route without a session gives 401.** Generate this test from the list of console function files, so a new route is covered automatically.
- **CSRF:** approve without the CSRF header, or with a foreign `Origin`, gives 403.
- **Agent job lifecycle**, with a fake Anthropic client that streams scripted events:
  - queued → running → done; events appear in order through `?after=seq`
  - a second invocation of the background function for the same job is a no-op (Netlify's retry behaviour)
  - a stale `running` job is marked `interrupted`, without a second model call
  - the time budget is reached → `paused`
  - `stop_reason: "refusal"` → job `refused` with a user-facing message
  - `max_tokens` → job `error` with a "response too long" message
  - an invalid tool input gives a `tool_result` with `is_error: true`, and the loop continues
  - the internal-secret check: calling `agent-run` directly without the secret gives 401
- **Approve**, with a fake GitHub client:
  - the happy path makes exactly the calls get ref → get commit → create tree → create commit → update ref with `force: false`
  - a double approve gives one commit and one 409
  - a moved head where the touched files are unchanged still commits; where they changed, the proposal is `stale`
  - an allow-list violation that appears at approval time is rejected
  - a GitHub 409 or 422 is shown as a clear error and the proposal returns to `pending`
- **Rate limiting:** the app-level daily budget refuses jobs past the limit. Netlify's own `rateLimit` runs at the edge, so check it in a Deploy Preview rather than in unit tests.

## End-to-end (Playwright)

Use Playwright device presets ("iPhone 15", "Pixel 7"), which set viewport, user agent and touch. Mock `/api/forecast` with fixtures through `page.route()` for deterministic results.

Beach Day flows:

1. First visit → pick a beach → today's verdict and the 7 day cards render. The choice survives a reload.
2. Open a day → the hourly detail shows the best-window highlight and the reasons.
3. Offline: load once, then `context.setOffline(true)` and reload. The cached forecast shows with an "Updated … ago" label.
4. Service worker update: deploy build A, then serve build B. The "New version available" toast appears; tapping it reloads into B, and the old cache is deleted.
5. Install UI: on Chromium, dispatch a synthetic `beforeinstallprompt` and check that the Install button appears. With an iPhone user agent and no standalone mode, the Add to Home Screen hint appears and can be dismissed.

Agent Console flows (fake backend through route mocks):

1. A wrong password shows the error; the right one shows the agent grid. The cards show name, model and personality from `agents.json`.
2. Send a message → the job status goes through queued and running (streaming text) to done.
3. A proposal appears → the diff renders → Approve → the confirmation dialog → "Committed abc123 — deploying…".
4. Reject leaves no commit call.

**Manual on real devices before each release:** install on an iPhone (Safari Share → Add to Home Screen) and an Android phone (Chrome install prompt). Check the icon, splash screen, standalone mode, safe areas, offline launch, and the update after a redeploy.

## Security checks in CI

- **Bundle scan:** after `npm run build`, fail if `dist/` contains `sk-ant-`, `github_pat_`, `ghp_`, `ANTHROPIC_API_KEY`, `GITHUB_TOKEN`, `SESSION_SECRET`, `CONSOLE_PASSWORD_HASH` or `INTERNAL_JOB_SECRET`.
- **Header check** (Deploy Preview smoke test): CSP present; `/console/*` sends `no-store` and `noindex`; `/sw.js` sends `no-cache`.
- `npm audit --omit=dev` (or an equivalent) on every pull request. Agents cannot change dependencies, so new dependencies only come from human changes.
- Netlify's secrets scanning stays on, so a secret value committed to the repo fails the build.

## Accessibility (target: WCAG 2.2 Level AA)

### Design requirements

- **Verdicts are never colour-only.** Each verdict has a text label ("Great"), an icon and a number. The palette passes **4.5:1** contrast for text and **3:1** for UI parts and icons, in light **and** dark mode (`prefers-color-scheme`).
- **Target size (WCAG 2.2 SC 2.5.8, AA):** every tap target is at least **24×24 CSS px**, or spaced so that a 24 px circle around it doesn't overlap another target. We use **44×44 px** for primary controls on phones.
- **Focus not obscured (SC 2.4.11, AA):** the sticky header and the install or update toasts must not cover the focused element. Use `scroll-padding-top` and `scroll-padding-bottom` equal to their heights. A visible `:focus-visible` outline at least 2 px with 3:1 contrast.
- **Structure:** one `<h1>` per view; landmarks (`header`, `main`, `nav`, `footer`); a "Skip to forecast" link; `lang="en"` on `<html>`.
- **Beach picker:** a native `<select>`, or an ARIA combobox that follows the APG pattern, with a visible label. Search results are announced ("3 beaches found").
- **Day strip:** a list of buttons, each with an accessible name such as "Saturday, Good, score 72, best 9 am to 1 pm". No horizontal-scroll-only access: arrow keys and visible scroll buttons work too.
- **Hourly chart:** if there is a chart, include an equivalent table (toggle "Show as table"). Charts are `role="img"` with a summary `aria-label`.
- **Units and numbers:** write "°F", "mph" and "ft" in text; expand them for screen readers where needed ("miles per hour").
- **Motion:** respect `prefers-reduced-motion` (no animated waves or parallax). Nothing flashes more than 3 times a second.
- **Zoom and text size:** layout works at 200 % zoom and at 320 px width without horizontal scrolling (reflow). Use relative units, so iOS Dynamic Type and Android font scaling work in standalone mode.
- **Offline and errors:** status messages ("You're offline", "Forecast updated") go in an `aria-live="polite"` region.

### Agent Console specifics

- **Streaming chat:** don't announce every token. Use a polite live region that announces "Agent is responding…" at the start and the final message at the end; the thread itself is `role="log"`.
- **Diff viewer:** added and removed lines carry text markers (`+`/`−`, plus visually hidden "added"/"removed"), not just green/red. It is keyboard-navigable from file to file and has a "Show unified / split" toggle.
- **Approve dialog:** a native `<dialog>` or an APG modal pattern. Focus moves into it, is trapped, returns to the trigger on close, and Esc cancels. The destructive action is labelled plainly ("Commit 2 files to main").
- **Login:** a labelled password field with `autocomplete="current-password"`; errors linked through `aria-describedby`; no time limits beyond the session TTL. WCAG 2.2 SC 3.3.8 (Accessible Authentication): allow paste and password managers.

### Automated checks (axe-core with Playwright)

```ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("today view has no serious WCAG 2.2 AA violations", async ({ page }) => {
  await page.goto("/?beach=south-beach");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const blocking = results.violations.filter(v => ["serious", "critical"].includes(v.impact ?? ""));
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
});
```

- **Always pass the `wcag22aa` tag.** Without it, axe doesn't run the WCAG 2.2 rules such as `target-size`.
- Scan every view and **every state**: loading, error, offline, an open day, the open approve dialog, and the diff view.
- axe can't fully check Focus Not Obscured. Add a Playwright test that tabs through the page and checks with `document.elementFromPoint` that the focused element is not fully covered, especially with the toasts open.

### Manual checks (before each release)

- **VoiceOver on iPhone** (Safari and installed mode) and **TalkBack on Android** (Chrome): pick a beach, read today's verdict, open a day, and run the whole console flow including Approve.
- Keyboard only on desktop: every action reachable, a sensible focus order, no traps.
- 200 % zoom, and the largest system text size on both phones.
- Colour-blindness simulation (Chrome DevTools rendering emulation) on the verdict colours.

## Definition of done (for agent proposals)

A proposal is ready to approve when:

1. Unit and function tests pass (CI on the commit, or locally by the reviewing human).
2. Changed UI is covered by an e2e or axe test, or the proposal says why not.
3. No changes outside the allow-list (enforced anyway).
4. The diff has been read in full.

## Sources

- W3C WCAG 2.2 (SC 2.5.8 Target Size Minimum, 2.4.11 Focus Not Obscured, 3.3.8 Accessible Authentication): https://www.w3.org/TR/WCAG22/
- Deque axe-core Playwright integration (`@axe-core/playwright`) and tags: https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright
- Practical guide to WCAG 2.2 checks with axe-core and Playwright, including what axe misses: https://www.sitepoint.com/how-to-test-wcag-2-2-in-ci-what-axe-core-misses/
- W3C WAI-ARIA Authoring Practices (combobox, dialog patterns): https://www.w3.org/WAI/ARIA/apg/
- Playwright docs (device emulation, `page.route`, offline): https://playwright.dev/docs/intro
- MDN PWA guides (service worker lifecycle for the update tests): see `02-pwa-installability.md`
