# GitHub fine-grained personal access tokens (decision D4)

Sources (retrieved 2026-11-25 and 2026-11-26):
- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
- Per-endpoint permissions on https://docs.github.com/en/rest/repos/contents, https://docs.github.com/en/rest/git/commits and https://docs.github.com/en/rest/git/trees

## From GitHub's docs

- Repository access can be limited to **"Only select repositories"**. "Tokens always include read-only access to all public repositories on GitHub."
- Permissions are chosen per resource. **Metadata: read-only is mandatory.**
- Expiration can be 1–366 days or none. Organisations and enterprises can set a maximum lifetime.
- Organisations can require approval. Until approved, the token is `pending` and can only read public resources.
- Fine-grained tokens can't access multiple organisations at once, can't contribute to repos where the user is an outside collaborator, and can't call the Checks API or Packages.
- Treat the token as a secret: store it as an encrypted secret and never hard-code it.

## Permissions needed per endpoint (from the REST docs)

| Endpoint | Permission |
|---|---|
| `GET /contents/{path}` | Contents: read |
| `GET /git/commits/{sha}` | Contents: read |
| `POST /git/trees` | Contents: **write** |
| `POST /git/commits` | Contents: **write** |
| `PATCH /git/refs/{ref}` | Contents: **write** |
| `PUT` / `DELETE /contents/{path}` | Contents: write, **plus Workflows: write for files under `.github/workflows/`** |

So a token with **Contents read/write plus Metadata read, and no Workflows**, can do everything Approve needs, and GitHub itself refuses commits that touch workflow files. That is our backstop behind the path allow-list.

## Checklist

- [ ] Only select repositories: this repo
- [ ] Contents: Read and write; Metadata: Read-only; nothing else
- [ ] Expiry 90 days, with a rotation reminder
- [ ] Stored only as Netlify env var `GITHUB_TOKEN`, Functions scope, production context
- [ ] `main` has no "require pull request" rule (D2)
