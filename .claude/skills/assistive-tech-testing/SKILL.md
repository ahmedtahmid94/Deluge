---
name: assistive-tech-testing
description: "Manual testing of Beach Day with VoiceOver, TalkBack, keyboard, zoom and large text. Use before each release and after any UI change to key flows."
user-invocable: false
metadata:
  roster-title: "Assistive-technology testing"
  owner: accessibility-specialist
  shared-with: [qa-engineer]
---
# Assistive-technology testing

Run before each release, and after changes to key flows. Record the results in the release handoff.

Devices and modes:
- **VoiceOver on iPhone:** Safari and installed (standalone) mode.
- **TalkBack on Android:** Chrome and the installed WebAPK.
- **Keyboard only:** desktop Chrome and Safari.
- **200 % browser zoom**, and the **largest system text size** on both phones.
- **Colour-blindness emulation** (Chrome DevTools rendering) on verdicts and diffs.
- **Reduced motion, reduced transparency and increased contrast** settings on iOS.

Scripts:
1. Pick a beach → hear today's verdict, window and reason → open a day → move through the hours → find the NWS rip-current link.
2. Go offline → reopen → hear the saved-forecast age.
3. Install hint (iOS) and install button (Android) reachable and dismissible.
4. Console: sign in → choose an agent → send a message → hear progress and completion → open the proposal → move through the diff → Approve with confirmation → hear the commit result.

Report issues with the device, AT, steps, expected and actual result, and the WCAG criterion.
