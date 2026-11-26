---
name: beach-meteorology
description: "What weather and sea conditions mean for a person at a South Florida beach, from NWS, EPA and NOAA sources. Use when interpreting forecast data or explaining conditions."
user-invocable: false
metadata:
  roster-title: "Meteorology for beachgoers"
  owner: beach-conditions-analyst
  shared-with: [open-meteo-integrator, ux-designer-apple-hig]
---
# Meteorology for beachgoers

Sourced facts (docs/01):
- **Lightning (NWS):** "When thunder roars, go indoors." Wait **30 minutes** after the last thunder. WMO codes 95/96/99 mean a thunderstorm.
- **Heat index (NWS):**
  - Caution 80–90 °F
  - Extreme Caution 90–103 °F
  - Danger 103–124 °F
  - Extreme Danger ≥125 °F

  Chart values assume shade; **full sun adds up to 15 °F**. Use Open-Meteo `apparent_temperature` as the feels-like value.
- **UV (EPA):**
  - Low 1–2
  - Moderate 3–5
  - High 6–7
  - Very High 8–10
  - Extreme 11+

  Miami's summer average is 10–11. White sand reflects UV.
- **Wind (Beaufort, NOAA WPC):**
  - ≤12 mph: gentle breeze
  - 13–18 mph: moderate; blowing sand and loose paper
  - 19–24 mph: fresh
  - 25+ mph: strong
- **Rip currents (NWS):** Low, Moderate and High risk are issued in Surf Zone Forecasts (NWS Miami, NWS Key West). **Beach Day links out and never estimates (decision D1).**
- **Florida summer pattern:** clear mornings and afternoon sea-breeze thunderstorms are common, which is why hours are scored separately.
- **Forecast skill drops with lead time.** Rain timing is the least reliable. Days 1–2 are normal, 3–4 less certain, 5–7 an outlook.
