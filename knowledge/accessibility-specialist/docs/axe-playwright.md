# Automated checks with axe-core and Playwright

Source: Playwright, *Accessibility testing*: https://playwright.dev/docs/accessibility-testing (retrieved 2026-11-26)

- Install `@axe-core/playwright`. Then `const results = await new AxeBuilder({ page }).analyze(); expect(results.violations).toEqual([]);`.
- Scope the scan: `.include('#selector')`, `.exclude('#known-issue')`. `exclude` removes **all** rules for that element and its descendants, so use it sparingly.
- WCAG-only rules: `.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])`. **Add `'wcag22aa'`** for the 2.2 rules (for example `target-size`); without it they don't run.
- Temporarily disable a rule with `.disableRules(['duplicate-id'])`. Track every disabled rule as an issue.
- Share the configuration through a test fixture (`makeAxeBuilder`).
- "Note that automated testing cannot detect all types of WCAG violations." Manual VoiceOver and TalkBack passes are still required.

Verified in `../examples/02-axe-and-dialog.mjs` (axe-core with Playwright 1.63, Chromium).
