# Vitest for Beach Day

Source: Vitest *Mocking* guide: https://vitest.dev/guide/mocking (retrieved 2026-11-26). Vitest 4.x verified locally.

- `vi.fn()`, `vi.spyOn(obj, 'method')`, and `vi.mock('./module.js', () => ({ method: vi.fn() }))` to replace a module. Use `importOriginal()` for partial mocks.
- **Dates:** "To mock Date and Temporal's time, you can use `vi.setSystemTime` … Beware that using `vi.useFakeTimers` also changes the Date's time." In Beach Day, pass the clock in as an argument (pure modules) and use fake timers only at the edges.
- **Globals:** `vi.stubGlobal('fetch', fakeFetch)`. "When using `vi.stubGlobal`, it will not automatically reset between different tests, unless you enable `unstubGlobals` config option or call `vi.unstubAllGlobals`." Set `unstubGlobals: true` in `vitest.config.ts`.
- **Env:** `vi.stubEnv('NAME', 'value')`, with `unstubEnvs: true` to restore it between tests.

## Beach Day conventions

- `test.each` tables for boundaries (UV bands, wind and heat thresholds) and for hostile paths in the allow-list.
- Fixtures live in `tests/fixtures/`. The Open-Meteo fixtures are real responses (see `open-meteo-integrator/examples/fixtures`).
- Never call the real network. Stub `fetch` and inject fake Anthropic, GitHub and Blobs clients.

Verified in `../examples/01-vitest-uv-and-scoring.test.ts`.
