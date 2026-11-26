# Environment variables (and a Free-plan caveat)

Sources (retrieved 2026-11-26):
- Overview: https://docs.netlify.com/build/environment-variables/overview/
- Functions: https://docs.netlify.com/build/functions/environment-variables/

- Scopes: **Builds**, **Functions** (includes edge functions and Netlify Server), **Runtime**, and **Post processing**.
- Deploy contexts: Production, Deploy Previews, Branch deploys, Preview server, Local development, plus specific branches.
- "You can mark environment variables as **Contains secret values** for additional access restrictions and security features with the Secrets Controller feature."
- Functions read variables with `Netlify.env.get("NAME")` (also `process.env.NAME`).
- Lambda compatibility mode only: "the total size of all environment variables cannot exceed 4 KB". The modern Functions API removes this limit.

## ⚠ Free-plan caveat (affects decision D3)

The functions page says (quoted): "**On the Pro plan and above, you can set specific scopes for your environment variables.**"

On the **Free** plan, we can't restrict a secret to the Functions scope. Every variable is also available to **builds**: `npm install` lifecycle scripts, Vite and any build script. Our design relied on Functions-only scope. Mitigations while on Free:

1. Package manifests, lockfiles, `scripts/**` and `vite.config.*` are on the agent deny-list, so agents can't add build-time code. Keep that list strict.
2. Never name a secret with a `VITE_` prefix (Vite inlines only `VITE_*` into the bundle).
3. Keep the CI bundle scan for `sk-ant-`, `github_pat_`, `ghp_` and the secret variable names.
4. Review every human dependency change (`npm audit`; read new `postinstall` scripts).
5. Check whether "Contains secret values" is offered on Free. If it is, turn it on.

This is a decision for the lead: stay on Free with these mitigations, or move to Pro for scoped variables.
