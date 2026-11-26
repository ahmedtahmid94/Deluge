# Open-Meteo Forecast API: reference notes

Sources:
- https://open-meteo.com/en/docs (retrieved 2026-11-26)
- Live responses captured in `../examples/fixtures/` (2026-11-25)

## Endpoint

`GET https://api.open-meteo.com/v1/forecast`. Free for non-commercial use; no API key.

## Parameters we use (quoted from the docs)

| Parameter | Default | Docs say |
|---|---|---|
| `latitude`, `longitude` | required | WGS84. "Multiple coordinates can be comma separated … To return data for multiple locations the JSON output changes to a list of structures." |
| `hourly`, `daily`, `current` | — | Comma-separated variable lists. "If daily weather variables are specified, parameter timezone is required." |
| `temperature_unit` | `celsius` | "If fahrenheit is set, all temperature values are converted to Fahrenheit." |
| `wind_speed_unit` | `kmh` | "Other wind speed units: ms, mph and kn" |
| `precipitation_unit` | `mm` | "Other precipitation amount units: inch" |
| `timeformat` | `iso8601` | "By default, timestamps use ISO 8601 format with a fixed offset, utc_offset_seconds, resolved at request time … With unixtime, timestamps are seconds since 1970-01-01 00:00 UTC." |
| `timezone` | `GMT` | "The requested timezone's UTC offset at request time is returned as utc_offset_seconds and used for ISO 8601 timestamps and daily boundaries throughout the response. **Daylight saving time (DST) changes within the requested range are ignored.** For DST-aware local times, request timeformat=unixtime and convert using the returned timezone in your application." `auto` resolves the zone from the coordinates. |
| `forecast_days` | 7 | Integer 0–16. "Up to 16 days of forecast are possible." |
| `past_days` | 0 | Integer 0–92 |
| `forecast_hours` | — | Number of hourly steps counted from the current hour |
| `cell_selection` | `land` | "`sea` prefers grid-cells on sea. `nearest` selects the nearest possible grid-cell." |

### Time zone consequence for Beach Day

We send `timezone=America/New_York`. In the week around the DST changes (second Sunday of March, first Sunday of November), ISO times after the change are **off by one hour**, because one offset is used for the whole range.

Options:
- (a) request `timeformat=unixtime` and format the times with `Intl.DateTimeFormat(..., { timeZone: "America/New_York" })`; or
- (b) accept a one-hour error in those weeks.

**Recommendation: (a).** The scorer must use the corrected local hour, because beach hours and the best window depend on it.

## Variables we request

`hourly`:
- `temperature_2m`, `apparent_temperature`
- `precipitation_probability`, `precipitation`
- `weather_code`, `cloud_cover`
- `wind_speed_10m`, `wind_gusts_10m`, `wind_direction_10m`
- `uv_index`, `uv_index_clear_sky`
- `is_day`, `sunshine_duration`

`daily`:
- `weather_code`, `temperature_2m_max`
- `precipitation_probability_max`, `precipitation_sum`
- `wind_speed_10m_max`, `wind_gusts_10m_max`
- `uv_index_max`
- `sunrise`, `sunset`, `daylight_duration`, `sunshine_duration`

Units seen in a live response (`hourly_units`), requested with °F/mph/inch:
- `temperature_2m: "°F"`
- `precipitation: "inch"`
- `precipitation_probability: "%"`
- `wind_speed_10m: "mp/h"`. Note the spelling: compare against `mp/h`, not `mph`.
- `weather_code: "wmo code"`
- `uv_index: ""` (unitless)

## Response shape (live example)

```json
{ "latitude": 25.814812, "longitude": -80.12985, "generationtime_ms": 0.377,
  "utc_offset_seconds": -18000, "timezone": "America/New_York", "timezone_abbreviation": "GMT-5",
  "elevation": 6.0,
  "hourly_units": { "time": "iso8601", "temperature_2m": "°F", ... },
  "hourly": { "time": ["2026-11-25T00:00", ...], "temperature_2m": [75.4, ...], ... },
  "daily_units": { ... }, "daily": { "time": ["2026-11-25", ...], "sunrise": ["2026-11-25T06:45", ...] } }
```

- The returned coordinates are those of the **grid cell**, not the requested point (25.7826 → 25.8148).
- Times have **no offset suffix**. Apply `utc_offset_seconds` yourself.
- Each variable is a parallel array indexed like `hourly.time`. Missing values are `null`.

## Error response (live, HTTP 400)

```json
{"error":true,"reason":"Invalid value: Cannot initialize SurfacePressureAndHeightVariable<...> from invalid String value not_a_variable"}
```

Treat any non-2xx status, or a body with `error: true`, as a failure. Log `reason` server-side; never show it to users.

## WMO weather codes (from the docs table)

| Code | Meaning |
|---|---|
| 0 | Clear sky |
| 1, 2, 3 | Mainly clear, partly cloudy, overcast |
| 45, 48 | Fog, depositing rime fog |
| 51, 53, 55 | Drizzle: light, moderate, dense |
| 56, 57 | Freezing drizzle |
| 61, 63, 65 | Rain: slight, moderate, heavy |
| 66, 67 | Freezing rain |
| 71, 73, 75, 77 | Snow, snow grains |
| 80, 81, 82 | Rain showers: slight, moderate, violent |
| 85, 86 | Snow showers |
| 95 | Thunderstorm |
| 96, 99 | Thunderstorm with slight or heavy hail |
