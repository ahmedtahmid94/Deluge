// Example 1: the /api/forecast function: modern signature, config with path + rateLimit,
// allow-listed beach IDs, parallel upstream calls, and CDN cache headers (durable + SWR).
// In production this lives at netlify/functions/forecast.mts. Typechecked against @netlify/functions 6.1.2.
import type { Config, Context } from "@netlify/functions";

const BEACHES: Record<string, { lat: number; lon: number }> = {
  "south-beach": { lat: 25.7826, lon: -80.13 },
  "haulover": { lat: 25.9036, lon: -80.1203 },
};

export default async (req: Request, _context: Context): Promise<Response> => {
  const beachId = new URL(req.url).searchParams.get("beach") ?? "";
  const beach = BEACHES[beachId];
  if (!beach) {
    return Response.json({ error: "unknown beach" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const common = `latitude=${beach.lat}&longitude=${beach.lon}&timezone=America%2FNew_York&timeformat=unixtime&forecast_days=7`;
  const [f, m] = await Promise.allSettled([
    fetch(`https://api.open-meteo.com/v1/forecast?${common}&hourly=temperature_2m&temperature_unit=fahrenheit`, { signal: AbortSignal.timeout(8000) }),
    fetch(`https://marine-api.open-meteo.com/v1/marine?${common}&hourly=wave_height&length_unit=imperial&cell_selection=sea`, { signal: AbortSignal.timeout(8000) }),
  ]);
  if (f.status === "rejected" || !f.value.ok) {
    return Response.json({ error: "forecast unavailable" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
  const marine = m.status === "fulfilled" && m.value.ok ? await m.value.json() : null;
  return Response.json(
    { beach: beachId, forecast: await f.value.json(), marine, attribution: "Weather data by Open-Meteo.com (CC BY 4.0)" },
    { headers: {
        "Cache-Control": "public, max-age=300",
        "Netlify-CDN-Cache-Control": "public, durable, s-maxage=1200, stale-while-revalidate=600",
        "Netlify-Vary": "query=beach",
    } },
  );
};

export const config: Config = {
  path: "/api/forecast",
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
