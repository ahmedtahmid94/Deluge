---
name: ux-writing
description: "Voice and wording for Beach Day: verdicts, reasons, warnings, errors, buttons and confirmations. Use when writing or reviewing any user-facing text."
user-invocable: false
metadata:
  roster-title: "UX writing"
  owner: ux-designer-apple-hig
  shared-with: [beach-conditions-analyst, ui-designer-apple-liquid-glass]
---
# UX writing

Voice: friendly, local and calm. Short sentences, plain words, no jargon ("WMO code", "swell period") in the main UI.

Patterns:
- Verdict: one word, plus a short line: "Great — sunny and light winds."
- Reason: the cause plus a number: "Storms likely after 2 pm", "Windy: gusts to 28 mph".
- Best window: "Best 9 am – 1 pm".
- Error: what happened, then what we did or what to do: "Couldn't load the latest forecast. Showing the one from 8:40 am. Try again."
- Buttons: verbs. "Install Beach Day", "Approve and commit", "Reject".
- Confirmations name the consequence: "Commit 2 files to main and redeploy the live site?"
- Safety copy follows the `safety-communication` skill, and beach-conditions-analyst approves it.

Rules:
- Sentence case.
- Times as "2 pm" in local time.
- No exclamation marks in warnings.
- Never say "safe".
- Text must make sense out of context for screen readers. Link text describes its target ("NWS rip current forecast", not "here").
