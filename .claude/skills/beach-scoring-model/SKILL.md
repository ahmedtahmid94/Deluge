---
name: beach-scoring-model
description: "The Beach Day scoring model: hourly gates, weighted comfort components, day summary and best window. Use when implementing, testing or tuning scores."
user-invocable: false
metadata:
  roster-title: "Scoring model design"
  owner: beach-conditions-analyst
  shared-with: [qa-engineer, software-architect]
---
# Beach Day scoring model

The full spec is in `docs/01-use-case-and-beach-scoring.md`. Implement it in `src/shared/scoring.ts` as pure functions.

**Hard gates (per hour):**
- Thunderstorm codes 95/96/99 → No-go, and the next hour is capped at Poor.
- Feels-like ≥103 °F → cap at Poor; ≥125 °F → No-go.
- Waves ≥6 ft → No-go for swimming; ≥4 ft → cap at Fair. This is a surf-comfort heuristic, **not a rip-current estimate**.
- Gusts ≥35 mph → cap at Poor.

**Comfort components (weight):**

| Component | Weight | Full marks | Zero |
|---|---|---|---|
| Rain | 30 | ≤10 % and 0 in | ≥70 % or ≥0.1 in/h |
| Sky | 15 | codes 0–1 or cloud ≤30 % | — |
| Wind | 20 | ≤12 mph | ≥25 mph or gusts ≥30 mph |
| Feels-like | 20 | 78–90 °F | ≤65 °F or ≥103 °F |
| Sea | 10 | ≤2 ft | ≥5 ft |
| Water temperature | 5 | 78–86 °F | ≤70 °F |

Components are linear between the full and zero points. **UV is advice, not a penalty.**

**Day summary:**
- Beach hours run from sunrise+1 h to sunset−1 h, clipped to 8 am–7 pm.
- The best window is the run of ≥3 hours scoring ≥60 with the highest mean.
- Day score is the mean of the best 4 consecutive hours. Gates in the window cap the verdict.

**Bands:** Great ≥80, Good 65–79, Fair 50–64, Poor 30–49, No-go <30.

**Reasons:** the two components that lose the most weighted points, in plain words.

When marine data is `null`, redistribute the Sea and Water weights over the others.

Thresholds marked heuristic may be tuned. Every change needs fixture tests and qa-engineer review. Sourced thresholds change only if the source changes.
