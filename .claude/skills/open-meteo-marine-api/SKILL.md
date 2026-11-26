---
name: open-meteo-marine-api
description: "How Beach Day calls the Open-Meteo Marine API for waves and sea temperature, and its coastal-accuracy limits. Use when building or changing marine requests."
user-invocable: false
metadata:
  roster-title: "Open-Meteo Marine API"
  owner: open-meteo-integrator
  shared-with: [beach-conditions-analyst]
---
# Open-Meteo Marine API

Endpoint: `https://marine-api.open-meteo.com/v1/marine`.

Request:
- `hourly=wave_height,wave_period,wave_direction,wind_wave_height,swell_wave_height,swell_wave_period,sea_surface_temperature`
- Optional daily: `wave_height_max,wave_period_max,wave_direction_dominant`
- `cell_selection=sea`, so a beach point resolves to an ocean grid cell. Use `marineLat`/`marineLon` from `beaches.json` when set.
- `length_unit=imperial` (feet), `timezone=America/New_York`, `forecast_days=7`.
- The docs disagree on the maximum `forecast_days` (default 5, table 0–8, intro 16). Expect partial or `null` data on later days.

Limits, quoted from the docs:
- "Accuracy is limited in coastal areas … This data is not suitable for coastal navigation."
- Tides and currents are computed at about 8 km resolution.

So:
- Marine data feeds comfort scoring only.
- If the call fails or returns nulls, return `marine: null`. The UI says "Sea data unavailable" and the scorer re-weights.
- **Never derive rip-current risk from marine data (decision D1).**
