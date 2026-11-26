---
name: github-commits-api
description: "Reading repo files and committing approved Agent Console proposals straight to main with the GitHub REST API. Use when writing the read tools or the approve-and-commit function."
user-invocable: false
metadata:
  roster-title: "GitHub REST API (contents and Git data)"
  owner: agent-console-engineer
  shared-with: [security-engineer]
---
# GitHub REST API: read and commit

Auth: `Authorization: Bearer $GITHUB_TOKEN` (a fine-grained PAT, decision D4) and an `X-GitHub-Api-Version` header. Owner, repo and branch come from env vars.

Read:
- `GET /repos/{o}/{r}/contents/{path}?ref=main`: base64 content. Files up to 1 MB are fully supported; 1–100 MB only with the raw media type. We cap at 1 MB.
- `GET /repos/{o}/{r}/git/trees/{sha}?recursive=1` for listing.

Commit an approved proposal **straight to `main`** (decision D2), atomically:
1. `GET /repos/{o}/{r}/git/ref/heads/main` → head SHA.
2. Conflict check: if head ≠ `baseCommit`, compare each touched file's current blob SHA with `baseBlobSha`. If any differs → `stale`.
3. `GET /repos/{o}/{r}/git/commits/{head}` → tree SHA.
4. `POST /repos/{o}/{r}/git/trees` with `base_tree` and entries `{ path, mode: "100644", type: "blob", content }`. Deletes use `sha: null`.
5. `POST /repos/{o}/{r}/git/commits` with `{ message, tree, parents: [head] }`.
6. `PATCH /repos/{o}/{r}/git/refs/heads/main` with `{ sha, force: false }`. A non-fast-forward fails rather than overwriting.

Notes:
- The Contents API `PUT`/`DELETE` endpoints conflict if called in parallel. Don't use them for multi-file commits.
- Commit message: `agent(<name>): <summary> [proposal <id>]`.
- Handle 404, 409 and 422 with clear errors, and return the proposal to `pending`.
- The push to `main` triggers the Netlify build. Show the commit URL and a link to the deploy status.
