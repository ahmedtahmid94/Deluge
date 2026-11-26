# 01 — Use case and beach-day scoring

## The use case

**Beach Day** answers one question for one person: *"Is it a good day to go to the beach, and if not today, which of the next few days?"*

The user:

1. Picks a South Florida beach from a short list (search by name; remember the last pick).
2. Sees **today** as a big verdict ("Great", "Good", "Fair", "Poor", "No-go") with the reason in plain words ("Afternoon storms likely after 2 pm").
3. Sees the **next 6 days** as a strip of day cards with the same verdict and a score.
4. Can open a day to see the **best time window** (for example "9 am – 1 pm") and the hour-by-hour detail: rain chance, wind, UV, feels-like temperature, wave height and water temperature.

Non-goals for v1: surf forecasting for surfers, tides for fishing or navigation, beach water quality, sargassum and red tide (see *Gaps*).

## Data sources (Open-Meteo)

Open-Meteo is free for non-commercial use and needs no API key. Two endpoints are needed.

### Forecast API — `https://api.open-meteo.com/v1/forecast`

| Purpose | Hourly variable | Daily variable |
|---|---|---|
| Air temperature | `temperature_2m` | `temperature_2m_max` |
| Feels-like (heat) | `apparent_temperature` | — |
| Rain chance | `precipitation_probability` | `precipitation_probability_max` |
| Rain amount | `precipitation` | `precipitation_sum` |
| Sky / storms | `weather_code` (WMO code), `cloud_cover` | `weather_code` |
| Wind | `wind_speed_10m`, `wind_gusts_10m`, `wind_direction_10m` | `wind_speed_10m_max`, `wind_gusts_10m_max` |
| UV | `uv_index`, `uv_index_clear_sky` | `uv_index_max` |
| Sun | `is_day`, `sunshine_duration` | `sunrise`, `sunset`, `daylight_duration`, `sunshine_duration` |

Useful parameters:

- `timezone=America/New_York` (or `auto`). Without it, times are in GMT.
- `temperature_unit=fahrenheit`, `wind_speed_unit=mph` (`kmh` default; also `ms`, `kn`), `precipitation_unit=inch`.
- `forecast_days` defaults to 7, maximum 16. `past_days` 0–92.
- `models` defaults to automatic "best match". For Florida the US models (GFS/HRRR) are among the options.
- **Several coordinates can be passed comma-separated** in one request, which is useful for an "all beaches today" overview.

WMO `weather_code` values that matter for scoring:

| Code | Meaning | Treatment |
|---|---|---|
| 0, 1 | Clear, mainly clear | Best |
| 2 | Partly cloudy | Good |
| 3 | Overcast | Small penalty |
| 45, 48 | Fog | Penalty |
| 51–57 | Drizzle | Penalty |
| 61–67 | Rain | Large penalty |
| 80–82 | Rain showers (82 = violent) | Large penalty |
| 95 | Thunderstorm | **Hard stop for that hour** |
| 96, 99 | Thunderstorm with hail | **Hard stop** |

Snow codes (71–77, 85–86) are irrelevant for South Florida, but the code should still handle them as bad weather and not crash.

### Marine API — `https://marine-api.open-meteo.com/v1/marine`

| Purpose | Hourly variable | Daily variable |
|---|---|---|
| Overall sea state | `wave_height`, `wave_period`, `wave_direction` | `wave_height_max`, `wave_period_max`, `wave_direction_dominant` |
| Local chop | `wind_wave_height` | `wind_wave_height_max` |
| Swell | `swell_wave_height`, `swell_wave_period` | `swell_wave_height_max`, `swell_wave_period_max` |
| Water temperature | `sea_surface_temperature` | — |
| Currents | `ocean_current_velocity`, `ocean_current_direction` | — |
| Water level | `sea_level_height_msl` (includes tides) | — |

Parameters:

