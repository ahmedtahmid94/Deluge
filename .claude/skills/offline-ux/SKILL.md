---
name: offline-ux
description: "How Beach Day behaves on slow, flaky or no connection, common at the beach. Use when designing loading, error and offline states."
user-invocable: false
metadata:
  roster-title: "Offline and poor-network UX"
  owner: pwa-engineer
  shared-with: [ux-designer-apple-hig]
---
# Offline and poor-network UX

- Show cached data first, always labelled with its age ("Updated 25 min ago"). Over 3 hours old, add "may be out of date".
- Refresh in the background. Replace the content without a layout jump, and announce "Forecast updated" in a polite live region.
- Loading uses skeletons sized like the final content. No spinners that move the layout.
- Errors are specific and recoverable: "Couldn't reach the forecast service. Showing your last saved forecast." with a Retry button.
- Fully offline with no cache: a clear message and the beach list still usable (it is precached).
- Requests time out after about 8 s. Don't leave a spinner running forever.
- If the marine data is missing, the page still works and shows "Sea data unavailable".
- The Agent Console needs the network. Offline, it says "The Agent Console needs a connection" and caches nothing.
