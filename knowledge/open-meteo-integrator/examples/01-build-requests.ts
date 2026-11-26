// Example 1: build Beach Day's Open-Meteo request URLs from a beach record.
// Run: node --experimental-strip-types 01-build-requests.ts
import assert from "node:assert/strict";

type Beach = { id: string; lat: number; lon: number; marineLat?: number; marineLon?: number };

const HOURLY = [
  "temperature_2m", "apparent_temperature", "precipitation_probability", "precipitation",
  "weather_code", "cloud_cover", "wind_speed_10m", "wind_gusts_10m", "wind_direction_10m",
  "uv_index", "uv_index_clear_sky", "is_day", "sunshine_duration",
];
const DAILY = ["sunrise", "sunset", "uv_index_max", "precipitation_probability_max"];
const MARINE_HOURLY = ["wave_height", "wave_period", "wave_direction", "swell_wave_height", "sea_surface_temperature"];

export function forecastUrl(b: Beach, days = 7): URL {
  const u = new URL("https://api.open-meteo.com/v1/forecast");
  u.search = new URLSearchParams({
    latitude: String(b.lat), longitude: String(b.lon),
    hourly: HOURLY.join(","), daily: DAILY.join(","),
    timezone: "America/New_York",   // required when daily is set
    timeformat: "unixtime",         // DST-safe: the docs say DST changes in range are ignored for iso8601
    temperature_unit: "fahrenheit", wind_speed_unit: "mph", precipitation_unit: "inch",
    forecast_days: String(days),    // 0-16
  }).toString();
  return u;
}

export function marineUrl(b: Beach, days = 7): URL {
  const u = new URL("https://marine-api.open-meteo.com/v1/marine");
  u.search = new URLSearchParams({
    latitude: String(b.marineLat ?? b.lat), longitude: String(b.marineLon ?? b.lon),
    hourly: MARINE_HOURLY.join(","),
    timezone: "America/New_York", timeformat: "unixtime",
    length_unit: "imperial",        // waves in ft; sea temperature stays °C (verified live)
    cell_selection: "sea", forecast_days: String(days),
  }).toString();
  return u;
}

const southBeach: Beach = { id: "south-beach", lat: 25.7826, lon: -80.13, marineLon: -80.125 };
const f = forecastUrl(southBeach);
const m = marineUrl(southBeach);
assert.equal(f.searchParams.get("timezone"), "America/New_York");
assert.equal(f.searchParams.get("hourly")?.split(",").length, HOURLY.length);
assert.equal(m.searchParams.get("cell_selection"), "sea");
assert.equal(m.searchParams.get("longitude"), "-80.125");
console.log(f.toString());
console.log(m.toString());
console.log("ok: request builders");
