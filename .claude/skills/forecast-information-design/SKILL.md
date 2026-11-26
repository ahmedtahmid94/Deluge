---
name: forecast-information-design
description: "How to present Beach Day forecasts so a score, a best time window and reasons are understood at a glance. Use when designing forecast screens or charts."
user-invocable: false
metadata:
  roster-title: "Information design for forecasts"
  owner: ux-designer-apple-hig
  shared-with: [beach-conditions-analyst, ui-designer-apple-liquid-glass]
---
# Information design for forecasts

- **Lead with the answer:** the verdict word ("Great"), then the best window ("Best 9 am – 1 pm"), then one reason line. The number score is secondary.
- **The day strip:** 7 compact cards with day name, verdict label and icon, and the high temperature. Days 3–4 are tagged "less certain" and days 5–7 "outlook", with no hourly windows for 5–7 (decision in docs/01).
- **Day detail:**
  - an hourly timeline with the best window highlighted and gate hours marked (for example "storm");
  - rain chance, wind and gusts, feels-like, UV category, waves and water temperature as small rows;
  - an optional chart with a "Show as table" toggle.
- **Units:** °F, mph, ft, with the units always visible. Round sensibly (whole degrees, wind to 1 mph, waves to 0.5 ft).
- **Reasons** in plain words from the scorer ("Windy: gusts to 28 mph"). Don't show raw variable names.
- **UV** is shown as the EPA category plus an action ("Very High — seek shade 11 am – 4 pm"), not as a score penalty.
- **Safety** blocks (lightning, heat, the NWS rip-current link) are visually distinct, not decorative, and are never collapsed by default.
- **Attribution** ("Weather data by Open-Meteo.com") in the footer of every forecast view.
