# Path traversal (agent-proposed file paths)

Source: OWASP *Path Traversal*: https://owasp.org/www-community/attacks/Path_Traversal (retrieved 2026-11-26)

- An attacker uses "dot-dot-slash (../)" sequences and variations, or absolute paths, to reach files outside the intended directory.
- Encoded variants listed by OWASP:
  - `%2e%2e%2f`, `%2e%2e/` and `..%2f` all mean `../`;
  - `%2e%2e%5c` and `..%5c` mean `..\`;
  - double-encoded: `%252e%252e%255c`;
  - overlong UTF-8: `..%c0%af`, `..%c1%9c`.
- Null-byte trick: `secret.doc%00.pdf`, where validation sees `.pdf` and the OS sees `.doc`.
- Windows accepts `\` as a separator and trailing `.`, `\` and `/` characters.

## Defences (quoted)

- "Prefer working without user input when using file system calls"
- "Ensure the user cannot supply all parts of the path – surround it with your path code"
- "**Validate the user's input by only accepting known good – do not sanitize the data**"
- "If forced to use user input for file operations, normalize the input before using in file io API's"

## Beach Day application (docs/04, section 5)

Agent proposals are user input. The validator:
- **rejects**, never repairs, any path with `..`, a leading `/`, `\`, `//`, `%`, NUL or control characters, or leading or trailing spaces;
- normalises with `path.posix.normalize` and requires the result to equal the input;
- requires an allow-glob match and no deny-glob match.

Tested with OWASP's encodings in `../examples/02-path-allowlist.ts`.
