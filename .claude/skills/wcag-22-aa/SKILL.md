---
name: wcag-22-aa
description: "The WCAG 2.2 Level AA requirements as they apply to Beach Day and the Agent Console. Use when designing, building, reviewing or testing any UI."
user-invocable: false
metadata:
  roster-title: "WCAG 2.2 AA"
  owner: accessibility-specialist
  shared-with: [ux-designer-apple-hig, ui-designer-apple-liquid-glass, qa-engineer, pwa-engineer]
---
# WCAG 2.2 AA for Beach Day

Target: **WCAG 2.2 Level AA** for every view and state (docs/05).

Most relevant criteria:
- **1.4.3 / 1.4.11 Contrast:** text 4.5:1 (large text 3:1); UI components and graphics 3:1, in light and dark themes, including over glass.
- **1.4.1 Use of colour:** verdicts and diffs never rely on colour alone.
- **1.4.10 Reflow:** works at 320 CSS px wide and 200 % zoom with no two-dimensional scrolling. **1.4.4 / 1.4.12:** text resize and spacing.
- **2.1.1 Keyboard** and **2.4.7 Focus visible:** everything is reachable; outline ≥2 px at 3:1.
- **2.4.11 Focus not obscured (new in 2.2):** the sticky header and toasts never fully cover the focused element. Use `scroll-padding` **and** bottom padding equal to any fixed toast's height. At the end of the page, scroll-padding alone can't lift the last controls above it (caught by the focus check in `knowledge/accessibility-specialist/examples/`).
- **2.5.8 Target size (new in 2.2):** at least 24×24 CSS px, or enough spacing. We use 44 px for primary controls.
- **3.3.8 Accessible authentication (new in 2.2):** the console login allows paste and password managers, with no cognitive tests.
- **4.1.2 Name, role, value:** native elements first; ARIA only when needed, following the APG patterns.
- **4.1.3 Status messages:** updates and errors are announced through live regions.
- **2.3.1** No flashing; **2.2.2** pause or stop for any moving content.

Every change to UI needs accessibility-specialist review. Blocking issues are any AA failure.
