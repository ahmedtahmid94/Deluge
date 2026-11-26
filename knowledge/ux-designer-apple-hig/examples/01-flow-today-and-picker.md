# Flow: check today's beach day (and switch beach)

Owner: Wren. Follows the HIG (layout, sheets, writing) and WCAG 2.2 AA. Hand this spec to Sable (visuals), pwa-engineer (build), accessibility-specialist (review) and beach-conditions-analyst (safety copy).

## Steps

1. The app opens on **Today** for the saved beach. With no saved beach, the **Beaches** sheet opens at the medium detent.
2. The verdict block reads top to bottom: verdict word with icon → best window → one reason line → the safety strip (lightning or heat when relevant, plus the NWS rip-current link, always shown).
3. The **day strip** below shows 7 days. Tapping a day opens **Day detail** (a push, not a sheet). Swiping scrolls the strip, and visible previous/next buttons do the same.
4. **Switch beach:** tap the beach name in the header → the Beaches sheet (grabber; medium and large detents; swipe down or **Cancel** to dismiss). Choosing a beach closes the sheet and updates Today.

## States (Today)

| State | What shows | Copy |
|---|---|---|
| Loading (first time) | Skeleton verdict and day strip | — (announced: "Loading forecast") |
| Success | Verdict block + strip | "Great — sunny and light winds." / "Best 9 am – 1 pm" |
| Stale (cached, over 3 h) | Content + age label | "Updated 8:40 am · may be out of date" |
| Partial (no marine data) | Content; sea rows hidden | "Sea data unavailable right now." |
| Offline, with cache | Content + banner | "You're offline. Showing the forecast from 8:40 am." |
| Offline, no cache | Message + beach list | "You're offline and there's no saved forecast for this beach yet." |
| Error | Message + Retry | "Unable to load the forecast. Try again in a moment." [Try again] |

## Safety strip (beach-conditions-analyst approves this copy)

- Always shown: "Rip current risk: check the NWS forecast" (opens `nwsRipCurrentUrl`; decision D1).
- Storm hours: "Thunderstorms likely from 3 pm. When thunder roars, go indoors."
- Feels-like ≥ 103 °F: "Dangerous heat this afternoon. Limit time in the sun and drink water."

## Accessibility notes

- The verdict block is one heading plus text. Its accessible summary is "Today at South Beach: Great. Best 9 am to 1 pm. Sunny and light winds."
- Each day button's name is "Saturday, Good, score 72, best 9 am to 1 pm".
- The sheet's grabber is reachable with VoiceOver. Focus returns to the beach name after the sheet closes.
