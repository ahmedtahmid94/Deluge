# Open-Meteo Marine API: reference notes

Sources:
- https://open-meteo.com/en/docs/marine-weather-api (retrieved 2026-11-26)
- Live response in `../examples/fixtures/marine-south-beach-2026-11-25.json`

## Endpoint

`GET https://marine-api.open-meteo.com/v1/marine`

## Parameters (quoted)

| Parameter | Default | Docs say |
|---|---|---|
| `latitude`, `longitude` | required | Comma-separated for several locations; "the JSON output changes to a list of structures". |
| `hourly`, `daily`, `current` | — | "If daily weather variables are specified, parameter timezone is required." |
| `timezone`, `timeformat` | `GMT`, `iso8601` | Same as the forecast API, including "DST changes within the requested range are ignored". |
| `length_unit` | `metric` | "Options metric and imperial" |
| `cell_selection` | **`sea`** on this API | "`sea` prefers grid-cells on sea. `nearest` selects the nearest possible grid-cell." We still send `sea` explicitly. |
| `forecast_days` | — | The page is inconsistent (default 5; table range 0–8; models run 10–16 days). Request 7 and expect `null` at the end. |

## Variables (quoted units)

| Variable | Unit (metric) | Notes |
|---|---|---|
| `wave_height`, `wind_wave_height`, `swell_wave_height` | Meter | "Wave height of significant mean, wind and swell waves." Directions are "the direction the waves come from". |
| `wave_direction`, … | ° | "Mean direction of mean, wind and swell waves" |
| `wave_period`, `swell_wave_period` | Seconds | "Period between mean, wind and swell waves." |
| `sea_surface_temperature` | **Celsius** | "The sea surface temperature close to the water surface" |
| `ocean_current_velocity` | km/h | "Velocity of ocean current considering Eulerian, Waves and Tides." |
| `sea_level_height_msl` | metre | Includes tides. The datum is global mean sea level. "Accuracy is limited in coastal areas … not suitable for coastal navigation." |

### Verified unit behaviour (live, 2026-11-25)

With `length_unit=imperial`, `hourly_units` was:
- `wave_height: "ft"`, `swell_wave_height: "ft"`, `wave_period: "s"`
- **`sea_surface_temperature: "°C"`**

**The sea temperature stays in Celsius.** Convert in code with `°F = °C × 9/5 + 32` (25.4 °C → 77.7 °F), and assert on the unit string so a future change is caught.

## Data sources (from the docs table)

| Model | Resolution | Temporal step | Forecast length | Updated |
|---|---|---|---|---|
| MeteoFrance MFWAM | ~8 km | 3-hourly | 10 days | every 12 h |
| MeteoFrance SMOC (currents, tides) | ~8 km | hourly | 10 days | every 24 h |
| MeteoFrance SST | ~8 km | 6-hourly | 10 days | every 24 h |
| ECMWF WAM | 9 km | hourly | 15 days | every 6 h |
| NCEP GFS Wave | 16–25 km | hourly | 16 days | every 6 h |

## Accuracy warning (quoted)

> "Accuracy at coastal areas is limited. This is not suitable for coastal navigation and does not replace your nautical almanac. Use with caution!"

For Beach Day this means:
- marine data is a comfort input only;
- `marine: null` on failure;
- **never a rip-current signal (decision D1)**.
