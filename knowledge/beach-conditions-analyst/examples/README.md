# Beach-conditions analyst examples

| File | What it shows | How to check |
|---|---|---|
| `scoring.ts` | Reference implementation of the docs/01 scoring model (pure) | — |
| `01-worked-example.test.ts` | The docs/01 worked example and every gate, as assertions | `node --experimental-strip-types 01-worked-example.test.ts` |
| `02-score-live-fixture.ts` | Scoring the real South Beach forecast (one rainy day, one clear breezy day) | `node --experimental-strip-types 02-score-live-fixture.ts` |

Verified 2026-11-26: both print `ok`. The live run gives:
- 2026-11-25: **Poor** (rain, sky; steady-rain gate);
- 2026-11-26: **Great** 87, best 10:00–13:00 (feels-like, wind).

**Spec change found by running real data.** As first written, the model rated the all-day-rain day **Fair (52)**, because rain carries only 30 % of the weight. Two rules were added, and are recorded in docs/01 and the `beach-scoring-model` skill:
- **steady rain:** WMO 61–67 or 80–82 with a rain chance of 70 % or more caps the hour at Poor;
- **no best window:** a day without 3 consecutive hours scoring 60 or more is capped at Poor.

Open tuning question: a feels-like of 70–75 °F in November still scores "Great". Check this against what local users expect.
