# Sable's examples

| Folder / file | What it shows | How to check |
|---|---|---|
| `01-glass-tokens/` | Design tokens with Liquid Glass-style chrome and **solid fallbacks** for Reduce Transparency, Increase Contrast and no `backdrop-filter` | `cd 01-glass-tokens && node verify.mjs` (Chromium, using CDP media emulation) |
| `02-token-contrast.ts` | Every text/background pair and verdict chip checked against WCAG AA and Apple's table, light and dark, with glass composited over worst-case backgrounds | `node --experimental-strip-types 02-token-contrast.ts` |

Verified 2026-11-26:
- 15/15 pairs pass;
- the glass goes from `rgba(255,255,255,0.62)` to solid `rgb(255,255,255)` under Reduce Transparency and Increase Contrast, in light and dark.

Sable has no Bash tool, so the accessibility specialist or QA runs these checks.