- `cell_selection` = `land` | `sea` | `nearest`. **Use `sea`** so that a coordinate on the sand resolves to an ocean grid cell rather than a land cell with no data.
- `length_unit=imperial` returns wave heights in feet.
- `forecast_days`: the docs page is inconsistent. It says the default is 5 and its parameter table gives 0–8, while its intro talks of 7 and 16. **Request 7 days and treat missing or `null` values as "no marine data".** Do not assume all 7 days are filled.

Models and resolution: MeteoFrance MFWAM (~8 km), ECMWF WAM (9 km), NCEP GFS Wave (~16–25 km), DWD EWAM (~5 km); SST from MeteoFrance (~8 km).

> **Official caveat (quoted from the Marine API docs):** "Accuracy is limited in coastal areas—while it can be reasonably accurate near unobstructed coasts, it may be completely unreliable further inland. This data is not suitable for coastal navigation." And: "Tides and ocean currents are computed at 0.08° (~8 km) resolution using numerical models. Accuracy at coastal areas is limited. This is not suitable for coastal navigation and does not replace your nautical almanac."

Consequence: marine data is **an input to comfort**, not a safety guarantee. The UI must say so (see *Safety messaging*).

### Terms of use

The free tier allows **600 calls/min, 5,000/hour, 10,000/day and 300,000/month**, non-commercial only. Ads, subscriptions or a commercial product require a paid plan. Data is **CC BY 4.0**, so the app must show attribution, for example "Weather data by Open-Meteo.com" linked to `https://open-meteo.com/`.

Open-Meteo also counts calls with many variables or many locations as more than one call. The terms page did not spell out the rule, so check it before you do bulk polling. Caching at the CDN (see `03-architecture.md`) keeps us far below these limits.

## South Florida beach list (v1 seed)

These are approximate coordinates. **A frontend or data agent must check each one on a map before launch.** For the marine request, a point ~300–500 m offshore is better than one on the sand, although `cell_selection=sea` handles most cases.

| id | Beach | Lat | Lon |
|---|---|---|---|
| `south-beach` | South Beach, Miami Beach | 25.7826 | -80.1300 |
| `haulover` | Haulover Beach | 25.9036 | -80.1203 |
| `crandon` | Crandon Park, Key Biscayne | 25.7066 | -80.1555 |
| `bill-baggs` | Bill Baggs Cape Florida | 25.6676 | -80.1568 |
| `hollywood` | Hollywood Beach | 26.0112 | -80.1157 |
| `fort-lauderdale` | Fort Lauderdale Beach | 26.1224 | -80.1034 |
| `pompano` | Pompano Beach | 26.2379 | -80.0870 |
| `delray` | Delray Beach | 26.4615 | -80.0587 |
| `palm-beach` | Palm Beach (Mid-Town) | 26.7056 | -80.0364 |
| `jupiter` | Jupiter Beach | 26.9342 | -80.0716 |
| `smathers` | Smathers Beach, Key West | 24.5513 | -81.7700 |

Keep the list in one JSON file (`src/data/beaches.json`) with an `id`, `name`, `lat`, `lon`, optional `marineLat`/`marineLon`, an `nwsRipCurrentUrl` (decision D1), and a `facing` compass bearing (east-facing Atlantic beaches vs. the south-facing Key West shore). `facing` lets a later version tell onshore from offshore wind.

## Scoring model

### Principles

1. **Safety gates first, comfort second.** Lightning and dangerous heat override a pleasant average.
2. **Score hours, then summarise the day.** Florida days are often "great morning, storms after 2 pm". A daily average would hide that, so the app finds the best contiguous window.
3. **Explainable.** Every score comes with the one or two factors that cost the most points, so the UI can say *why*.
4. **Pure and testable.** The scorer is a pure function `scoreHour(hourData, beach) → { score, gates, reasons }` with no I/O, shared by the function and the browser and covered by fixture tests.
5. **Sourced thresholds vs. tunable heuristics.** The tables below mark which numbers come from an authority and which are our assumptions for the team to tune.

### Hard gates (per hour)

