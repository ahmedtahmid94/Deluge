---
name: frontend-implementation
description: "How to build Beach Day UI code: semantic HTML, modern CSS, small components and design tokens. Use when writing any front-end markup, styles or UI logic."
user-invocable: false
metadata:
  roster-title: "Front-end implementation"
  owner: pwa-engineer
  shared-with: [agent-console-engineer, ui-designer-apple-liquid-glass, accessibility-specialist]
---
# Front-end implementation

- **Semantic HTML first:**
  - landmarks (`header`, `main`, `nav`, `footer`);
  - one `h1` per view;
  - real `button`, `a`, `select`, `dialog`, `label`.
- **CSS:**
  - custom properties for Sable's design tokens (`--bd-color-*`, `--bd-space-*`, `--bd-radius-*`, `--bd-blur-*`);
  - logical properties; container queries for cards;
  - `@media (prefers-color-scheme: dark)`, `(prefers-reduced-motion)`, `(prefers-reduced-transparency)` and `(prefers-contrast: more)`.
- **Glass surfaces:** use `backdrop-filter: blur()` with a `-webkit-` prefix for Safari, and always a solid fallback (`@supports not (backdrop-filter: blur(1px))`, plus the reduced-transparency query).
- **Mobile layout first:**
  - works at 320 px with no horizontal scroll;
  - primary tap targets 44×44 px;
  - safe-area padding.
- Keep components small and stateless where possible. State lives in one store module (selected beach, units, last forecast).
- No inline scripts or inline event handlers (CSP `script-src 'self'`). No external fonts or CDNs unless the CSP is updated; system fonts (`-apple-system, system-ui`) fit the Apple style.
- Escape any text from an API or agent before inserting it into the DOM. Use `textContent`, never `innerHTML` with dynamic data.
- Every new view or state gets an accessibility-specialist review and an axe test.
