---
name: automated-a11y-testing
description: "Automated accessibility checks for Beach Day with axe-core in Playwright, plus custom focus checks. Use when writing or running accessibility tests."
user-invocable: false
metadata:
  roster-title: "Automated a11y testing"
  owner: accessibility-specialist
  shared-with: [qa-engineer]
---
# Automated accessibility testing

- Use `@axe-core/playwright` in the Playwright suite. **Always pass the 2.2 tags**, or the WCAG 2.2 rules such as `target-size` don't run:

  ```ts
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  ```
- Fail on `serious` and `critical` violations. Track `moderate` ones as issues.
- Scan **every view and state**: today, day detail, picker open, offline, error, install hint, the console login, chat while running, the proposal diff, and the approve dialog open.
- Run in light and dark themes, and with `reducedMotion: "reduce"` emulation.
- **Focus not obscured (2.4.11):** axe can't fully check it. Add a test that tabs through each view and uses `document.elementFromPoint` sampling to assert the focused element isn't fully covered, with toasts and the sticky header showing.
- **Target size:** axe's `target-size` rule, plus a check that primary controls are at least 44 px.
- Automated checks catch only part of the problems. Manual AT testing (the `assistive-tech-testing` skill) is still required.