| Gate | Rule | Source |
|---|---|---|
| Lightning | `weather_code` ∈ {95, 96, 99} → hour is **No-go** | NWS: "When thunder roars, go indoors" and "wait 30 minutes after the last lightning or thunder before going back outside." The hour **after** a thunderstorm hour is also capped at "Poor". |
| Dangerous heat | `apparent_temperature` ≥ 103 °F → cap at "Poor"; ≥ 125 °F → No-go | NWS heat index categories: Caution 80–90 °F, Extreme Caution 90–103 °F, Danger 103–124 °F, Extreme Danger ≥ 125 °F. NWS also notes that the values are for shade and **full sun can add up to 15 °F**. |
| Rough surf (heuristic) | `wave_height` ≥ 6 ft → No-go for swimming; ≥ 4 ft → cap at "Fair" | **Heuristic** for surf comfort only. **Decision D1: this is not a rip-current estimate**, and the UI must never call it one. Rip currents form in calm-looking water too. |
| Strong gusts (heuristic) | `wind_gusts_10m` ≥ 35 mph → cap at "Poor" | **Heuristic**, anchored to Beaufort (see below). |

### Comfort components (per hour, 0–100 each, weighted)

| Component | Weight | Full points | Zero points | Basis |
|---|---|---|---|---|
| Rain | 30 | `precipitation_probability` ≤ 10 % and `precipitation` = 0 | ≥ 70 % or ≥ 0.1 in/h | Heuristic, linear in between |
| Sky | 15 | `weather_code` 0–1, or `cloud_cover` ≤ 30 % | code 3/45/48 or cloud ≥ 90 % | WMO codes (Open-Meteo docs) |
| Wind | 20 | sustained ≤ 12 mph | ≥ 25 mph sustained or ≥ 30 mph gusts | Beaufort scale (NOAA WPC): ≤ 12 mph is a "gentle breeze"; 13–18 mph "moderate breeze" raises dust and loose paper (blowing sand); 19–24 mph "fresh breeze"; 25+ mph "strong breeze" |
| Feels-like | 20 | `apparent_temperature` 78–90 °F | ≤ 65 °F or ≥ 103 °F | Upper bound from NWS heat index (Extreme Caution starts at 90 °F); lower bound is a heuristic for South Florida beachgoers |
| Sea | 10 | `wave_height` ≤ 2 ft | ≥ 5 ft | Heuristic |
| Water temp | 5 | `sea_surface_temperature` 78–86 °F | ≤ 70 °F | Heuristic |

`hourScore = Σ(weight × component) / 100`, then the hard-gate caps are applied.

