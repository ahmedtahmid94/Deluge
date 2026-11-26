---
name: prompt-design-evaluation
description: "Design, test and improve prompts for team agents and for the Agent Console's runtime prompts. Use when an agent underperforms or a prompt changes."
user-invocable: false
metadata:
  roster-title: "Prompt design and evaluation"
  owner: meta-agent
  shared-with: [agent-console-engineer, orchestrator]
---
# Prompt design and evaluation

- Write instructions as direct statements of what to do. Keep the reason behind a rule to one short clause.
- Put stable context first (role, ownership, boundaries), then the procedure, then the output format.
- Give one short example of the expected output when the format matters, such as the Handoff block or the review verdict.
- Avoid overly prescriptive or shouting language (ALL CAPS, "NEVER EVER"). Current models follow plain instructions, and over-emphasis causes over-caution.
- Evaluate with real tasks:
  1. Collect 5–10 representative requests per agent from past work.
  2. Run the old and new prompt on the same requests.
  3. Compare against a written rubric (correct owner, followed boundaries, correct output format, quality).
  4. Keep the change only if it wins without regressions.
- Record what changed and why in the agent file's git commit message.
- For Agent Console runtime prompts (`CONSOLE_RULES`), coordinate with agent-console-engineer and re-run its function tests.
