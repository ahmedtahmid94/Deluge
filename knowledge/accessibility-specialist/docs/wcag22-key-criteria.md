# WCAG 2.2: the criteria that matter most for Beach Day

Sources: W3C *Understanding WCAG 2.2* (retrieved 2026-11-26):
- 2.5.8: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- 2.4.11: https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html
- 1.4.3: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- 3.3.8: https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html
- 4.1.3: https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html

## 2.5.8 Target Size (Minimum), AA (quoted)

"The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when:"
- **Spacing:** "Undersized targets … are positioned so that if a 24 CSS pixel diameter circle is centered on the bounding box of each, the circles do not intersect another target or the circle for another undersized target";
- **Equivalent:** another control on the page does the same thing;
- **Inline:** the target is "in a sentence or its size is otherwise constrained by the line-height of non-target text";
- **User agent control:** a browser default, not modified by the author;
- **Essential:** the presentation is essential or legally required.

Example from the page: a 16×16 target touching a large target fails; it passes only with "a 4 CSS pixel spacing gap". Beach Day uses 44 px for primary controls (HIG).

## 2.4.11 Focus Not Obscured (Minimum), AA (quoted)

"When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content."
- "Typical types of content that can overlap focused items are sticky footers, sticky headers, and non-modal dialogs."
- A sticky banner "will fail … if it entirely obscures a component receiving focus". Fixes: make it modal, "or using scroll padding so the banner does not overlap other content" (technique **C43**: CSS `scroll-padding`). Our install and update toasts must not cover the focused element.
- **Glass:** "semi-transparent overlays, or overlays that apply a blur or other dimming effect … may separately fail 1.4.11 Non-text Contrast". The focus indicator must meet 3:1 *as seen through the overlay*.

## 1.4.3 Contrast (Minimum), AA (quoted)

- Text: "at least 4.5:1". "Large-scale" text (18 pt, or 14 pt bold, which is about 24 px, or 18.66 px bold) needs **3:1**.
- No requirement for inactive components, pure decoration, logos, or text in pictures with "significant other visual content".
- "Beyond logos and logotypes, text that has insufficient contrast due to corporate identity or brand guidelines is not exempted". The visual style is no excuse.
- Ratio: "(L1 + 0.05) / (L2 + 0.05)", where L1 is the relative luminance of the lighter colour.
- "contrast is measured with respect to the specified background over which the text is rendered in normal usage." Over glass, the background varies, so measure the **worst case** composite (`../examples/01-contrast-on-glass.ts`).

## 3.3.8 Accessible Authentication (Minimum), AA (quoted)

"A cognitive function test (such as remembering a password …) is not required for any step in an authentication process unless that step provides at least one of the following: Alternative … Mechanism … Object Recognition … Personal Content."

The accepted mechanisms include "support for password entry by password managers" and "copy and paste". So the console login must:
- allow paste;
- use `autocomplete="current-password"`;
- not block password managers.

## 4.1.3 Status Messages, AA (quoted)

"status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus."

A status message gives "information to the user on the success or results of an action, on the waiting state of an application, on the progress of a process, or on the existence of errors". Examples: "Searching…", "18 results returned".

Techniques:
- `role="status"`;
- `role="alert"` ("only necessary where a change of context does not take place");
- **ARIA23 `role="log"`** for sequential updates, which is our chat thread;
- ARIA25 for progress.
