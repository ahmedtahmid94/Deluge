# Headers and caching

Sources (retrieved 2026-11-26):
- Custom headers: https://docs.netlify.com/manage/routing/headers/
- Caching overview: https://docs.netlify.com/build/caching/caching-overview/

## Custom headers (quoted)

`_headers` file in the publish directory:

```
/*
  X-Frame-Options: DENY
```

`netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
```

- Header names are case-insensitive; `#` starts a comment.
- "Wildcards (`*`) can be used at any place inside of a path segment … Placeholders (`:placeholders`) can only be used at the start of a path segment … Wildcards and placeholders cannot be within the same path segment."
- `netlify.toml` headers are global for all deploy contexts.
- The page does not say that these rules apply to function responses. **Set security and cache headers inside function responses too**; don't rely on `_headers` for `/api/*`.

## Caching (quoted)

- Static assets are cached at the edge and "automatically invalidated whenever a deploy changes the content". The CDN treats them "as fresh for up to one year and ignore[s] any attempts to set cache control headers with a shorter max-age". The browser defaults are `Cache-Control: public, max-age=0, must-revalidate`.
- "**Responses coming from Netlify Functions … are not cached by default.**" Add cache headers to cache them.
- Header precedence: `Netlify-CDN-Cache-Control` (Netlify only), then `CDN-Cache-Control` (all CDNs), then `Cache-Control` (all caches including the browser).
- Directives:
  - `public`;
  - `private` (not cached at Netlify);
  - `no-store`;
  - `s-maxage` (the shared cache uses it over `max-age`);
  - `stale-while-revalidate`;
  - **`durable`**: "for serverless functions only … store the response in Netlify's durable cache so that other edge nodes can reuse it instead of invoking the function again."
- Cache keys can be narrowed with `Netlify-Vary` (for example `query=beach`).
- Debug with the `Cache-Status` response header ("Netlify Edge", "Netlify Durable").

## Beach Day `/api/forecast`

```
Cache-Control: public, max-age=300
Netlify-CDN-Cache-Control: public, durable, s-maxage=1200, stale-while-revalidate=600
Netlify-Vary: query=beach
```

`durable` matters on the Free plan (D3): one function call serves all edge nodes, which saves invocations.
