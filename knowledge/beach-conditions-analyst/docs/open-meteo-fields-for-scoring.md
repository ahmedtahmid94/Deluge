# Open-Meteo fields used by the scorer

Source: https://open-meteo.com/en/docs and https://open-meteo.com/en/docs/marine-weather-api. Field details are in `../../open-meteo-integrator/docs/`.

| Component | Field(s) | Unit as received | Notes |
|---|---|---|---|
| Rain | `precipitation_probability`, `precipitation` | %, inch | `precipitation` is the sum over the preceding hour |
| Sky / storms | `weather_code`, `cloud_cover` | WMO code, % | 95, 96 and 99 are thunderstorms |
| Wind | `wind_speed_10m`, `wind_gusts_10m` | "mp/h" | Measured 10 m above ground |
| Feels-like | `apparent_temperature` | °F | Not identical to the NWS heat index |
| UV (advice) | `uv_index`, daily `uv_index_max` | — | |
| Sea | `wave_height` | ft (imperial) | Significant wave height |
| Water temperature | `sea_surface_temperature` | **°C even with imperial units**; convert | Verified live 2026-11-25 |
| Beach hours | daily `sunrise`, `sunset` | local ISO | Request `timeformat=unixtime` for DST weeks |

**Timezone caveat (quoted):** "Daylight saving time (DST) changes within the requested range are ignored." Beach hours near the March and November changes must use DST-aware conversion.
