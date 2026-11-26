---
name: open-meteo-forecast-api
description: "How Beach Day calls the Open-Meteo Forecast API: endpoint, variables, units, timezone and WMO codes. Use when building or changing weather requests."
user-invocable: false
metadata:
  roster-title: "Open-Meteo Forecast API"
  owner: open-meteo-integrator
  shared-with: [beach-conditions-analyst]
---
# Open-Meteo Forecast API

Endpoint: `https://api.open-meteo.com/v1/forecast`. Free for non-commercial use; no API key.

Request, always from the `forecast` function, never the browser:
- `latitude`, `longitude` from `beaches.json` only. Several coordinates can be comma-separated for an all-beaches overview.
- `hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_gusts_10m,wind_direction_10m,uv_index,uv_index_clear_sky,is_day,sunshine_duration`
- `daily=weather_code,temperature_2m_max,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,uv_index_max,sunrise,sunset,daylight_duration,sunshine_duration`
- `timezone=America/New_York`, `temperature_unit=fahrenheit`, `wind_speed_unit=mph`, `precipitation_unit=inch`, `forecast_days=7` (maximum 16).
- `models`: leave on automatic "best match" unless beach-conditions-analyst asks otherwise.

WMO `weather_code` values:

| Code | Meaning |
|---|---|
| 0, 1 | Clear, mainly clear |
| 2 | Partly cloudy |
| 3 | Overcast |
| 45, 48 | Fog |
| 51–57 | Drizzle |
| 61–67 | Rain |
| 71–77 | Snow (handle without crashing) |
| 80–82 | Showers |
| 85, 86 | Snow showers |
| 95 | Thunderstorm |
| 96, 99 | Thunderstorm with hail |

Handling:
- Treat any missing or `null` value as unknown.
- Validate array lengths match `hourly.time`.
- Keep the exact variable list in `src/shared/openmeteo.ts` and in contract-test fixtures.
