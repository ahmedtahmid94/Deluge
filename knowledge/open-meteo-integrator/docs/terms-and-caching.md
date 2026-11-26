# Open-Meteo terms, limits and our caching

Sources:
- https://open-meteo.com/en/terms (retrieved 2026-11-25)
- https://open-meteo.com/en/docs

## Free tier (quoted from the terms page)

| Limit | Value |
|---|---|
| Calls per minute | 600 |
| Calls per hour | 5,000 |
| Calls per day | 10,000 |
| Calls per month | 300,000 |

- **Non-commercial only.** Commercial use, such as "websites or apps with subscriptions or advertisements", needs a paid plan (API Standard, Professional or Enterprise).
- Data licence: **CC BY 4.0**. Show "Weather data by Open-Meteo.com" with a link to https://open-meteo.com/.
- No API key is needed on the free tier.
- The terms page does not say how multi-variable or multi-location requests are counted. Assume they can count as more than one call, and check before adding bulk requests.

## Our caching budget

| Layer | Setting |
|---|---|
| CDN, per beach URL | ~20 min (`s-maxage=1200`, `stale-while-revalidate=600`) |
| Browser | `max-age=300` |
| Service worker | stale-while-revalidate, showing the data's age |

Worst case: 11 beaches × 2 endpoints × 72 refreshes a day ≈ **1,584 calls/day**, about 16 % of the daily limit, regardless of traffic.

## Request hygiene

- Only coordinates from `beaches.json`; reject unknown beach IDs, so nobody can use the function as an open proxy.
- Fetch forecast and marine in parallel, each with an ~8 s timeout (`AbortSignal.timeout(8000)`) and one retry on 5xx.
- On failure, serve the last good cached response if there is one, and mark it stale. Without one: forecast failure gives an error; marine failure gives `marine: null`.
