# GitHub REST API: read files and commit to `main`

Sources (retrieved 2026-11-26):
- Contents: https://docs.github.com/en/rest/repos/contents
- Git refs: https://docs.github.com/en/rest/git/refs
- Git commits: https://docs.github.com/en/rest/git/commits
- Git trees: https://docs.github.com/en/rest/git/trees

Common headers: `Accept: application/vnd.github+json`, `Authorization: Bearer <token>`, `X-GitHub-Api-Version: 2026-03-10` (the version shown in the current docs samples).

## Read a file: `GET /repos/{owner}/{repo}/contents/{path}?ref=main`

- `ref`: "The name of the commit/branch/tag. Default: the repository's default branch."
- A file response contains `type: "file"`, `encoding: "base64"`, `size`, `name`, `path`, `content` (base64 with `\n` line breaks), and `sha` (the **blob** SHA).
- Size limits:
  - "1 MB or smaller: All features of this endpoint are supported."
  - 1–100 MB: only the `raw` or `object` media types.
  - "Greater than 100 MB: This endpoint is not supported."
  - Directories: "an upper limit of 1,000 files".
- Media types:
  - `application/vnd.github.raw+json` returns the raw contents;
  - `application/vnd.github.object+json` returns a consistent object.
- Symlinks: when the target is a normal file, "the API responds with the content of the file".

## Single-file write: `PUT /repos/{owner}/{repo}/contents/{path}` (not used for multi-file)

- Body:
  - `message` (required);
  - `content` (required, **base64**);
  - `sha` ("Required if you are updating a file. The blob SHA of the file being replaced.");
  - `branch`, `committer`, `author` (name and email required if given, else 422).
- Returns 201 or 200 with `content.sha` and `commit.sha`.
- Warning: using this and *Delete a file* "in parallel, the concurrent requests will conflict". Use them one at a time.

## Atomic multi-file commit (what Approve does)

1. **Get the ref**: `GET /repos/{o}/{r}/git/ref/heads/main` returns `{ ref, object: { type: "commit", sha } }`. Status 200, 404 or 409.
2. **Get the commit**: `GET /repos/{o}/{r}/git/commits/{sha}` returns `{ sha, tree: { sha }, parents, … }`. Needs Contents (read).
3. **Create the tree**: `POST /repos/{o}/{r}/git/trees` with `{ base_tree, tree: [{ path, mode: "100644", type: "blob", content }] }`.
   - "If the value [of sha] is null then the file will be deleted."
   - Use `content` or `sha`, not both.
   - Needs Contents (write).
4. **Create the commit**: `POST /repos/{o}/{r}/git/commits` with `{ message, tree, parents: [headSha] }`.
   - "If omitted or empty, the commit will be written as a root commit."
   - Returns 201 with `{ sha, html_url, … }`.
   - Needs Contents (write).
5. **Update the ref**: `PATCH /repos/{o}/{r}/git/refs/heads/main` with `{ sha, force: false }`.
   - `force`: "Indicates whether to force the update or to make sure the update is a fast-forward update. Leaving this out or setting it to false will make sure you're not overwriting work. Default: false".
   - Status 200; **409** conflict; 422 validation failed.

Commits created this way are unsigned (`verification.reason: "unsigned"`) unless a PGP `signature` is supplied. That is fine for Beach Day.

All five calls work with **fine-grained personal access tokens** that have "Contents" repository permission (read for the GETs, write for the POSTs and PATCH). This matches decision D4.

Verified with a fake GitHub in `../examples/02-commit-to-main.ts`.
