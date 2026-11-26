# Netlify Functions

Sources (retrieved 2026-11-25 and 2026-11-26):
- Functions API reference: https://docs.netlify.com/build/functions/api/
- Configuration (limits): https://docs.netlify.com/build/functions/configuration/
- Background Functions: https://docs.netlify.com/build/functions/background-functions/
- Rate limiting: https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/

## Signature (quoted)

"A function that responds to web requests receives a Request representing the incoming request and a Context object with Netlify-specific metadata. The handler returns a Response."

```ts
import type { Context } from "@netlify/functions"
export default async (req: Request, context: Context) => {
  return new Response("Hello, world!")
}
```

- Route parameters: for `path: "/pets/:name"`, `context.params` is `{"name":"boo"}`. "To access the query string, use request.url instead."
- Config goes in `export const config: Config = { path, rateLimit, background, memory, … }`. Types come from `@netlify/functions` (v6.1.2 verified).

## Limits (configuration page; none are configurable)

| Setting | Default |
|---|---|
| Synchronous execution limit | **60 seconds** |
| Background execution limit | **15 minutes** |
| Streamed response payload | **20 MB** |

"Streaming functions have a 60-second execution limit and a 20 MB response size limit." To stream, "return a ReadableStream as the body of the Response."

## Background mode (quoted)

- "When `config.background` is set to true, the platform sends a 202 response to the client immediately and the function continues running in the background … The handler's return value is discarded."
- The `-background` filename suffix still works; `config.background` is preferred.
- "If function invocation returns an error, a retry happens after one minute. If it fails again, another retry happens two minutes later."
- "Background functions don't support response streaming because they don't return responses."
- Available on credit-based plans, **including Free**.

## Rate limiting (quoted)

```ts
export const config: Config = {
  path: "/",
  rateLimit: { windowLimit: 100, windowSize: 60, aggregateBy: ["ip", "domain"] },
}
```

- Properties: `action` (`"rate_limit"` or `"rewrite"`), `aggregateBy` (`"ip"`, `"domain"` or both), `to` (the rewrite target), `windowSize` (seconds; "Maximum is 180"), `windowLimit`.
- "rate limits for functions cannot be defined in the netlify.toml configuration file."
- The Free plan supports targeting by path, blocking or rewriting, and per domain + IP aggregation.

Verified in `../examples/01-forecast-function.mts` and `../examples/03-agent-start.mts` (typechecked against `@netlify/functions` 6.1.2 and run with Request objects).