**UV is advice, not a penalty.** In South Florida the UV index is "Very High" or "Extreme" on most summer days (the EPA lists Miami's average summer UV at 10–11). Penalising it would mark nearly every sunny day as worse than a cloudy one. Instead, show the EPA category and its action next to the verdict:

| UV index | EPA category | Message |
|---|---|---|
| 1–2 | Low | Minimal protection needed |
| 3–5 | Moderate | Sunscreen; shade near midday |
| 6–7 | High | Protection needed; reduce sun 11 am – 4 pm |
| 8–10 | Very High | Extra precautions; avoid sun 11 am – 4 pm |
| 11+ | Extreme | All precautions; **white sand reflects UV** (EPA) |

A user setting ("I burn easily") can turn UV into a penalty later.

### Daily summary

1. Take the beach hours: from 1 h after `sunrise` to 1 h before `sunset`, clipped to 8 am – 7 pm local time.
2. Score every hour.
3. Find the **best window**: the longest contiguous run of hours ≥ 60, and among runs of 3 h or more, the one with the highest mean.
4. **Day score** = mean of the best 4 consecutive hours (or of all beach hours if fewer). **Day verdict** comes from the day score, but if any gate fires during the best window, the verdict is capped by that gate.
5. Bands: **Great** ≥ 80, **Good** 65–79, **Fair** 50–64, **Poor** 30–49, **No-go** < 30 or a No-go gate across the whole day.
6. **Reasons**: the two components that lost the most weighted points across the window, translated to plain text ("Windy: gusts to 28 mph", "Storms likely after 2 pm").

### Forecast confidence

Accuracy drops with lead time. Show days 1–2 as normal, days 3–4 with a "less certain" tag, and days 5–7 as "outlook". Precipitation timing is the least reliable part in a Florida summer. Never show a day-6 window to the hour; show "morning" / "afternoon" instead.

### Worked example (for a unit-test fixture)

At 10 am: rain 10 %, code 1, wind 9 mph (gusts 14), feels-like 86 °F, waves 1.5 ft, SST 82 °F →
Rain 100, Sky 100, Wind 100, Feels 100, Sea 100, Water 100 → **score 100, Great**.

At 3 pm the same day: rain 60 %, code 95 → **No-go** (lightning gate). The day verdict is still "Great" because the best window (9 am – 1 pm) is clear. The reason line reads "Storms likely from 3 pm, so go in the morning."

## Safety messaging (required in the UI)

- A short footer on every forecast: *"Beach Day is a comfort guide, not a safety service. Marine forecasts are less accurate near the coast. Always swim near a lifeguard and follow the flags."*
- **Rip currents: link out, never estimate (decision D1).** Open-Meteo has no rip-current data, and the app does not derive any. Every beach view shows a link such as "Rip current risk: check the National Weather Service forecast" that opens the NWS surf zone / rip current forecast for that beach. Each beach in `beaches.json` has an `nwsRipCurrentUrl`, checked by a human before launch; the fallback is the NWS index of offices that issue surf zone forecasts, https://www.weather.gov/safety/ripcurrent-forecasts. The NWS issues rip-current risk at three levels:
  - **Low:** rip currents are still possible, especially near groins, jetties, reefs and piers.
  - **Moderate:** life-threatening rip currents are possible.
  - **High:** life-threatening rip currents are likely; dangerous for all swimmers.

  For South Florida these come from NWS Miami (and NWS Key West for the Keys). The app shows the levels' meaning only as help text next to the link. It never shows a level of its own.
- Lightning message on storm hours: "When thunder roars, go indoors. Wait 30 minutes after the last thunder." (NWS)

## Gaps and future data sources

| Gap | Why it matters | Possible source (to check before use) |
|---|---|---|
| Rip current risk | Leading weather-related danger at Florida beaches | **Decided (D1): link out to NWS; no proxy and no import of NWS data in v1.** |
| Water quality | Bacteria advisories close swimming | Florida Department of Health "Healthy Beaches" program. Its advisories are triggered at enterococci ≥ 71 CFU per 100 mL (as reported second-hand; confirm on the FDOH site) |
| Sargassum seaweed | Smell (hydrogen sulfide) and skin irritation from organisms living in it | FDOH county pages; satellite outlooks |
| Red tide | Respiratory irritation | Florida FWC red tide status |
| Tropical systems | Closures and dangerous surf | NOAA National Hurricane Center outlooks |
| Jellyfish / man-o'-war | Purple-flag days | Lifeguard reports only |

All of these are v2 or later. v1 must say plainly that they are not checked.

## Sources

- Open-Meteo Forecast API docs: https://open-meteo.com/en/docs
- Open-Meteo Marine Weather API docs: https://open-meteo.com/en/docs/marine-weather-api
- Open-Meteo terms (limits, CC BY 4.0, non-commercial): https://open-meteo.com/en/terms
- NWS lightning safety ("wait 30 minutes"): https://www.weather.gov/safety/lightning-safety-overview
- NWS heat index categories and the "+15 °F in full sun" note: https://www.weather.gov/ama/heatindex
- NWS rip current outlook levels: https://www.weather.gov/safety/ripcurrent-forecasts
- EPA UV Index scale: https://www.epa.gov/sunsafety/uv-index-scale-0 and the EPA *Guide to the UV Index* (category messages, Miami averages): https://www.epa.gov/sites/default/files/documents/uviguide.pdf
- NOAA WPC Beaufort wind scale: https://www.wpc.ncep.noaa.gov/html/beaufort.shtml
- FDOH (St. Johns County) sargassum fact page: https://stjohns.floridahealth.gov/programs-and-services/environmental-public-health/sargassum-seaweed/
- Where the API was found: https://mcp-api.netlify.app/ (a directory of free APIs and MCP servers)
