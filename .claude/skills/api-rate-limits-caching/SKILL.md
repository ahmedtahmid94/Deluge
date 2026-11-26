---
name: api-rate-limits-caching
description: "Keep Beach Day within Open-Meteo's free-tier limits and attribution rules with caching. Use when changing how often or how much Open-Meteo is called."
user-invocable: false
metadata:
  roster-title: "API rate limits and caching"
  owner: open-meteo-integrator
  shared-with: [netlify-engineer, pwa-engineer]
---
# API rate limits and caching

Open-Meteo free tier:
- **600 calls/min, 5,000/hour, 10,000/day, 300,000/month**.
- Non-commercial only. Ads, subscriptions or a commercial product need a paid plan; escalate to the lead.
- Requests with many variables or locations may count as more than one call. Check the terms before bulk polling.
- Data is **CC BY 4.0**: the UI shows "Weather data by Open-Meteo.com", linked, and the API response carries `attribution`.

Caching layers:
1. **CDN (Netlify):** cache `/api/forecast?beach=<id>` for about 20 minutes, with stale-while-revalidate. With 11 beaches that bounds upstream use to about 1,600 calls a day whatever the traffic.
2. **Browser HTTP cache:** `max-age` about 5 minutes.
3. **Service worker:** stale-while-revalidate, showing "Updated N min ago".

Rules:
- Only allow-listed beach IDs, so the function can't be abused as an open proxy.
- Fetch forecast and marine in parallel, with a timeout (about 8 s) and one retry on 5xx.
- On Open-Meteo 429 or 5xx, serve stale data if available and say so in the response. Don't hammer the upstream.
- Netlify Free plan (decision D3): caching also keeps function use within the free allowance.
