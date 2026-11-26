---
name: interaction-flow-design
description: "User flows and interactions for Beach Day and the Agent Console, including empty, loading and error states. Use when designing or changing how a user moves through the app."
user-invocable: false
metadata:
  roster-title: "Interaction and flow design"
  owner: ux-designer-apple-hig
  shared-with: [agent-console-engineer, pwa-engineer]
---
# Interaction and flow design

Core Beach Day flows:
1. **First run:** pick a beach (a searchable list; location permission is optional, used only to sort by distance, and asked for only after a tap on "Near me"). Remember the choice.
2. **Daily check:** open the app → the verdict for today at my beach in one glance → swipe or tap the day strip → day detail with the best window and hourly breakdown.
3. **Switch beach:** a sheet with favourites first.
4. **Install:** the Android install button or the iOS hint, shown after the second visit, never on first load, and dismissible.

Agent Console flows:
1. **Sign in:** a password field only; a calm error.
2. **Choose an agent:** cards with name, model and personality.
3. **Chat:** send → queued → streaming text → done. Long jobs show progress and "You can leave this page; we'll keep working".
4. **Proposal review:** the summary, a file list, then diffs, then **Approve** (a confirmation sheet: "Commit 2 files to main and redeploy?") or **Reject**.
5. **After approval:** the commit link and deploy status.

For every screen define the states: empty, loading, partial (no marine data), error, offline, success. Write flows as numbered steps plus a state table. Hand them to pwa-engineer or agent-console-engineer and accessibility-specialist.
