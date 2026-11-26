---
name: safety-communication
description: "Wording and placement of Beach Day's safety messages: disclaimer, lightning, heat and the NWS rip-current link. Use when writing or reviewing any safety-related UI text."
user-invocable: false
metadata:
  roster-title: "Safety communication"
  owner: beach-conditions-analyst
  shared-with: [ux-designer-apple-hig, security-engineer]
---
# Safety communication

Required on every forecast:
- Footer: "Beach Day is a comfort guide, not a safety service. Marine forecasts are less accurate near the coast. Always swim near a lifeguard and follow the flags."
- **Rip currents (decision D1):** a visible link on every beach view: "Rip current risk: check the National Weather Service forecast". It uses the beach's `nwsRipCurrentUrl`, falling back to https://www.weather.gov/safety/ripcurrent-forecasts. Help text may explain NWS's Low/Moderate/High levels, but **the app never shows its own rip-current level and never implies one from waves**.
- Lightning hours: "Thunderstorms likely. When thunder roars, go indoors. Wait 30 minutes after the last thunder."
- Heat ≥103 °F feels-like: "Dangerous heat. Limit time in the sun, drink water, seek shade."

Style:
- Plain, calm and specific: say what to do and when. No jokes in safety text, no exclamation marks.
- Never call a day "safe". Say "good conditions".
- A gate's message is always shown, even when the overall verdict is good (for example "Great morning — storms likely from 3 pm").
- Safety text must not be hidden behind taps, colour alone or animation. It must read correctly with VoiceOver and TalkBack.
- Any change to safety wording needs beach-conditions-analyst approval.
