# Safety sources behind the scoring gates

All retrieved 2026-11-25/26. Quotes are verbatim.

## Lightning (NWS)

- https://www.weather.gov/safety/lightning-safety-overview: "wait 30 minutes after the last lightning or thunder before going back outside."
- NWS JetStream: "When thunder roars, go indoors and stay there until 30 minutes after the last clap of thunder."
- **Gate:** WMO codes 95, 96 and 99 make that hour No-go, and the following hour is capped at Poor.

## Heat index (NWS)

Source: https://www.weather.gov/ama/heatindex

| Category | Heat index | Effect |
|---|---|---|
| Caution | 80–90 °F | "Fatigue possible with prolonged exposure and/or physical activity" |
| Extreme Caution | 90–103 °F | "Heat stroke, heat cramps, or heat exhaustion possible" |
| Danger | 103–124 °F | "Heat cramps or heat exhaustion likely, and heat stroke possible" |
| Extreme Danger | ≥ 125 °F | "Heat stroke highly likely" |

- "the heat index values in the chart above are for shady locations. If you are exposed to direct sunlight, the heat index value can be increased by up to 15°F."
- **Gates:** feels-like ≥ 103 °F caps at Poor; ≥ 125 °F is No-go. Open-Meteo's `apparent_temperature` is our feels-like value. It is not identical to the NWS heat index, which is a documented approximation.

## UV (EPA)

Sources: https://www.epa.gov/sunsafety/uv-index-scale-0 and the *Guide to the UV Index* (PDF).

| UV index | Category |
|---|---|
| 1–2 | Low |
| 3–5 | Moderate |
| 6–7 | High |
| 8–10 | Very High |
| 11+ | Extreme |

- Extreme: "Beachgoers should know that white sand and other bright surfaces reflect UV and will increase UV exposure."
- Miami's average UV: winter 4 (Moderate), summer 10–11 (Very High to Extreme).
- **Not a penalty.** UV is shown as advice (docs/01).

## Wind (NOAA WPC Beaufort scale)

Source: https://www.wpc.ncep.noaa.gov/html/beaufort.shtml. The table lists **knots first, then mph**.

| Force | Name | Knots | mph | Land effects (from the table) |
|---|---|---|---|---|
| 2 | Light breeze | 4–6 | 4–7 | Weather vanes become active |
| 4 | Moderate breeze | 11–16 | 13–18 | Small branches sway |
| 5 | Fresh breeze | 17–21 | 19–24 | Small trees sway |
| 6 | Strong breeze | 22–27 | 25–31 | Large branches sway |
| 7 | Near gale | 28–33 | 32–38 | Whole trees sway; difficult to walk |

Force 3, gentle breeze, is 7–10 kt, which is 8–12 mph (standard Beaufort; the force 3 row did not extract). So our wind component gives full marks at ≤ 12 mph and zero at ≥ 25 mph (strong breeze).

## Rip currents (NWS): link out only (decision D1)

- https://www.weather.gov/safety/ripcurrent: "**Rip currents often form on calm, sunny days.**" Wave height is not a rip-current signal.
- https://www.weather.gov/safety/ripcurrent-forecasts: Surf Zone Forecasts give Low, Moderate and High risk. "When you arrive at the beach, ask the lifeguard about rip currents".
- **Beach Day never estimates rip-current risk.** Every beach links to the NWS forecast through `nwsRipCurrentUrl`.
