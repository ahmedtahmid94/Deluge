# Open-Meteo integrator examples

| File | What it shows | How to check |
|---|---|---|
| `fixtures/*.json` | **Real** Forecast and Marine responses for South Beach, captured 2026-11-25 | — |
| `01-build-requests.ts` | Request builders: exact variables, units, `timezone`, `timeformat=unixtime`, `cell_selection=sea` | `node --experimental-strip-types 01-build-requests.ts` |
| `02-parse-and-merge.ts` | Validating real responses (unit strings, array lengths, error bodies) and merging by hour; SST °C→°F | `node --experimental-strip-types 02-parse-and-merge.ts` |
| `03-fetch-with-fallback.ts` | Parallel fetch, timeout, one retry on 5xx, `marine: null`, stale cache on failure | `node --experimental-strip-types 03-fetch-with-fallback.ts` |

Verified 2026-11-26: all three print `ok`.

Findings from the live responses:
1. `sea_surface_temperature` stays **°C** with `length_unit=imperial`.
2. Wind units come back as `"mp/h"`.
3. With `iso8601`, times carry no offset, and DST changes inside the range are ignored.
4. An invalid variable returns HTTP 400 `{"error":true,"reason":"…"}`.
