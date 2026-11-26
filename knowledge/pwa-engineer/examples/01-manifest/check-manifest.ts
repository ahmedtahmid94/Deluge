// Checks a manifest against MDN's installability criteria plus web.dev's recommendations.
// Run: node --experimental-strip-types check-manifest.ts manifest.webmanifest
import { readFileSync } from "node:fs";

type Icon = { src: string; sizes?: string; type?: string; purpose?: string };
type Manifest = { name?: string; short_name?: string; start_url?: string; display?: string;
  display_override?: string[]; prefer_related_applications?: boolean; icons?: Icon[]; id?: string };

export function checkManifest(m: Manifest): { errors: string[]; warnings: string[] } {
  const errors: string[] = [], warnings: string[] = [];
  const sizes = new Set((m.icons ?? []).flatMap(i => (i.sizes ?? "").split(/\s+/)));
  if (!m.name && !m.short_name) errors.push("needs name or short_name");                 // MDN
  if (!sizes.has("192x192")) errors.push("needs a 192x192 icon");                         // MDN
  if (!sizes.has("512x512")) errors.push("needs a 512x512 icon");                         // MDN
  if (!m.start_url) errors.push("needs start_url");                                       // MDN
  if (!m.display && !m.display_override) errors.push("needs display or display_override"); // MDN
  if (m.prefer_related_applications === true) errors.push("prefer_related_applications must be false/absent");
  if (m.display && m.display !== "standalone") warnings.push("iOS supports only standalone (web.dev)");
  if (m.short_name && m.short_name.length >= 12) warnings.push("short_name should be under 12 chars (web.dev)");
  if (!m.id) warnings.push("set id so the app identity survives start_url changes (web.dev)");
  if (!(m.icons ?? []).some(i => (i.purpose ?? "").split(" ").includes("maskable")))
    warnings.push("add a 512px maskable icon (web.dev)");
  return { errors, warnings };
}

const file = process.argv[2] ?? "manifest.webmanifest";
const res = checkManifest(JSON.parse(readFileSync(file, "utf8")));
console.log(JSON.stringify(res));
const bad = checkManifest({ name: "x", icons: [{ src: "a.png", sizes: "192x192" }] });
if (bad.errors.length !== 3) throw new Error("self-test failed");
if (res.errors.length) process.exit(1);
console.log("ok: manifest meets installability criteria");
