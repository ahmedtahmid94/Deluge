---
name: path-allowlist
description: "The allow-list and deny-list of repository paths Agent Console proposals may change, and how to validate them. Use when writing, testing or reviewing proposal validation."
user-invocable: false
metadata:
  roster-title: "Path allow-list enforcement"
  owner: security-engineer
  shared-with: [agent-console-engineer, qa-engineer]
---
# Path allow-list

**Allowed** (an agent may change):
- `src/app/**`, `src/shared/**` (except `models.ts`), `src/console/ui/**`
- `public/icons/**`, `public/screens/**`, `src/data/beaches.json`
- `tests/**`, `docs/**`
- `.claude/agents/**` and `.claude/skills/**`, flagged in the review UI as high-impact

**Denied** (deny wins):
- `netlify/**`, `netlify.toml`, `public/_headers`, `public/_redirects`
- `package.json`, lockfiles, `.npmrc`
- `.github/**`, `scripts/**`, `vite.config.*`, `tsconfig*.json`
- `src/console/server/**`, `src/shared/models.ts`
- `.env*`, `**/*.pem`, `**/*.key`, `CLAUDE.md`

Why: these files hold the secrets, the auth, the CSP and headers, or run at build time. Changing them would let an agent widen its own access.

Validation, in `src/shared/allowlist.ts`, run at proposal **and** at approval. Reject a path that:
- is absolute, contains `..`, `\`, `//`, NUL or control characters, or has leading or trailing spaces;
- contains percent-encoding;
- doesn't match an allow glob exactly after `path.posix.normalize`;
- matches any deny glob;
- isn't a regular file (mode `100644` only; no symlink, submodule or executable).

Limits: at most 20 files, 200 KB per file, 1 MB total, UTF-8 text only.

Test with a table of hostile paths (docs/05). Changing these lists is a security-engineer decision, applied by a human.
